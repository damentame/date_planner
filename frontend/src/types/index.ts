// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Circle types
export interface Circle {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

// Event types
export interface Event {
  id: string;
  circle_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Checkpoint types
export interface Checkpoint {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  reveal_type: 'always_visible' | 'after_previous' | 'manual';
  order: number;
  is_revealed: boolean;
  created_at: string;
  updated_at: string;
}

// Objective types
export interface Objective {
  id: string;
  checkpoint_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Location types
export interface UserLocation {
  user_id: string;
  event_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}
