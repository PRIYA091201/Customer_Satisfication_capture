-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS customer_feedback;

-- Create customer_feedback table
CREATE TABLE customer_feedback (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create health_check table for connection testing
CREATE TABLE health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'OK',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a row into health_check for connection testing
INSERT INTO health_check (status) VALUES ('OK');

-- Create a row level security policy
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow select for authenticated users" ON customer_feedback
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON customer_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON customer_feedback
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated users" ON customer_feedback
  FOR DELETE USING (true);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_feedback_timestamp
BEFORE UPDATE ON customer_feedback
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Insert sample data (optional)
INSERT INTO customer_feedback (customer_name, rating, comments)
VALUES 
  ('John Doe', 5, 'Excellent service!'),
  ('Jane Smith', 4, 'Good product but delivery was a bit late'),
  ('Mike Johnson', 3, 'Average experience'),
  ('Sarah Williams', 5, 'Very satisfied with the customer support');