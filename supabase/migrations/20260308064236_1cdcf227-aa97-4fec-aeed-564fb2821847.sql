
CREATE TABLE public.account_deletion_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletion_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion tokens"
ON public.account_deletion_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
ON public.account_deletion_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
