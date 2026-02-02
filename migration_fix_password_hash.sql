-- Migration: Make password_hash nullable in users table
-- Since Supabase Auth manages passwords, we don't need to store them in the custom users table

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Verify the column constraint is updated
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password_hash';
