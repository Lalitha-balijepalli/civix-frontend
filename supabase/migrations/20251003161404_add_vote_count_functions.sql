/*
  # Add Vote Count Functions

  ## Overview
  Adds database functions to safely increment and decrement vote counts on issues.
  These functions ensure atomic updates and maintain data consistency.

  ## New Functions

  ### `increment_issue_upvotes`
  Safely increments the upvotes count on an issue by 1

  ### `decrement_issue_upvotes`
  Safely decrements the upvotes count on an issue by 1, with a minimum of 0
*/

CREATE OR REPLACE FUNCTION increment_issue_upvotes(issue_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE issues
  SET upvotes = upvotes + 1
  WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_issue_upvotes(issue_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE issues
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
