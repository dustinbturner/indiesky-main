// components/analytics/activity-heatmap.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Let's create a better intensity scale
function getHeatmapColor(intensity: number, maxIntensity: number): string {
  // No activity
  if (intensity === 0) {
    return "bg-muted";
  }

  // Calculate percentage of maximum
  const percentage = (intensity / maxIntensity) * 100;

  // Create 5 distinct levels of intensity
  if (percentage <= 20) {
    return "bg-blue-500/20 dark:bg-blue-400/20";
  } else if (percentage <= 40) {
    return "bg-blue-500/40 dark:bg-blue-400/40";
  } else if (percentage <= 60) {
    return "bg-blue-500/60 dark:bg-blue-400/60";
  } else if (percentage <= 80) {
    return "bg-blue-500/80 dark:bg-blue-400/80";
  } else {
    return "bg-blue-500 dark:bg-blue-400";
  }
}

export function ActivityHeatmap({
  posts,
  title = "Posting Activity",
}: {
  posts: Array<{ createdAt: string }>;
  title?: string;
}) {
  // Process the data into a more useful format
  const activityData = processPostsIntoHeatmap(posts);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Time labels */}
          <div className="pr-4 flex flex-col justify-between text-xs text-muted-foreground">
            {hours.map((hour) => (
              <div key={hour} className="h-7">
                {" "}
                {/* Increased height for better visibility */}
                {formatHour(hour)}
              </div>
            ))}
          </div>

          <div className="flex-1">
            {/* Day labels */}
            <div className="flex justify-between mb-2">
              {days.map((day) => (
                <div
                  key={day}
                  className="text-xs text-muted-foreground w-full text-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <TooltipProvider>
              <div className="grid grid-cols-7 gap-[2px]">
                {" "}
                {/* Slightly increased gap */}
                {days.map((day, dayIndex) =>
                  hours.map((hour) => {
                    const count = activityData[`${dayIndex}-${hour}`] || 0;

                    return (
                      <Tooltip key={`${dayIndex}-${hour}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-7 rounded-sm transition-colors", // Increased height
                              getHeatmapColor(count, activityData.maxValue),
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{count} posts</p>
                            <p className="text-xs text-muted-foreground">
                              {days[dayIndex]} at {formatHour(hour)}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }),
                )}
              </div>
            </TooltipProvider>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end space-x-2">
              <div className="text-xs text-muted-foreground">Less</div>
              {[20, 40, 60, 80, 100].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-4 w-4 rounded-sm",
                    getHeatmapColor(level, 100),
                  )}
                />
              ))}
              <div className="text-xs text-muted-foreground">More</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to process the data
function processPostsIntoHeatmap(posts: Array<{ createdAt: string }>) {
  const data: { [key: string]: number; maxValue: number } = { maxValue: 0 };

  posts.forEach((post) => {
    const date = new Date(post.createdAt);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}-${hour}`;

    data[key] = (data[key] || 0) + 1;
    data.maxValue = Math.max(data.maxValue, data[key]);
  });

  return data;
}

// Helper to format hours in 12-hour format
function formatHour(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
}
