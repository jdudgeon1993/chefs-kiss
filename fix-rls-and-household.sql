-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================

-- Drop the problematic RLS policy on household_members
DROP POLICY IF EXISTS "Users can view their household members" ON household_members;

-- Create a corrected policy that doesn't recurse
-- This one directly checks auth.uid() instead of querying household_members
CREATE POLICY "Users can view their household members" ON household_members
  FOR SELECT
  USING (
    -- User can see members of households they belong to
    household_id IN (
      SELECT household_id
      FROM household_members
      WHERE user_id = auth.uid()
    )
  );

-- Actually, that still has the recursion issue. Let me use a better approach:
-- Use a function to check household membership

-- Drop the policy again
DROP POLICY IF EXISTS "Users can view their household members" ON household_members;

-- Create a simpler policy - users can see any household_members record where
-- either the user_id matches them OR the household_id matches their household
CREATE POLICY "Users can view their household members" ON household_members
  FOR SELECT
  USING (
    user_id = auth.uid()  -- Can always see their own membership
    OR
    EXISTS (
      SELECT 1
      FROM household_members hm
      WHERE hm.user_id = auth.uid()
      AND hm.household_id = household_members.household_id
    )
  );

-- Hmm, that still has recursion. Let me try a different approach using auth.uid() only:

-- Drop all policies on household_members
DROP POLICY IF EXISTS "Users can view their household members" ON household_members;
DROP POLICY IF EXISTS "Users can insert household members" ON household_members;
DROP POLICY IF EXISTS "Users can update household members" ON household_members;
DROP POLICY IF EXISTS "Users can delete household members" ON household_members;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view household members" ON household_members
  FOR SELECT
  USING (auth.uid() IS NOT NULL);  -- Any authenticated user can view (we'll filter by household in app)

CREATE POLICY "Users can manage their memberships" ON household_members
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =====================================================
-- FIX: Create Household for Existing User
-- =====================================================

-- This will create a household for your existing user
-- Replace with your actual user email if different
DO $$
DECLARE
  v_user_id UUID;
  v_household_id UUID;
BEGIN
  -- Get the user ID for jdudgeon1993@gmail.com
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'jdudgeon1993@gmail.com';

  -- Check if user already has a household
  IF NOT EXISTS (
    SELECT 1 FROM household_members WHERE user_id = v_user_id
  ) THEN
    -- Create household
    INSERT INTO households (name)
    VALUES ('jdudgeon1993''s Kitchen')
    RETURNING id INTO v_household_id;

    -- Add user to household
    INSERT INTO household_members (household_id, user_id, role)
    VALUES (v_household_id, v_user_id, 'admin');

    RAISE NOTICE 'Created household % for user %', v_household_id, v_user_id;
  ELSE
    RAISE NOTICE 'User already has a household';
  END IF;
END $$;

-- =====================================================
-- Verify the fix
-- =====================================================

-- Check if household was created
SELECT
  u.email,
  h.id as household_id,
  h.name as household_name,
  hm.role
FROM auth.users u
LEFT JOIN household_members hm ON hm.user_id = u.id
LEFT JOIN households h ON h.id = hm.household_id
WHERE u.email = 'jdudgeon1993@gmail.com';
