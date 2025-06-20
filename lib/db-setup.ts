"use server"

import { createServerSupabase } from "./supabase"

export async function setupDatabase() {
  const supabase = createServerSupabase()

  try {
    // The schemaSQL string should ideally be read from db/schema.sql
    // For now, it's updated to include the profiles table and new user trigger.
    const schemaSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (Stores additional user information)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
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
CREATE TABLE IF NOT EXISTS orders (
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
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL
);

-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
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
CREATE TABLE IF NOT EXISTS user_challenges (
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
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'user_role', 'customer')
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
  SELECT id INTO v_id FROM user_challenges
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id AND status = 'active';
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
  v_user_id := auth.uid();
  SELECT current_day, completed_days, challenge_id INTO v_current_day, v_completed_days, v_challenge_id
  FROM user_challenges
  WHERE id = p_challenge_id AND user_id = v_user_id AND status = 'active';
  IF v_current_day IS NULL THEN RETURN FALSE; END IF;
  IF v_current_day = ANY(v_completed_days) THEN RETURN FALSE; END IF;
  UPDATE user_challenges
  SET completed_days = array_append(completed_days, v_current_day),
      current_day = current_day + 1
  WHERE id = p_challenge_id;
  SELECT duration INTO v_challenge_duration
  FROM challenges
  WHERE id = v_challenge_id;
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

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- RLS Policies for products
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- RLS Policies for challenges
DROP POLICY IF EXISTS "Anyone can view challenges" ON challenges;
CREATE POLICY "Anyone can view challenges" ON challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage challenges" ON challenges;
CREATE POLICY "Admins can manage challenges" ON challenges FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- RLS Policies for cart_items
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
CREATE POLICY "Users can view their own cart items" ON cart_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
CREATE POLICY "Users can insert their own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
CREATE POLICY "Users can update their own cart items" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
CREATE POLICY "Users can delete their own cart items" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for addresses
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
CREATE POLICY "Users can view their own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
CREATE POLICY "Users can insert their own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
CREATE POLICY "Users can update their own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
CREATE POLICY "Users can delete their own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- RLS Policies for user_challenges
DROP POLICY IF EXISTS "Users can view their own challenges" ON user_challenges;
CREATE POLICY "Users can view their own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own challenges" ON user_challenges;
CREATE POLICY "Users can insert their own challenges" ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own challenges" ON user_challenges;
CREATE POLICY "Users can update their own challenges" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own challenges" ON user_challenges;
CREATE POLICY "Users can delete their own challenges" ON user_challenges FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage user_challenges" ON user_challenges;
CREATE POLICY "Admins can manage user_challenges" ON user_challenges FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
`

    // Execute the schema SQL
    // Note: Supabase's rpc('pgclient', { query: ... }) might have limitations with multi-statement SQL or certain DDL.
    // It's generally better to run complex schema changes directly via Supabase SQL editor or migrations.
    // However, for this setup script, we'll attempt it.
    const statements = schemaSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of statements) {
      // console.log("Executing SQL statement:", statement.substring(0, 100) + "..."); // Log snippet
      const { error: stmtError } = await supabase.rpc("pgclient", { query: statement })
      if (stmtError) {
        // Don't fail on "already exists" or "does not exist" for DROP/CREATE IF NOT EXISTS
        if (
          stmtError.message.includes("already exists") ||
          stmtError.message.includes("does not exist") ||
          stmtError.message.includes("must be owner of extension") || // common for uuid-ossp
          stmtError.message.includes("must be owner of function")
        ) {
          console.warn(`[db-setup] Non-critical error for statement: ${stmtError.message.split("\n")[0]}`)
        } else {
          console.error("Error executing database setup statement:", stmtError.message)
          console.error("Statement was:", statement.substring(0, 200) + "...")
          // Decide if this should be a fatal error for the setup
          // return { success: false, error: stmtError };
        }
      }
    }

    console.log("[db-setup] Database schema setup attempted.")
    return { success: true }
  } catch (error) {
    console.error("Error in setupDatabase:", error)
    return { success: false, error }
  }
}

export async function seedProducts() {
  const supabase = createServerSupabase()

  try {
    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase.from("products").select("id").limit(1)

    if (checkError) {
      console.error("Error checking existing products:", checkError)
      return { success: false, error: checkError }
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log("Database already seeded with products.")
      // return { success: true, message: "Database already seeded" }; // Keep seeding challenges if needed
    } else {
      console.log("Seeding products...")
      // Insert products
      const { error: productsError } = await supabase.from("products").insert([
        {
          name: "Pure Wheatgrass Shot",
          description:
            "Our signature pure wheatgrass shot delivers a concentrated dose of nutrients in a convenient 2oz serving. Each shot contains freshly harvested organic wheatgrass that's cold-pressed to preserve maximum nutritional value.",
          price: 4.99,
          image_url: "/vibrant-wheatgrass-shot.png",
          category: "shots",
          is_featured: true,
        },
        {
          name: "Wheatgrass Cleanse Bundle",
          description:
            "Our 3-day cleanse bundle includes 6 pure wheatgrass shots designed to reset your system and flood your body with essential nutrients. Perfect for a weekend detox or as a regular monthly cleanse.",
          price: 24.99,
          image_url: "/vibrant-wheatgrass-display.png",
          category: "bundles",
          is_featured: true,
        },
        {
          name: "Wheatgrass & Mint Fusion",
          description:
            "Our refreshing Wheatgrass & Mint Fusion combines the nutritional power of wheatgrass with the cooling, digestive benefits of organic mint. This delicious blend makes getting your daily greens a pleasure.",
          price: 5.99,
          image_url: "/vibrant-wheatgrass-mint.png",
          category: "shots",
        },
        {
          name: "Wheatgrass Daily Pack",
          description:
            "Our Wheatgrass Daily Pack provides a week's supply of our premium wheatgrass shots. Each pack contains 7 individual 2oz shots, perfect for maintaining your daily wellness routine.",
          price: 19.99,
          image_url: "/vibrant-wheatgrass-display.png",
          category: "bundles",
          is_featured: true,
        },
        {
          name: "Wheatgrass & Lemon Elixir",
          description:
            "Our Wheatgrass & Lemon Elixir combines the nutritional benefits of wheatgrass with the detoxifying properties of lemon. This zesty blend is perfect for morning consumption to kickstart your metabolism.",
          price: 5.99,
          image_url: "/vibrant-wheatgrass-lemon.png",
          category: "shots",
          is_featured: true,
        },
        {
          name: "Wheatgrass Grow Kit",
          description:
            "Our Wheatgrass Grow Kit allows you to grow your own fresh wheatgrass at home. The kit includes organic wheatgrass seeds, growing trays, organic soil, and comprehensive instructions for successful cultivation.",
          price: 29.99,
          image_url: "/vibrant-wheatgrass-kit.png",
          category: "accessories",
        },
        {
          name: "Premium Juicer",
          description:
            "Our Premium Juicer is specially designed for extracting juice from wheatgrass and other leafy greens. This cold-press masticating juicer preserves enzymes and nutrients for maximum health benefits.",
          price: 89.99,
          image_url: "/vibrant-wheatgrass-juice.png",
          category: "accessories",
        },
        {
          name: "Wheatgrass & Ginger Boost",
          description:
            "Our Wheatgrass & Ginger Boost combines the nutritional power of wheatgrass with the warming, anti-inflammatory properties of ginger. This energizing shot is perfect for supporting immune health.",
          price: 5.99,
          image_url: "/vibrant-wheatgrass-ginger.png",
          category: "shots",
        },
        {
          name: "Monthly Subscription Box",
          description:
            "Our Monthly Subscription Box delivers a curated selection of our premium wheatgrass products to your door every month. Each box includes a mix of pure shots, flavor fusions, and seasonal specials.",
          price: 49.99,
          image_url: "/vibrant-wheatgrass-delivery.png",
          category: "bundles",
          is_featured: true,
        },
      ])

      if (productsError) {
        console.error("Error seeding products:", productsError)
        return { success: false, error: productsError }
      }
      console.log("Products seeded successfully!")
    }

    // Get the inserted products to reference their IDs
    const { data: products, error: fetchError } = await supabase.from("products").select("*")

    if (fetchError || !products) {
      console.error("Failed to retrieve products after insertion:", fetchError)
      return { success: false, error: fetchError || new Error("Failed to retrieve products") }
    }

    // Find product IDs by name
    const findProductId = (name: string) => {
      const product = products.find((p) => p.name === name)
      return product ? product.id : null
    }

    // Check if challenges already exist
    const { data: existingChallenges, error: challengesCheckError } = await supabase
      .from("challenges")
      .select("id")
      .limit(1)

    if (challengesCheckError) {
      console.error("Error checking existing challenges:", challengesCheckError)
      return { success: false, error: challengesCheckError }
    }

    if (existingChallenges && existingChallenges.length > 0) {
      console.log("Database already seeded with challenges.")
    } else {
      console.log("Seeding challenges...")
      // Insert challenges
      const { error: challengesError } = await supabase.from("challenges").insert([
        {
          title: "7-Day Starter Challenge",
          slug: "7-day-starter",
          description:
            "Perfect for beginners, this 7-day challenge introduces you to the benefits of daily wheatgrass consumption. Experience increased energy, improved digestion, and the beginning of detoxification.",
          duration: 7,
          product_id: findProductId("Wheatgrass Daily Pack") || 4, // Fallback ID if not found
          image_url: "/vibrant-wheatgrass-display.png",
          is_featured: true,
        },
        {
          title: "21-Day Transformation Challenge",
          slug: "21-day-transformation",
          description:
            "Take your health to the next level with our 21-day challenge. This three-week commitment allows your body to experience deeper detoxification and more profound health benefits from consistent wheatgrass consumption.",
          duration: 21,
          product_id: findProductId("Monthly Subscription Box") || 9, // Fallback ID
          image_url: "/vibrant-wheatgrass-delivery.png",
          is_featured: true,
        },
        {
          title: "30-Day Wellness Revolution",
          slug: "30-day-wellness-revolution",
          description:
            "Our most comprehensive challenge, the 30-Day Wellness Revolution, transforms wheatgrass consumption into a lifestyle habit. Experience the full spectrum of benefits as your body undergoes complete cellular renewal.",
          duration: 30,
          product_id: findProductId("Monthly Subscription Box") || 9, // Fallback ID
          image_url: "/vibrant-wheatgrass-delivery.png",
        },
      ])

      if (challengesError) {
        console.error("Error seeding challenges:", challengesError)
        return { success: false, error: challengesError }
      }
      console.log("Challenges seeded successfully!")
    }

    return { success: true }
  } catch (error) {
    console.error("Error in seedProducts:", error)
    return { success: false, error }
  }
}
