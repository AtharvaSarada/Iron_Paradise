-- Iron Paradise Gym Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (will be linked to auth.users via RLS and application logic)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'member', 'user')) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Packages table (must be before members)
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  duration TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Members table (after packages)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  photo_url TEXT,
  emergency_contact TEXT,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  membership_expiry DATE,
  status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bills table (after members)
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'overdue')) NOT NULL DEFAULT 'pending',
  package_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high')) NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notification reads (many-to-many)
CREATE TABLE notification_reads (
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (notification_id, member_id)
);

-- Supplements table
CREATE TABLE supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  stock_level INTEGER NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Diets table
CREATE TABLE diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  meals JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories INTEGER NOT NULL CHECK (total_calories > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Diet assignments (many-to-many)
CREATE TABLE diet_assignments (
  diet_id UUID REFERENCES diets(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (diet_id, member_id)
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_package_id ON members(package_id);
CREATE INDEX idx_bills_member_id ON bills(member_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically mark bills as overdue
CREATE OR REPLACE FUNCTION check_overdue_bills()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark bills as overdue if due_date has passed and status is pending
  UPDATE bills
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
    AND status = 'pending';

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for overdue bills (runs on schedule or on bill creation/update)
CREATE TRIGGER trigger_overdue_bills
  AFTER INSERT OR UPDATE ON bills
  FOR EACH STATEMENT EXECUTE FUNCTION check_overdue_bills();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- NOTE: Auth triggers must be created through Supabase Dashboard → Database → Triggers
-- Create a trigger with the following SQL in the dashboard:
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, full_name, role)
--   VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to get user role from JWT (create this in dashboard too)
-- CREATE OR REPLACE FUNCTION auth.user_role()
-- RETURNS TEXT AS $$
-- BEGIN
--   RETURN COALESCE(
--     current_setting('request.jwt.claims', true)::json->>'role',
--     (SELECT role FROM profiles WHERE id = auth.uid())
--   );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles" ON profiles
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Members policies
CREATE POLICY "Members can view own data" ON members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Members can update own data" ON members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all members" ON members
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Packages policies (read-only for members and public)
CREATE POLICY "Everyone can view packages" ON packages
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage packages" ON packages
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Bills policies
CREATE POLICY "Members can view own bills" ON bills
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all bills" ON bills
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Notifications policies
CREATE POLICY "Everyone can view notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage notifications" ON notifications
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Notification reads policies
CREATE POLICY "Members can view own notification reads" ON notification_reads
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create own notification reads" ON notification_reads
  FOR INSERT WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage notification reads" ON notification_reads
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Supplements policies
CREATE POLICY "Everyone can view supplements" ON supplements
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage supplements" ON supplements
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Diets policies
CREATE POLICY "Members can view assigned diets" ON diets
  FOR SELECT USING (
    id IN (
      SELECT diet_id FROM diet_assignments
      WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Everyone can view diets" ON diets
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage diets" ON diets
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Diet assignments policies
CREATE POLICY "Members can view own assignments" ON diet_assignments
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage assignments" ON diet_assignments
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Activity logs policies
CREATE POLICY "Users can view own logs" ON activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can view all logs" ON activity_logs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "System can insert logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Insert sample data for testing
-- Create admin user (you'll need to update this with actual user ID after signup)
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES ('your-admin-user-id', 'admin@ironparadise.com', 'System Admin', 'admin');

-- Sample packages
INSERT INTO packages (name, duration, price, features, is_popular) VALUES
('Basic Monthly', 'monthly', 49.99, '["Gym Access", "Locker Room", "Basic Equipment"]', false),
('Premium Monthly', 'monthly', 79.99, '["Full Gym Access", "Personal Trainer", "Nutrition Plan", "Sauna Access"]', true),
('VIP Quarterly', 'quarterly', 199.99, '["All Premium Features", "Unlimited Classes", "Massage Therapy", "Supplements Discount"]', false);
