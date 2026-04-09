import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error('DATABASE_URL is required');
}

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/server/db/schema.ts',
	out: './src/lib/server/db/migrations',
	dbCredentials: {
		url: dbUrl,
		ssl:
			process.env.NODE_ENV === 'production'
				? {
						rejectUnauthorized: false
					}
				: false
	}
});
