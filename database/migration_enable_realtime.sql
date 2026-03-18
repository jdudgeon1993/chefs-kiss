-- Enable Supabase Realtime on all tables used by the frontend subscription.
--
-- Run this in Supabase Dashboard → SQL Editor (or via psql).
--
-- Two steps are required for postgres_changes events to fire:
--   1. REPLICA IDENTITY FULL  — ensures UPDATE/DELETE payloads include old row data
--   2. ALTER PUBLICATION       — adds the table to Supabase's realtime publication

ALTER TABLE pantry_items         REPLICA IDENTITY FULL;
ALTER TABLE recipes              REPLICA IDENTITY FULL;
ALTER TABLE meal_plans           REPLICA IDENTITY FULL;
ALTER TABLE shopping_list_manual REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE pantry_items;
ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_list_manual;
