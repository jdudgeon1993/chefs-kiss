[
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "row_number",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "item_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "quantity",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "unit",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "location",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "categories",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "categories",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "categories",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "categories",
    "column_name": "is_default",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "categories",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "categories",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "categories",
    "column_name": "emoji",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "household_invites",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "household_invites",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "household_invites",
    "column_name": "code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "household_invites",
    "column_name": "expires_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "household_invites",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "household_invites",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "household_invites",
    "column_name": "used_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "household_invites",
    "column_name": "used_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "household_invites",
    "column_name": "role",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'member'::text"
  },
  {
    "table_name": "household_members",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "household_members",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "household_members",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "household_members",
    "column_name": "role",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'member'::text"
  },
  {
    "table_name": "household_members",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "household_settings",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "household_settings",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "household_settings",
    "column_name": "locations",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[\"Pantry\", \"Refrigerator\", \"Freezer\", \"Cabinet\", \"Counter\"]'::jsonb"
  },
  {
    "table_name": "household_settings",
    "column_name": "categories",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[\"Meat\", \"Dairy\", \"Produce\", \"Pantry\", \"Frozen\", \"Spices\", \"Beverages\", \"Snacks\", \"Other\"]'::jsonb"
  },
  {
    "table_name": "household_settings",
    "column_name": "category_emojis",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "table_name": "household_settings",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "household_settings",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "households",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "households",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "households",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "households",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "households",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "locations",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "locations",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "locations",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "locations",
    "column_name": "is_default",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "locations",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "locations",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "meal_plans",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "meal_plans",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "meal_plans",
    "column_name": "week",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "meal_plans",
    "column_name": "day_of_week",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "meal_plans",
    "column_name": "recipe_ids",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_name": "meal_plans",
    "column_name": "planned_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "meal_plans",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "meal_plans",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "meal_plans",
    "column_name": "meal_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "meal_plans",
    "column_name": "is_cooked",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "meal_plans",
    "column_name": "recipe_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "pantry_items",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "pantry_items",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "pantry_items",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "pantry_items",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "pantry_items",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'pantry'::text"
  },
  {
    "table_name": "pantry_items",
    "column_name": "quantity",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "1"
  },
  {
    "table_name": "pantry_items",
    "column_name": "unit",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "''::text"
  },
  {
    "table_name": "pantry_items",
    "column_name": "expiration_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "pantry_items",
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "pantry_items",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "pantry_items",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "pantry_items",
    "column_name": "item_category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "pantry_items",
    "column_name": "reserved_quantity",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "pantry_items",
    "column_name": "min_threshold",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "pantry_locations",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "pantry_locations",
    "column_name": "pantry_item_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "pantry_locations",
    "column_name": "location_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "pantry_locations",
    "column_name": "quantity",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": "0"
  },
  {
    "table_name": "pantry_locations",
    "column_name": "expiration_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "pantry_locations",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "pantry_locations",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "recent_purchases",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "recent_purchases",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "recent_purchases",
    "column_name": "item_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "recent_purchases",
    "column_name": "item_category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recent_purchases",
    "column_name": "quantity",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recent_purchases",
    "column_name": "unit",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recent_purchases",
    "column_name": "purchased_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "recent_purchases",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recipes",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "recipes",
    "column_name": "household_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recipes",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recipes",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "recipes",
    "column_name": "servings",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "4"
  },
  {
    "table_name": "recipes",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recipes",
    "column_name": "image_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recipes",
    "column_name": "instructions",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "recipes",
    "column_name": "ingredients",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_name": "recipes",
    "column_name": "favorite",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  }
]

[
  {
    "tablename": "household_invites",
    "policyname": "Household members can view their household's invites",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "household_invites",
    "policyname": "Household admins can create invites",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT hm.household_id\n   FROM household_members hm\n  WHERE ((hm.user_id = auth.uid()) AND (hm.role = ANY (ARRAY['owner'::text, 'admin'::text])))))"
  },
  {
    "tablename": "household_invites",
    "policyname": "Anyone can view valid unused invites",
    "cmd": "SELECT",
    "qual": "((used_at IS NULL) AND (expires_at > now()))",
    "with_check": null
  },
  {
    "tablename": "household_invites",
    "policyname": "Invite creator can delete their invites",
    "cmd": "DELETE",
    "qual": "(created_by = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "rtd_routes",
    "policyname": "Public read access for routes",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "rtd_stops",
    "policyname": "Public read access for stops",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "rtd_calendar",
    "policyname": "Public read access for calendar",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "rtd_calendar_dates",
    "policyname": "Public read access for calendar_dates",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "rtd_trips",
    "policyname": "Public read access for trips",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "rtd_stop_times",
    "policyname": "Public read access for stop_times",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "storage_locations",
    "policyname": "Users can view their household's storage locations",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "storage_locations",
    "policyname": "Users can insert storage locations for their household",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "storage_locations",
    "policyname": "Users can update their household's storage locations",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "storage_locations",
    "policyname": "Users can delete their household's storage locations",
    "cmd": "DELETE",
    "qual": "((household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid()))) AND (is_default = false))",
    "with_check": null
  },
  {
    "tablename": "bulk_entry_drafts",
    "policyname": "Users can view drafts for their household",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "bulk_entry_drafts",
    "policyname": "Users can insert drafts for their household",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "scheduled_meals",
    "policyname": "scheduled_meals_select_policy",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "scheduled_meals",
    "policyname": "scheduled_meals_insert_policy",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "scheduled_meals",
    "policyname": "scheduled_meals_update_policy",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "households",
    "policyname": "households_insert",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "tablename": "households",
    "policyname": "households_update",
    "cmd": "UPDATE",
    "qual": "(id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "households",
    "policyname": "households_delete",
    "cmd": "DELETE",
    "qual": "(id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "household_members",
    "policyname": "household_members_insert",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "tablename": "household_members",
    "policyname": "household_members_select",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "household_members",
    "policyname": "household_members_update",
    "cmd": "UPDATE",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "household_members",
    "policyname": "household_members_delete",
    "cmd": "DELETE",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "household_invites",
    "policyname": "household_invites_insert",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "tablename": "household_invites",
    "policyname": "household_invites_select",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "household_invites",
    "policyname": "household_invites_delete",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "pantry_items",
    "policyname": "pantry_items_select",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "pantry_items",
    "policyname": "pantry_items_insert",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "pantry_items",
    "policyname": "pantry_items_update",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "pantry_items",
    "policyname": "pantry_items_delete",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "recipes",
    "policyname": "recipes_select",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "recipes",
    "policyname": "recipes_insert",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "recipes",
    "policyname": "recipes_update",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "recipes",
    "policyname": "recipes_delete",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "shopping_list",
    "policyname": "shopping_list_select",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "shopping_list",
    "policyname": "shopping_list_insert",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "shopping_list",
    "policyname": "shopping_list_update",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "shopping_list",
    "policyname": "shopping_list_delete",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "meal_plans",
    "policyname": "meal_plans_select",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "meal_plans",
    "policyname": "meal_plans_insert",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "meal_plans",
    "policyname": "meal_plans_update",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "meal_plans",
    "policyname": "meal_plans_delete",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "households",
    "policyname": "households_select",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "categories",
    "policyname": "Users can view their household's categories",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "categories",
    "policyname": "Users can insert categories for their household",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "categories",
    "policyname": "Users can update their household's categories",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "categories",
    "policyname": "Users can delete their household's non-default categories",
    "cmd": "DELETE",
    "qual": "((household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid()))) AND (is_default = false))",
    "with_check": null
  },
  {
    "tablename": "locations",
    "policyname": "Users can view their household's locations",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "locations",
    "policyname": "Users can insert locations for their household",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "locations",
    "policyname": "Users can update their household's locations",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "locations",
    "policyname": "Users can delete their household's non-default locations",
    "cmd": "DELETE",
    "qual": "((household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid()))) AND (is_default = false))",
    "with_check": null
  },
  {
    "tablename": "recent_purchases",
    "policyname": "Users can view their household's recent purchases",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "recent_purchases",
    "policyname": "Users can insert recent purchases for their household",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "pantry_items",
    "policyname": "Users can access household pantry",
    "cmd": "ALL",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "pantry_locations",
    "policyname": "Users can access household locations",
    "cmd": "ALL",
    "qual": "(pantry_item_id IN ( SELECT pantry_items.id\n   FROM pantry_items\n  WHERE (pantry_items.household_id IN ( SELECT household_members.household_id\n           FROM household_members\n          WHERE (household_members.user_id = auth.uid())))))",
    "with_check": "(pantry_item_id IN ( SELECT pantry_items.id\n   FROM pantry_items\n  WHERE (pantry_items.household_id IN ( SELECT household_members.household_id\n           FROM household_members\n          WHERE (household_members.user_id = auth.uid())))))"
  },
  {
    "tablename": "recipes",
    "policyname": "Users can access household recipes",
    "cmd": "ALL",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "meal_plans",
    "policyname": "Users can access household meal plans",
    "cmd": "ALL",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "shopping_list_custom",
    "policyname": "Users can access household shopping",
    "cmd": "ALL",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "households",
    "policyname": "Users can view own households",
    "cmd": "SELECT",
    "qual": "(id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "household_members",
    "policyname": "Allow authenticated users to view household members",
    "cmd": "SELECT",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "tablename": "scheduled_meals",
    "policyname": "scheduled_meals_delete_policy",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "bulk_entry_drafts",
    "policyname": "Users can update drafts for their household",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "bulk_entry_drafts",
    "policyname": "Users can delete drafts for their household",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "shopping_list_manual",
    "policyname": "Users can view their household's manual shopping items",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "shopping_list_manual",
    "policyname": "Users can insert manual shopping items for their household",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "shopping_list_manual",
    "policyname": "Users can update their household's manual shopping items",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "shopping_list_manual",
    "policyname": "Users can delete their household's manual shopping items",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "household_settings",
    "policyname": "Users can view their household settings",
    "cmd": "SELECT",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "household_settings",
    "policyname": "Users can insert settings for their household",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))"
  },
  {
    "tablename": "household_settings",
    "policyname": "Users can update their household settings",
    "cmd": "UPDATE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "household_settings",
    "policyname": "Users can delete their household settings",
    "cmd": "DELETE",
    "qual": "(household_id IN ( SELECT household_members.household_id\n   FROM household_members\n  WHERE (household_members.user_id = auth.uid())))",
    "with_check": null
  }
]

[
  {
    "table_name": "household_members",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "household_invites",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "pantry_items",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "recipes",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "shopping_list",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "meal_plans",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "categories",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "locations",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "recent_purchases",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "rtd_trips",
    "column_name": "route_id",
    "foreign_table": "rtd_routes",
    "foreign_column": "route_id"
  },
  {
    "table_name": "rtd_trips",
    "column_name": "service_id",
    "foreign_table": "rtd_calendar",
    "foreign_column": "service_id"
  },
  {
    "table_name": "rtd_stop_times",
    "column_name": "trip_id",
    "foreign_table": "rtd_trips",
    "foreign_column": "trip_id"
  },
  {
    "table_name": "rtd_stop_times",
    "column_name": "stop_id",
    "foreign_table": "rtd_stops",
    "foreign_column": "stop_id"
  },
  {
    "table_name": "pantry_locations",
    "column_name": "pantry_item_id",
    "foreign_table": "pantry_items",
    "foreign_column": "id"
  },
  {
    "table_name": "meal_plans",
    "column_name": "recipe_id",
    "foreign_table": "recipes",
    "foreign_column": "id"
  },
  {
    "table_name": "shopping_list_custom",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "storage_locations",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "scheduled_meals",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "scheduled_meals",
    "column_name": "recipe_id",
    "foreign_table": "recipes",
    "foreign_column": "id"
  },
  {
    "table_name": "bulk_entry_drafts",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "shopping_list_manual",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  },
  {
    "table_name": "household_settings",
    "column_name": "household_id",
    "foreign_table": "households",
    "foreign_column": "id"
  }
]

