-- 0003 already dropped the "hostelId" default; this only clears legacy non-ObjectId values like 'not_specified'.
UPDATE "users" SET "hostelId" = NULL WHERE "hostelId" IS NOT NULL AND "hostelId" !~ '^[a-fA-F0-9]{24}$';
