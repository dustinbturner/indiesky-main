// app/(main)/analytics/page.tsx
import { getSession, agent } from "@/lib/bsky/agent";
import { type ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { type FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {
  FileText,
  Users,
  UserPlus,
  BarChart2,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import React from "react";
import GrowthVelocityTracker from "@/components/analytics/growth-velocity";
import NetworkEffectAnalysis from "@/components/analytics/network-effect";
import EngagementContextAnalysis from "@/components/analytics/engagement-context";

// Core interfaces for data types
interface MetricsCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: LucideIcon;
}

interface PostMetrics {
  likeCount: number;
  replyCount: number;
  repostCount: number;
  quotesCount: number;
  indexedAt: string;
}

interface ProcessedGrowthData {
  date: string;
  value: number;
}

interface NetworkInteractionData {
  author: {
    did: string;
    handle: string;
  };
  type: "repost" | "quote";
  subject: {
    did: string;
  };
}

// Helper functions for data processing
async function calculateEngagementRate(
  profile: ProfileViewDetailed,
): Promise<number> {
  try {
    const recentPosts = await agent.getAuthorFeed({
      actor: profile.handle,
      limit: 50,
    });

    if (!recentPosts.data.feed.length) return 0;

    const totalEngagements = recentPosts.data.feed.reduce((sum, { post }) => {
      const metrics = post as unknown as PostMetrics;
      return (
        sum +
        ((metrics.likeCount || 0) +
          (metrics.replyCount || 0) +
          (metrics.repostCount || 0))
      );
    }, 0);

    const averageEngagements = totalEngagements / recentPosts.data.feed.length;
    const followerCount = profile.followersCount || 1;
    const engagementRate = (averageEngagements / followerCount) * 100;

    return Number(engagementRate.toFixed(1));
  } catch (error) {
    console.error("Error calculating engagement rate:", error);
    return 0;
  }
}

function processPostsForGrowthVelocity(
  posts: FeedViewPost[],
): ProcessedGrowthData[] {
  const postsByDate = posts.reduce<Record<string, number>>((acc, { post }) => {
    const metrics = post as unknown as PostMetrics;
    const date = new Date(metrics.indexedAt).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(postsByDate)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function processInteractions(posts: FeedViewPost[]): NetworkInteractionData[] {
  return posts.flatMap(({ post }): NetworkInteractionData[] => {
    const metrics = post as unknown as PostMetrics;
    const interactions: NetworkInteractionData[] = [];

    if (metrics.repostCount > 0) {
      interactions.push({
        author: {
          did: post.author.did,
          handle: post.author.handle,
        },
        type: "repost",
        subject: { did: post.author.did },
      });
    }

    if (metrics.quotesCount > 0) {
      interactions.push({
        author: {
          did: post.author.did,
          handle: post.author.handle,
        },
        type: "quote",
        subject: { did: post.author.did },
      });
    }

    return interactions;
  });
}

// UI Components
function MetricsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
}: MetricsCardProps) {
  return (
    <Card className="hover:bg-accent/5 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
          {trend && (
            <div className="flex items-center text-sm">
              <span
                className={cn(
                  "flex items-center",
                  trend.value > 0 ? "text-emerald-500" : "text-red-500",
                )}
              >
                {trend.value > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground ml-1">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default async function AnalyticsDashboard() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Please log in to view your analytics
          </h2>
          <p className="text-muted-foreground">
            Sign in with your Bluesky account to access analytics
          </p>
        </div>
      </div>
    );
  }

  try {
    const [profile, recentPosts] = await Promise.all([
      agent.getProfile({ actor: session.handle }),
      agent.getAuthorFeed({
        actor: session.handle,
        limit: 100,
      }),
    ]);

    const engagementRate = await calculateEngagementRate(profile.data);
    const growthData = processPostsForGrowthVelocity(recentPosts.data.feed);
    const interactions = processInteractions(recentPosts.data.feed);

    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="p-8 space-y-8">
          {/* Dashboard Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your Bluesky engagement and growth metrics
            </p>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricsCard
              title="Total Posts"
              value={profile.data.postsCount || 0}
              description="All-time posts"
              icon={FileText}
            />
            <MetricsCard
              title="Followers"
              value={profile.data.followersCount || 0}
              description="Current follower count"
              icon={Users}
            />
            <MetricsCard
              title="Following"
              value={profile.data.followsCount || 0}
              description="Accounts you follow"
              icon={UserPlus}
            />
            <MetricsCard
              title="Engagement Rate"
              value={`${engagementRate}%`}
              description="Average engagement relative to follower count"
              icon={BarChart2}
              trend={{
                value: engagementRate > 5 ? 1 : -1,
                label: "vs industry average",
              }}
            />
          </div>

          {/*  Visualization Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EngagementContextAnalysis posts={recentPosts.data.feed} />
            <GrowthVelocityTracker data={growthData} />
          </div>

          <NetworkEffectAnalysis interactions={interactions} />

          <ActivityHeatmap
            posts={recentPosts.data.feed.map((item) => ({
              createdAt: (item.post as unknown as PostMetrics).indexedAt,
            }))}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/50 p-4">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Analytics
          </h2>
          <p className="text-muted-foreground">
            There was an error loading your analytics data. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }
}
