-- Stored procedure to calculate average rating
CREATE OR REPLACE FUNCTION get_average_rating()
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT AVG(rating) INTO avg_rating FROM customer_feedback;
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to get counts by rating
CREATE OR REPLACE FUNCTION get_rating_counts()
RETURNS TABLE(rating INTEGER, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.rating,
    COUNT(*) as count
  FROM 
    customer_feedback f
  GROUP BY 
    f.rating
  ORDER BY 
    f.rating;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to execute raw SQL (use with caution)
CREATE OR REPLACE FUNCTION execute_sql(query text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE format('SELECT jsonb_agg(t) FROM (%s) t', query)
  INTO result
  USING params;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;