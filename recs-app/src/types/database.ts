/**
 * Hand-written types for the A3 schema (docs/ARCHITECTURE.md §2).
 * Once the Supabase project exists you can regenerate with:
 *   supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RecStatusValue = 'to_read' | 'started' | 'finished' | 'not_for_me';
export type Reaction = 'loved' | 'liked' | 'not_for_me';
export type NotificationType =
  | 'rec_received'
  | 'rec_started'
  | 'rec_finished'
  | 'friend_added';
export type ItemCategory = 'book' | 'show' | 'movie' | 'site';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string | null;
          avatar: string | null;
          invite_code: string;
          expo_push_token: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar?: string | null;
          invite_code?: string;
          expo_push_token?: string | null;
          created_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar?: string | null;
          expo_push_token?: string | null;
        };
        Relationships: [];
      };
      friendships: {
        Row: { id: string; user_a: string; user_b: string; created_at: string };
        Insert: { id?: string; user_a: string; user_b: string; created_at?: string };
        Update: { user_a?: string; user_b?: string };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          category: ItemCategory;
          source: string;
          source_id: string | null;
          title: string;
          authors: string[];
          cover_url: string | null;
          description: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          category?: ItemCategory;
          source?: string;
          source_id?: string | null;
          title: string;
          authors?: string[];
          cover_url?: string | null;
          description?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          title?: string;
          authors?: string[];
          cover_url?: string | null;
          description?: string | null;
          tags?: string[];
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          item_id: string;
          sender_id: string | null;
          recipient_id: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          sender_id?: string | null;
          recipient_id: string;
          note?: string | null;
          created_at?: string;
        };
        Update: { note?: string | null };
        Relationships: [];
      };
      rec_status: {
        Row: {
          id: string;
          recommendation_id: string;
          status: RecStatusValue;
          reaction: Reaction | null;
          reaction_note: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recommendation_id: string;
          status?: RecStatusValue;
          reaction?: Reaction | null;
          reaction_note?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: RecStatusValue;
          reaction?: Reaction | null;
          reaction_note?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          recommendation_id: string | null;
          actor_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          recommendation_id?: string | null;
          actor_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: { read?: boolean };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      redeem_invite_code: {
        Args: { code: string };
        Returns: Database['public']['Tables']['users']['Row'];
      };
      are_friends: {
        Args: { a: string; b: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
