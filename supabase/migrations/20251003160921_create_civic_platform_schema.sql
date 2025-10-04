/*
  # Civic Engagement Platform Schema

  ## Overview
  Complete database schema for a civic engagement platform where citizens can
  report issues, vote on initiatives, engage with their community, and track
  local government activities.

  ## New Tables

  ### `profiles`
  Extends auth.users with additional user information
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `avatar_url` (text, nullable)
  - `bio` (text, nullable)
  - `location` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `issues`
  Community-reported issues and concerns
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `category` (text: infrastructure, safety, environment, etc.)
  - `status` (text: open, in_progress, resolved, closed)
  - `priority` (text: low, medium, high)
  - `location` (text)
  - `latitude` (numeric, nullable)
  - `longitude` (numeric, nullable)
  - `image_url` (text, nullable)
  - `upvotes` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `votes`
  Community polls and voting initiatives
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `category` (text)
  - `status` (text: active, closed, passed, failed)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `total_votes` (integer, default 0)
  - `yes_votes` (integer, default 0)
  - `no_votes` (integer, default 0)
  - `created_at` (timestamptz)

  ### `user_votes`
  Tracks individual user votes
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `vote_id` (uuid, references votes)
  - `choice` (text: yes, no)
  - `created_at` (timestamptz)

  ### `issue_votes`
  Tracks user upvotes on issues
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `issue_id` (uuid, references issues)
  - `created_at` (timestamptz)

  ### `comments`
  Comments on issues and votes
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `issue_id` (uuid, references issues, nullable)
  - `vote_id` (uuid, references votes, nullable)
  - `content` (text)
  - `created_at` (timestamptz)

  ### `events`
  Community events and meetings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `location` (text)
  - `event_date` (timestamptz)
  - `image_url` (text, nullable)
  - `attendees_count` (integer, default 0)
  - `created_at` (timestamptz)

  ## Security
  All tables have RLS enabled with policies for authenticated users.
  Users can only modify their own content but can read public data.
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  location text NOT NULL DEFAULT '',
  latitude numeric,
  longitude numeric,
  image_url text,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Issues are viewable by everyone"
  ON issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own issues"
  ON issues FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  total_votes integer DEFAULT 0,
  yes_votes integer DEFAULT 0,
  no_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_votes table
CREATE TABLE IF NOT EXISTS user_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE NOT NULL,
  choice text NOT NULL CHECK (choice IN ('yes', 'no')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vote_id)
);

ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User votes are viewable by everyone"
  ON user_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own vote"
  ON user_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vote"
  ON user_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote"
  ON user_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create issue_votes table
CREATE TABLE IF NOT EXISTS issue_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, issue_id)
);

ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Issue votes are viewable by everyone"
  ON issue_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upvote issues"
  ON issue_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove upvote"
  ON issue_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (issue_id IS NOT NULL AND vote_id IS NULL) OR
    (issue_id IS NULL AND vote_id IS NOT NULL)
  )
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  event_date timestamptz NOT NULL,
  image_url text,
  attendees_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_votes_status ON votes(status);
CREATE INDEX IF NOT EXISTS idx_votes_end_date ON votes(end_date);

CREATE INDEX IF NOT EXISTS idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_vote_id ON user_votes(vote_id);

CREATE INDEX IF NOT EXISTS idx_issue_votes_user_id ON issue_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_votes_issue_id ON issue_votes(issue_id);

CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_vote_id ON comments(vote_id);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
