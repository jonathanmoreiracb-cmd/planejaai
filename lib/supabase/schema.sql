-- Create lesson_plans table
CREATE TABLE IF NOT EXISTS lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  duration TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Users can insert their own lesson plans" ON lesson_plans;
DROP POLICY IF EXISTS "Users can read their own lesson plans" ON lesson_plans;
DROP POLICY IF EXISTS "Users can update their own lesson plans" ON lesson_plans;
DROP POLICY IF EXISTS "Users can delete their own lesson plans" ON lesson_plans;

-- Create policies for RLS
CREATE POLICY "Users can insert their own lesson plans" 
  ON lesson_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own lesson plans" 
  ON lesson_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson plans" 
  ON lesson_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson plans" 
  ON lesson_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster querying by user and creation date
CREATE INDEX IF NOT EXISTS idx_lesson_plans_user_id ON lesson_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_created_at ON lesson_plans(created_at DESC);


-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  price_id TEXT,
  plan_tier TEXT NOT NULL DEFAULT 'free',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
DROP POLICY IF EXISTS "Users can read their own subscription" ON subscriptions;
CREATE POLICY "Users can read their own subscription" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Indexing for user ID searches
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
