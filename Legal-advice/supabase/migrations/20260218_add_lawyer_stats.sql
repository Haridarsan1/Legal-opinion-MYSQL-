-- Add rating stats to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS average_rating FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create index for faster sorting/filtering
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_reviews ON profiles(total_reviews DESC);
