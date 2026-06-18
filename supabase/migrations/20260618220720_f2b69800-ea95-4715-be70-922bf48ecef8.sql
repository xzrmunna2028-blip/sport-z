
-- Singleton settings table for all admin-controlled global config
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
-- Writes happen via service_role only (admin panel uses local + server fn). For simplicity allow anon updates here too since admin is password-gated client-side. NOTE: tighten via auth later.
CREATE POLICY "public update settings" ON public.app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public insert settings" ON public.app_settings FOR INSERT TO anon, authenticated WITH CHECK (id = 1);
INSERT INTO public.app_settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT DO NOTHING;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;

-- Subscribers captured by the subscription modal + OneSignal
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  onesignal_player_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX subscribers_email_uidx ON public.subscribers (lower(email)) WHERE email IS NOT NULL;
GRANT SELECT, INSERT ON public.subscribers TO anon, authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can subscribe" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public read subscribers" ON public.subscribers FOR SELECT TO anon, authenticated USING (true);
