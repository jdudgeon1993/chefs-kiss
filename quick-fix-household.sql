-- =====================================================
-- SIMPLE FIX: Create household and fix RLS
-- =====================================================

-- Step 1: Fix the infinite recursion RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their household members" ON household_members;
DROP POLICY IF EXISTS "Users can view household members" ON household_members;

-- Create a simple policy that doesn't recurse
CREATE POLICY "Allow authenticated users to view household members" ON household_members
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Step 2: Create household for jdudgeon1993@gmail.com
DO $$
DECLARE
  v_user_id UUID;
  v_household_id UUID;
  v_existing_household UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'jdudgeon1993@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User not found!';
    RETURN;
  END IF;

  -- Check if user already has a household
  SELECT household_id INTO v_existing_household
  FROM household_members
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_existing_household IS NOT NULL THEN
    RAISE NOTICE 'User already has household: %', v_existing_household;
    RETURN;
  END IF;

  -- Create new household
  INSERT INTO households (name)
  VALUES ('jdudgeon1993''s Kitchen')
  RETURNING id INTO v_household_id;

  -- Add user as admin
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (v_household_id, v_user_id, 'admin');

  RAISE NOTICE 'Created household % for user %', v_household_id, v_user_id;
END $$;

-- Step 3: Verify it worked
SELECT
  u.email,
  h.id as household_id,
  h.name as household_name,
  hm.role
FROM auth.users u
JOIN household_members hm ON hm.user_id = u.id
JOIN households h ON h.id = hm.household_id
WHERE u.email = 'jdudgeon1993@gmail.com';
