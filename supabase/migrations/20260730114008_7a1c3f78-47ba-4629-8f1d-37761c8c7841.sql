CREATE TABLE public.estudo_estado (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  dados JSONB NOT NULL DEFAULT '{}'::jsonb,
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudo_estado TO authenticated;
GRANT ALL ON public.estudo_estado TO service_role;

ALTER TABLE public.estudo_estado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario gerencia seu proprio estado"
  ON public.estudo_estado FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);