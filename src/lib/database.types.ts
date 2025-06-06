// src/lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      drafts: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string | null;
          excerpt: string | null;
          category: string | null;
          slug?: string | null;
          image_url?: string | null;
          is_published?: boolean;
          published_id?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content?: string | null;
          excerpt?: string | null;
          category?: string | null;
          slug?: string | null;
          image_url?: string | null;
          is_published?: boolean;
          published_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          content?: string | null;
          excerpt?: string | null;
          category?: string | null;
          slug?: string | null;
          image_url?: string | null;
          is_published?: boolean;
          published_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drafts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      public_articles: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          excerpt: string | null;
          slug: string;
          category: string | null;
          image_url: string | null;
          published_at: string;
          is_published: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          excerpt?: string | null;
          slug: string;
          category?: string | null;
          image_url?: string | null;
          published_at?: string;
          is_published?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          slug?: string;
          category?: string | null;
          image_url?: string | null;
          published_at?: string;
          is_published?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_articles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_article_id_fkey";
            columns: ["article_id"];
            referencedRelation: "public_articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      // Add this to your src/lib/database.types.ts file inside the Tables section
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_recipient_id_fkey";
            columns: ["recipient_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      communities: {
        Row: {
          id: string;
          name: string;
          description: string;
          creator_id: string;
          image_url: string | null;
          banner_url: string | null;
          created_at: string;
          updated_at: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          creator_id: string;
          image_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          creator_id?: string;
          image_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          category?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "communities_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          is_admin: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          is_admin?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          is_admin?: boolean;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey";
            columns: ["community_id"];
            referencedRelation: "communities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      community_posts: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey";
            columns: ["community_id"];
            referencedRelation: "communities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_posts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      community_post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "community_post_comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_post_comments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_post_comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "community_post_comments";
            referencedColumns: ["id"];
          }
        ];
      };

      comments: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          parent_id: string | null;
          content: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          parent_id?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          parent_id?: string | null;
          content?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey";
            columns: ["article_id"];
            referencedRelation: "public_articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Add this to src/lib/database.types.ts inside the Tables section:
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          article_id: string | null;
          post_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id?: string | null;
          post_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string | null;
          post_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_article_id_fkey";
            columns: ["article_id"];
            referencedRelation: "public_articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          }
        ];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          action_user_id: string;
          article_id: string | null;
          comment_id: string | null;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          action_user_id: string;
          article_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          action_user_id?: string;
          article_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_action_user_id_fkey";
            columns: ["action_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_article_id_fkey";
            columns: ["article_id"];
            referencedRelation: "public_articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
