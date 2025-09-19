-- Migration for time-zone aware notification system

-- 1. Add timezone column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- 2. Create daily_submissions table
CREATE TABLE IF NOT EXISTS daily_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INT REFERENCES challenges(id),
  submission_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, submission_date)
);

-- 3. Create scheduled_notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'reminder' or 'fun_fact'
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create trigger function for tracking submissions
CREATE OR REPLACE FUNCTION track_daily_submission()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_submissions (user_id, challenge_id, submission_date)
  VALUES (NEW.user_id, NEW.challenge_id, CURRENT_DATE)
  ON CONFLICT (user_id, submission_date) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS submission_tracking_trigger
  AFTER INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION track_daily_submission();

-- 5. Create helper functions

-- Function to get users needing reminders at current time
CREATE OR REPLACE FUNCTION get_users_needing_reminders()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  timezone TEXT,
  last_submission_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as user_id,
    u.username,
    u.timezone,
    ds.submission_date as last_submission_date
  FROM users u
  LEFT JOIN daily_submissions ds ON u.id = ds.user_id
    AND ds.submission_date = CURRENT_DATE
  WHERE ds.id IS NULL; -- No submission today
END;
$$;

-- Function to get today's fun fact
CREATE OR REPLACE FUNCTION get_todays_fun_fact()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  fun_fact TEXT;
BEGIN
  -- Placeholder implementation - would need a fun_facts table
  fun_fact := 'Did you know? Photography was invented in 1826 by Joseph Nicéphore Niépce!';
  RETURN fun_fact;
END;
$$;

-- Function to check if user has submitted today
CREATE OR REPLACE FUNCTION check_user_submitted_today(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM daily_submissions
    WHERE user_id = p_user_id AND submission_date = CURRENT_DATE
  );
END;
$$;