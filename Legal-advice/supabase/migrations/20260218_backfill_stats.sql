-- Backfill script to calculate average_rating and total_reviews for existing profiles
-- Run this AFTER running 20260218_add_lawyer_stats.sql

UPDATE profiles p
SET 
  average_rating = COALESCE((
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM lawyer_reviews lr 
    WHERE lr.lawyer_id = p.id 
    AND lr.is_visible = true 
    AND lr.is_approved = true
  ), 0),
  total_reviews = COALESCE((
    SELECT COUNT(*) 
    FROM lawyer_reviews lr 
    WHERE lr.lawyer_id = p.id 
    AND lr.is_visible = true 
    AND lr.is_approved = true
  ), 0);
