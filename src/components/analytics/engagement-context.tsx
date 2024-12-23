"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

// These colors match your theme variables from the CSS
const COLORS = {
  "Technical Discussion": "hsl(var(--chart-1))",
  "Market Research": "hsl(var(--chart-2))",
  "Product Updates": "hsl(var(--chart-3))",
  "Community Building": "hsl(var(--chart-4))",
  "Growth & Marketing": "hsl(var(--chart-5))",
  Other: "hsl(var(--muted))",
};

// This interface helps TypeScript understand our post structure
interface PostItem {
  post: {
    record: {
      text: string;
    };
  };
}

function categorizeContent(text: string): keyof typeof COLORS {
  const categories = {
    "Technical Discussion":
      /code|api|debug|error|function|programming|dev|software/i,
    "Market Research":
      /customer|market|competition|pricing|research|survey|feedback/i,
    "Product Updates":
      /launch|release|feature|update|product|improvement|changelog/i,
    "Community Building":
      /help|question|thanks|community|support|team|together/i,
    "Growth & Marketing": /growth|marketing|sales|leads|audience|traffic|seo/i,
  } as const;

  for (const [category, pattern] of Object.entries(categories)) {
    if (pattern.test(text)) return category as keyof typeof COLORS;
  }

  return "Other";
}

const EngagementContextAnalysis: React.FC<{ posts: FeedViewPost[] }> = ({
  posts = [],
}) => {
  // Process posts to categorize them by context
  const contextData = React.useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) {
      return [{ name: "No Data", value: 1 }];
    }

    const contexts = posts.reduce(
      (acc, postItem) => {
        const postText = postItem.post?.record?.text || "";
        const context = categorizeContent(postText);
        acc[context] = (acc[context] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(contexts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [posts]);

  // If no real data, show empty state with shadcn styling
  if (contextData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Context</CardTitle>
          <CardDescription>
            Analysis of your post content and engagement patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[350px]">
          <p className="text-muted-foreground">No engagement data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Context</CardTitle>
        <CardDescription>
          Distribution of your posts across different topics and contexts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[350px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={contextData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                className="focus:outline-none"
              >
                {contextData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.name as keyof typeof COLORS] || COLORS.Other
                    }
                    className="stroke-background hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium">{payload[0].name}</span>
                        <span className="font-mono">
                          {payload[0].value} posts
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {contextData.map((entry, index) => (
            <div
              key={`legend-${index}`}
              className={cn(
                "flex items-center gap-2 rounded-md border p-2",
                "transition-colors hover:bg-muted/50",
              )}
            >
              <div
                className="h-3 w-3 rounded-sm shrink-0"
                style={{
                  backgroundColor:
                    COLORS[entry.name as keyof typeof COLORS] || COLORS.Other,
                }}
              />
              <span className="truncate">{entry.name}</span>
              <span className="ml-auto font-mono text-muted-foreground">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementContextAnalysis;
