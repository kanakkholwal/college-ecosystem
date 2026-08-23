import { SQL } from "bun";

// Better Auth 1.7 scopes account identity by (issuer, accountId). Values must match
// createLocalAccountIssuer("credential") and the Google provider's accountIssuer.
const CREDENTIAL_ISSUER = "local:credential";
const GOOGLE_ISSUER = "https://accounts.google.com";

type Mode = "check" | "apply" | "rollback";

const MODES: Mode[] = ["check", "apply", "rollback"];

function parseArgs() {
  const argv = process.argv.slice(2);
  const mode = (argv.find((a) => !a.startsWith("-")) ?? "check") as Mode;
  if (!MODES.includes(mode)) {
    throw new Error(`Unknown mode "${mode}". Use one of: ${MODES.join(", ")}`);
  }
  const restoreFrom = argv.find((a) => a.startsWith("--from="))?.slice(7);
  return { mode, yes: argv.includes("--yes"), restoreFrom };
}

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

function redact(url: string) {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

async function hasIssuerColumn(sql: SQL) {
  const rows = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'issuer'
  `;
  return rows.length > 0;
}

async function report(sql: SQL) {
  const hasIssuer = await hasIssuerColumn(sql);
  const [{ total }] = await sql`SELECT count(*)::int AS total FROM accounts`;
  const byProvider = await sql`
    SELECT "providerId", count(*)::int AS n FROM accounts GROUP BY 1 ORDER BY 2 DESC
  `;
  // Rewritten by the migration, so it is the one destructive step to eyeball.
  const mismatched = await sql`
    SELECT "id", "accountId", "userId" FROM accounts
    WHERE "providerId" = 'credential' AND "accountId" <> "userId"
  `;
  // Would abort the unique index; surfaced before anything is written.
  const collisions = await sql`
    SELECT "providerId", "accountId", count(*)::int AS n
    FROM accounts GROUP BY 1, 2 HAVING count(*) > 1
  `;
  const orphans = await sql`
    SELECT count(*)::int AS n FROM accounts a
    LEFT JOIN users u ON u.id = a."userId" WHERE u.id IS NULL
  `;

  console.log(`issuer column present : ${hasIssuer}`);
  console.log(`accounts rows         : ${total}`);
  for (const r of byProvider) console.log(`  ${r.providerId}: ${r.n}`);
  console.log(`accountId rewrites    : ${mismatched.length}`);
  for (const r of mismatched.slice(0, 20)) {
    console.log(`  ${r.id}: ${r.accountId} -> ${r.userId}`);
  }
  if (mismatched.length > 20) {
    console.log(`  ... and ${mismatched.length - 20} more`);
  }
  console.log(`unique collisions     : ${collisions.length}`);
  for (const r of collisions) {
    console.log(`  ${r.providerId} / ${r.accountId} x${r.n}`);
  }
  console.log(`orphaned accounts     : ${orphans[0].n}`);

  return { hasIssuer, total, mismatched: mismatched.length, collisions };
}

async function listBackups(sql: SQL) {
  return await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_name LIKE 'accounts_backup_%' ORDER BY table_name DESC
  `;
}

async function apply(sql: SQL, yes: boolean) {
  const state = await report(sql);
  console.log("");

  if (state.collisions.length > 0) {
    throw new Error(
      `${state.collisions.length} duplicate (providerId, accountId) pairs would abort the unique index. Resolve them first; nothing was written.`
    );
  }
  if (state.hasIssuer) {
    console.log("issuer column already present — nothing to do.");
    return;
  }
  if (!yes) {
    console.log("Dry run complete. Re-run with --yes to apply.");
    return;
  }

  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const backup = `accounts_backup_${stamp}`;

  // Backup outside the transaction so it survives a rollback of the migration.
  await sql`SELECT * INTO ${sql(backup)} FROM accounts`;
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM ${sql(backup)}`;
  if (n !== state.total) {
    throw new Error(`Backup copied ${n} of ${state.total} rows; aborting.`);
  }
  console.log(`backup: ${backup} (${n} rows)`);

  await sql.begin(async (tx) => {
    await tx`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS issuer text`;
    await tx`UPDATE accounts SET issuer = ${CREDENTIAL_ISSUER} WHERE issuer IS NULL AND "providerId" = 'credential'`;
    await tx`UPDATE accounts SET issuer = ${GOOGLE_ISSUER} WHERE issuer IS NULL AND "providerId" = 'google'`;
    await tx`UPDATE accounts SET issuer = 'local:oauth:' || "providerId" WHERE issuer IS NULL`;
    await tx`UPDATE accounts SET "accountId" = "userId" WHERE "providerId" = 'credential' AND "accountId" <> "userId"`;

    const [{ nulls }] =
      await tx`SELECT count(*)::int AS nulls FROM accounts WHERE issuer IS NULL`;
    if (nulls > 0) throw new Error(`${nulls} rows still have a null issuer`);

    const [{ after }] =
      await tx`SELECT count(*)::int AS after FROM accounts`;
    if (after !== state.total) {
      throw new Error(`Row count changed ${state.total} -> ${after}`);
    }

    await tx`ALTER TABLE accounts ALTER COLUMN issuer SET NOT NULL`;
    await tx`CREATE UNIQUE INDEX IF NOT EXISTS "accounts_issuer_accountId_uidx" ON accounts (issuer, "accountId")`;
  });

  console.log("");
  console.log("migration applied:");
  await report(sql);
  console.log("");
  console.log(`rollback with: bun run db:issuer:rollback --from=${backup} --yes`);
}

async function rollback(sql: SQL, from: string | undefined, yes: boolean) {
  const backups = await listBackups(sql);
  if (backups.length === 0) throw new Error("No accounts_backup_* table found.");

  const target = from ?? backups[0].table_name;
  if (!backups.some((b: { table_name: string }) => b.table_name === target)) {
    throw new Error(
      `Backup "${target}" not found. Available: ${backups.map((b: { table_name: string }) => b.table_name).join(", ")}`
    );
  }

  const [{ n }] = await sql`SELECT count(*)::int AS n FROM ${sql(target)}`;
  console.log(`restoring accounts from ${target} (${n} rows)`);
  if (!yes) {
    console.log("Dry run. Re-run with --yes to restore.");
    return;
  }

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = ${target} ORDER BY ordinal_position
  `;
  const colList = cols
    .map((c: { column_name: string }) => `"${c.column_name}"`)
    .join(", ");

  await sql.begin(async (tx) => {
    await tx`DROP INDEX IF EXISTS "accounts_issuer_accountId_uidx"`;
    // Dropped before the insert: the backup has no issuer column, so the NOT NULL
    // constraint would reject every restored row.
    await tx`ALTER TABLE accounts DROP COLUMN IF EXISTS issuer`;
    // Restores the pre-migration accountId values, not just the dropped column.
    await tx`DELETE FROM accounts`;
    await tx.unsafe(
      `INSERT INTO accounts (${colList}) SELECT ${colList} FROM "${target}"`
    );

    const [{ restored }] =
      await tx`SELECT count(*)::int AS restored FROM accounts`;
    if (restored !== n) {
      throw new Error(`Restored ${restored} of ${n} rows`);
    }
  });

  console.log("restored.");
  await report(sql);
}

async function main() {
  const { mode, yes, restoreFrom } = parseArgs();
  const url = requireDatabaseUrl();
  console.log(`database: ${redact(url)}`);
  console.log(`mode    : ${mode}${yes ? " (writing)" : " (dry run)"}`);
  console.log("");

  const sql = new SQL(url);
  try {
    if (mode === "check") await report(sql);
    else if (mode === "apply") await apply(sql, yes);
    else await rollback(sql, restoreFrom, yes);
  } finally {
    await sql.close();
  }
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
