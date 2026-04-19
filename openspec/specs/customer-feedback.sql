-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop table if it exists
DROP TABLE IF EXISTS customer_feedback;

-- Create customer_feedback table
CREATE TABLE customer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Customer Details (Optional as it can be anonymous)
  name TEXT,
  email TEXT,
  gender TEXT,
  age_group TEXT,
  
  -- Feedback Data
  rating TEXT NOT NULL CHECK (rating IN ('sad', 'neutral', 'happy')),
  review TEXT,
  
  -- Categorization & Dimensions
  category TEXT,
  section TEXT,
  branch TEXT,
  product TEXT,
  
  -- Security / Anti-spam tracking
  device_ip TEXT -- Useful for the 2-hour submission rate limit
);

-- =====================================
-- PERFORMANCE INDEXES (NFR-04)
-- =====================================
CREATE INDEX idx_customer_feedback_created_at ON customer_feedback(created_at);
CREATE INDEX idx_customer_feedback_rating ON customer_feedback(rating);
CREATE INDEX idx_customer_feedback_category ON customer_feedback(category);

-- =====================================
-- ROW LEVEL SECURITY (RLS) (NFR-06)
-- =====================================
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- 1. Public Insertion: Anyone can insert feedback (e.g., from QR Code)
CREATE POLICY "Allow public insert for feedback" 
ON customer_feedback
FOR INSERT 
TO public
WITH CHECK (true);

-- 2. Authenticated Read: Only logged-in users (admins/supervisors) can view feedback
CREATE POLICY "Allow select for authenticated users" 
ON customer_feedback
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Authenticated Update: Admins can update records if necessary
CREATE POLICY "Allow update for authenticated users" 
ON customer_feedback
FOR UPDATE 
TO authenticated 
USING (true);

-- 4. Authenticated Delete: Admins can delete records
CREATE POLICY "Allow delete for authenticated users" 
ON customer_feedback
FOR DELETE 
TO authenticated 
USING (true);

-- =====================================
-- SAMPLE DATA INSERTION
-- =====================================
INSERT INTO customer_feedback (name, email, gender, age_group, rating, review, category, section, branch, product)
VALUES 
  ('Alice Johnson', 'alice@example.com', 'Female', '25-34', 'happy', 'Loved the fast service!', 'Service', 'Checkout', 'Downtown', 'N/A'),
  ('Bob Smith', 'bob@example.com', 'Male', '35-44', 'neutral', 'It was okay, nothing special.', 'Product', 'Aisle 4', 'Uptown', 'Widget X'),
  (NULL, NULL, 'Other', '18-24', 'sad', 'Wait time was too long.', 'Wait Time', 'Customer Service', 'Mall Branch', 'N/A');
