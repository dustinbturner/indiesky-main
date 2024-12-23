// src/types/bluesky.ts
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

// For EngagementContext
export interface PostItem {
  post: {
    record: {
      text: string;
    } & Record<string, unknown>; // Allow additional properties
  };
}

export function isValidPostItem(post: FeedViewPost): post is PostItem {
  return (
    post.post?.record &&
    typeof post.post.record === "object" &&
    "text" in post.post.record
  );
}

// For GrowthVelocity
export interface DailyPostCount {
  date: string;
  value: number;
}

// For NetworkEffect
export interface NetworkInteraction {
  author: {
    did: string;
    handle: string;
  };
  type: "repost" | "quote" | "reply" | "like";
  subject: {
    did: string;
  };
}
