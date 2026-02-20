-- Add missing profile fields used by client and lawyer profile pages

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS in_app_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_in_listings BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accept_new_requests BOOLEAN DEFAULT true;

COMMENT ON COLUMN profiles.address_line IS 'Primary address line for client profile';
COMMENT ON COLUMN profiles.city IS 'City for client profile';
COMMENT ON COLUMN profiles.state IS 'State or region for client profile';
COMMENT ON COLUMN profiles.country IS 'Country for client profile';
COMMENT ON COLUMN profiles.postal_code IS 'Postal or ZIP code for client profile';
COMMENT ON COLUMN profiles.email_notifications IS 'Email notification preference';
COMMENT ON COLUMN profiles.in_app_notifications IS 'In-app notification preference';
COMMENT ON COLUMN profiles.language IS 'Preferred UI language';
COMMENT ON COLUMN profiles.timezone IS 'Preferred timezone';
COMMENT ON COLUMN profiles.show_in_listings IS 'Lawyer profile visibility in listings';
COMMENT ON COLUMN profiles.accept_new_requests IS 'Lawyer accepting new consultation requests';
