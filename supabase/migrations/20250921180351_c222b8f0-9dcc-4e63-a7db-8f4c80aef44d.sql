-- Create function to increment user XP
CREATE OR REPLACE FUNCTION increment_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE user_progress 
  SET total_xp = total_xp + xp_amount 
  WHERE user_progress.user_id = increment_user_xp.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;