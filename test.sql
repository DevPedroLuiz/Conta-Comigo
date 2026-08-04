DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'transactions'::regclass
      AND contype = 'c'
      AND conname LIKE '%type%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE transactions DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;
