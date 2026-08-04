-- Add 'superadmin' to allowed payment routes
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_payment_route_check;
ALTER TABLE donations ADD CONSTRAINT donations_payment_route_check CHECK (payment_route IN ('standard', 'superadmin'));

ALTER TABLE checkout_events DROP CONSTRAINT IF EXISTS checkout_events_payment_route_check;
ALTER TABLE checkout_events ADD CONSTRAINT checkout_events_payment_route_check CHECK (payment_route IN ('standard', 'superadmin'));

-- Add super_approved column to donations
ALTER TABLE donations ADD COLUMN IF NOT EXISTS super_approved BOOLEAN NOT NULL DEFAULT false;

-- Add super_admin role
ALTER TABLE admin_profiles DROP CONSTRAINT IF EXISTS admin_profiles_role_check;
ALTER TABLE admin_profiles ADD CONSTRAINT admin_profiles_role_check CHECK (role IN ('admin', 'super_admin'));

-- Schema changes only. User will be created via Supabase dashboard.
