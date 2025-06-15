-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (Stores additional user information)
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to auth.users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' -- Default role for new users
);
COMMENT ON TABLE profiles IS 'Profile information for users, extending auth.users.';
COMMENT ON COLUMN profiles.id IS 'References the internal Supabase auth user id.';
COMMENT ON COLUMN profiles.role IS 'User role, e.g., customer, admin.';

-- Products Table
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 100,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Cart Items Table
DROP TABLE IF EXISTS cart_items CASCADE;
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Addresses Table
DROP TABLE IF EXISTS addresses CASCADE;
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

-- Orders Table
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL
);

-- Order Items Table
DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL
);

-- Challenges Table
DROP TABLE IF EXISTS challenges CASCADE;
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE
);

-- User Challenges Table
DROP TABLE IF EXISTS user_challenges CASCADE;
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on user_challenges
DROP TRIGGER IF EXISTS set_user_challenges_updated_at ON user_challenges;
CREATE TRIGGER set_user_challenges_updated_at
BEFORE UPDATE ON user_challenges
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Create trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Function to create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name', -- Attempt to get full_name from metadata if provided during signup
    NEW.raw_user_meta_data->>'avatar_url', -- Attempt to get avatar_url from metadata
    COALESCE(NEW.raw_app_meta_data->>'user_role', 'customer') -- Use role from metadata or default to 'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile for new users.';


-- Trigger to call handle_new_user on new user creation in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to join a challenge
CREATE OR REPLACE FUNCTION join_challenge(p_user_id UUID, p_challenge_id INTEGER)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Check if user already has an active challenge with this ID
  SELECT id INTO v_id FROM user_challenges
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id AND status = 'active';

  -- If not found, create a new challenge
  IF v_id IS NULL THEN
    INSERT INTO user_challenges (user_id, challenge_id)
    VALUES (p_user_id, p_challenge_id)
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check in for a challenge
CREATE OR REPLACE FUNCTION challenge_check_in(p_challenge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_current_day INTEGER;
  v_challenge_duration INTEGER;
  v_completed_days INTEGER[];
  v_challenge_id INTEGER;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  -- Get the challenge details
  SELECT current_day, completed_days, challenge_id INTO v_current_day, v_completed_days, v_challenge_id
  FROM user_challenges
  WHERE id = p_challenge_id AND user_id = v_user_id AND status = 'active';

  -- If challenge not found or not active, return false
  IF v_current_day IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if already checked in for current day
  IF v_current_day = ANY(v_completed_days) THEN
    RETURN FALSE;
  END IF;

  -- Update the challenge with the check-in
  UPDATE user_challenges
  SET completed_days = array_append(completed_days, v_current_day),
      current_day = current_day + 1
  WHERE id = p_challenge_id;

  -- Get the challenge duration
  SELECT duration INTO v_challenge_duration
  FROM challenges
  WHERE id = v_challenge_id;

  -- If all days completed, mark as completed
  IF array_length(v_completed_days, 1) + 1 >= v_challenge_duration THEN
    UPDATE user_challenges
    SET status = 'completed'
    WHERE id = p_challenge_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
  -- Consider restricting which columns can be updated, e.g., full_name, avatar_url, but not role by regular users.
  -- Example: WITH CHECK (auth.uid() = id AND (NEW.role = OLD.role OR OLD.role IS NULL))

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL -- SELECT, INSERT, UPDATE, DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));


-- RLS Policies for products
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL -- SELECT, INSERT, UPDATE, DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));


-- RLS Policies for challenges
DROP POLICY IF EXISTS "Anyone can view challenges" ON challenges;
CREATE POLICY "Anyone can view challenges"
  ON challenges FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admins can manage challenges" ON challenges;
CREATE POLICY "Admins can manage challenges"
  ON challenges FOR ALL -- SELECT, INSERT, UPDATE, DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));


-- RLS Policies for cart_items
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for addresses
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
CREATE POLICY "Users can view their own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
CREATE POLICY "Users can insert their own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
CREATE POLICY "Users can update their own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
CREATE POLICY "Users can delete their own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));
-- Note: Admin update/delete of orders might need more specific policies or be handled via SECURITY DEFINER functions.


-- RLS Policies for order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
CREATE POLICY "Anyone can insert order items" -- This is broad, usually order items are inserted via a trusted process (e.g. server action, trigger)
  ON order_items FOR INSERT
  WITH CHECK (true); -- Consider making this more restrictive or rely on server-side logic.

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));


-- RLS Policies for user_challenges
DROP POLICY IF EXISTS "Users can view their own challenges" ON user_challenges;
CREATE POLICY "Users can view their own challenges"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own challenges" ON user_challenges;
CREATE POLICY "Users can insert their own challenges"
  ON user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own challenges" ON user_challenges;
CREATE POLICY "Users can update their own challenges"
  ON user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own challenges" ON user_challenges;
CREATE POLICY "Users can delete their own challenges"
  ON user_challenges FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage user_challenges" ON user_challenges;
CREATE POLICY "Admins can manage user_challenges"
  ON user_challenges FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));
