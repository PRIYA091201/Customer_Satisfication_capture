-- Migration: Add feedback metadata columns
-- Created at: 2026-04-19T12:00:00Z

-- Add metadata columns to customer_feedback table
ALTER TABLE customer_feedback 
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS device_info JSONB,
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON customer_feedback(user_id);

-- Create index on rating for statistics queries
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON customer_feedback(rating);

-- Update the stored procedure for more detailed stats
CREATE OR REPLACE FUNCTION get_feedback_stats(days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH stats AS (
    SELECT 
      AVG(rating) AS average_rating,
      COUNT(*) AS total_count,
      COUNT(DISTINCT user_id) AS unique_users,
      SUM(CASE WHEN is_anonymous THEN 1 ELSE 0 END) AS anonymous_count,
      jsonb_object_agg(
        r.rating, 
        r.count
      ) AS ratings_distribution
    FROM 
      customer_feedback cf,
      LATERAL (
        SELECT rating, COUNT(*) AS count
        FROM customer_feedback
        WHERE rating = cf.rating
        AND created_at >= NOW() - (days || ' days')::INTERVAL
        GROUP BY rating
      ) r
    WHERE 
      cf.created_at >= NOW() - (days || ' days')::INTERVAL
    GROUP BY r.rating
  )
  SELECT 
    json_build_object(
      'average_rating', stats.average_rating,
      'total_count', stats.total_count,
      'unique_users', stats.unique_users,
      'anonymous_count', stats.anonymous_count,
      'ratings_distribution', stats.ratings_distribution,
      'period_days', days
    ) INTO result
  FROM stats;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;