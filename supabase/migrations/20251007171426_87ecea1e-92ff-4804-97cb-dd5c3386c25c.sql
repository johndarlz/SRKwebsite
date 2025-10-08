-- Create dishes table
CREATE TABLE public.dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Sweets', 'Beverages')),
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('university', 'address')),
  delivery_details JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Cooking', 'Out for Delivery', 'Delivered')),
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for dishes (public read, admin write)
CREATE POLICY "Anyone can view dishes"
  ON public.dishes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert dishes"
  ON public.dishes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dishes"
  ON public.dishes FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete dishes"
  ON public.dishes FOR DELETE
  USING (true);

-- Policies for orders (public insert, admin read/update)
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own orders by order_id"
  ON public.orders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON public.orders FOR UPDATE
  USING (true);

-- Insert sample dishes
INSERT INTO public.dishes (name, category, price, image_url, description) VALUES
('Masala Dosa', 'Breakfast', 80.00, 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800', 'Crispy rice crepe with spiced potato filling'),
('Idli Sambar', 'Breakfast', 60.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', 'Steamed rice cakes with lentil curry'),
('Medu Vada', 'Breakfast', 50.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', 'Crispy lentil donuts'),
('Hyderabadi Biryani', 'Lunch', 180.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 'Aromatic rice with spiced chicken'),
('Chettinad Chicken', 'Lunch', 200.00, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800', 'Spicy chicken curry from Tamil Nadu'),
('Fish Curry', 'Dinner', 220.00, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800', 'Tangy Kerala-style fish curry'),
('Gulab Jamun', 'Sweets', 40.00, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800', 'Sweet milk dumplings in sugar syrup'),
('Mysore Pak', 'Sweets', 50.00, 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800', 'Traditional Karnataka sweet'),
('Filter Coffee', 'Beverages', 30.00, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800', 'Authentic South Indian filter coffee'),
('Masala Chai', 'Beverages', 25.00, 'https://images.unsplash.com/photo-1597318112874-f58cd0d2893e?w=800', 'Spiced Indian tea');