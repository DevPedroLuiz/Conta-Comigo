-- Add color and icon to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
