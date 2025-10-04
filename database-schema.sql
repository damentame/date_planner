-- Database schema for Date Planner application
-- This schema is designed to be used with Supabase (PostgreSQL)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a trigger to automatically create a profile when a user is created
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_profile_for_user();

-- Circles table (groups of users)
CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  icon TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Circle members table (users in circles)
CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (circle_id, user_id)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checkpoints table
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT),
  location_address TEXT,
  reveal_type TEXT NOT NULL CHECK (reveal_type IN ('always_visible', 'after_previous', 'manual')),
  order_index INTEGER NOT NULL,
  is_revealed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Objectives table
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User locations table
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

-- Create indexes
CREATE INDEX idx_circles_created_by ON circles(created_by);
CREATE INDEX idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX idx_events_circle_id ON events(circle_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_checkpoints_event_id ON checkpoints(event_id);
CREATE INDEX idx_objectives_checkpoint_id ON objectives(checkpoint_id);
CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_locations_event_id ON user_locations(event_id);

-- Row Level Security (RLS) Policies

-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Circles: Members can view, only leaders can update
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle members can view circles"
  ON circles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Circle leaders can update circles"
  ON circles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = id AND user_id = auth.uid() AND role = 'leader'
    )
  );

CREATE POLICY "Circle leaders can delete circles"
  ON circles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = id AND user_id = auth.uid() AND role = 'leader'
    )
  );

CREATE POLICY "Users can create circles"
  ON circles FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Circle Members: Members can view, only leaders can update
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle members can view members"
  ON circle_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circle_members AS cm
      WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Circle leaders can manage members"
  ON circle_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM circle_members AS cm
      WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.role = 'leader'
    )
  );

-- Events: Members can view, only leaders can update
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle members can view events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = events.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Circle leaders can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = events.circle_id AND user_id = auth.uid() AND role = 'leader'
    )
  );

-- Checkpoints: Members can view based on reveal status, only leaders can update
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle members can view revealed checkpoints"
  ON checkpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circle_members cm
      JOIN events e ON e.id = checkpoints.event_id
      WHERE cm.circle_id = e.circle_id AND cm.user_id = auth.uid()
    ) AND (
      is_revealed = true OR
      reveal_type = 'always_visible' OR
      EXISTS (
        SELECT 1 FROM circle_members
        JOIN events e ON e.id = checkpoints.event_id
        WHERE circle_id = e.circle_id AND user_id = auth.uid() AND role = 'leader'
      )
    )
  );

CREATE POLICY "Circle leaders can manage checkpoints"
  ON checkpoints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM circle_members cm
      JOIN events e ON e.id = checkpoints.event_id
      WHERE cm.circle_id = e.circle_id AND cm.user_id = auth.uid() AND cm.role = 'leader'
    )
  );

-- Objectives: Members can view and update completion status, only leaders can create/delete
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle members can view objectives"
  ON objectives FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circle_members cm
      JOIN events e ON e.id = checkpoints.event_id
      JOIN checkpoints c ON c.id = objectives.checkpoint_id
      WHERE cm.circle_id = e.circle_id AND cm.user_id = auth.uid()
      AND (c.is_revealed = true OR c.reveal_type = 'always_visible')
    )
  );

CREATE POLICY "Circle members can update objective completion"
  ON objectives FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM circle_members cm
      JOIN events e ON e.id = checkpoints.event_id
      JOIN checkpoints c ON c.id = objectives.checkpoint_id
      WHERE cm.circle_id = e.circle_id AND cm.user_id = auth.uid()
      AND (c.is_revealed = true OR c.reveal_type = 'always_visible')
    )
  )
  WITH CHECK (
    -- Only allow updating the is_completed field
    (SELECT jsonb_object_keys(jsonb_strip_nulls(to_jsonb(objectives.*))) - ARRAY['is_completed']) = '{}'
  );

CREATE POLICY "Circle leaders can manage objectives"
  ON objectives FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM circle_members cm
      JOIN events e ON e.id = checkpoints.event_id
      JOIN checkpoints c ON c.id = objectives.checkpoint_id
      WHERE cm.circle_id = e.circle_id AND cm.user_id = auth.uid() AND cm.role = 'leader'
    )
  );

-- User Locations: Members can view locations for active events they're in
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle members can view locations for active events"
  ON user_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circle_members cm
      JOIN events e ON e.id = user_locations.event_id
      WHERE cm.circle_id = e.circle_id AND cm.user_id = auth.uid() AND e.is_active = true
    )
  );

CREATE POLICY "Users can update their own location"
  ON user_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location"
  ON user_locations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions for realtime features

-- Function to reveal a checkpoint
CREATE OR REPLACE FUNCTION reveal_checkpoint(checkpoint_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE checkpoints
  SET is_revealed = true
  WHERE id = checkpoint_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
