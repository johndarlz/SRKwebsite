-- Create storage bucket for dish images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for dish images
CREATE POLICY "Anyone can view dish images"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can upload dish images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can update dish images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can delete dish images"
ON storage.objects FOR DELETE
USING (bucket_id = 'dish-images');

-- Add in_stock column to dishes table
ALTER TABLE public.dishes 
ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true;

-- Create shop_settings table for open/close status
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_open boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on shop_settings
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for shop_settings
CREATE POLICY "Anyone can view shop settings"
ON public.shop_settings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update shop settings"
ON public.shop_settings FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can insert shop settings"
ON public.shop_settings FOR INSERT
WITH CHECK (true);

-- Insert default shop settings
INSERT INTO public.shop_settings (is_open)
VALUES (true)
ON CONFLICT DO NOTHING;