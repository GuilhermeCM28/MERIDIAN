-- Drop the existing constraint dynamically
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.transactions'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%type%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.transactions DROP CONSTRAINT ' || r.conname;
    END LOOP;
END $$;

-- Add the new constraint
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'investment'));

-- Convert old 'Investimentos' transactions from expense to investment
UPDATE public.transactions
SET type = 'investment'
WHERE type = 'expense'
  AND category_id IN (
    SELECT id FROM public.categories WHERE name = 'Investimentos'
  );
