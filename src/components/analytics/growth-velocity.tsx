"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

// Base data structure for input data points
interface DataPoint {
  date: string;
  value: number;
}

// Extended data structure that includes calculated values
interface VelocityDataPoint extends DataPoint {
  movingAverage: number;
  velocity: number;
}

// Component props definition
interface GrowthVelocityTrackerProps {
  data: DataPoint[];
  windowSize?: number;
}

// Custom type for the tooltip payload that matches our data structure
type CustomTooltipPayload = {
  value: number;
  name: string;
  payload: VelocityDataPoint;
};

// Separate tooltip component with proper typing
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Type assertion since we know the structure of our payload
  const data = payload as CustomTooltipPayload[];

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <p className="font-medium mb-1">{data[0].payload.date}</p>
      {data.map((entry, index) => (
        <div key={index} className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono">
            {entry.name === "Growth Rate (%)"
              ? `${entry.value.toFixed(2)}%`
              : entry.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

const GrowthVelocityTracker: React.FC<GrowthVelocityTrackerProps> = ({
  data = [],
  windowSize = 7,
}) => {
  // Calculate moving averages and velocity
  const velocityData = React.useMemo<VelocityDataPoint[]>(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((point, index) => {
      // Calculate window for moving average
      const window = data.slice(Math.max(0, index - windowSize), index + 1);
      const average =
        window.reduce((sum, p) => sum + p.value, 0) / window.length;

      // Calculate velocity (percentage change)
      const velocity =
        index > 0
          ? ((point.value - data[index - 1].value) / data[index - 1].value) *
            100
          : 0;

      return {
        ...point,
        movingAverage: Number(average.toFixed(2)),
        velocity: Number(velocity.toFixed(2)),
      };
    });
  }, [data, windowSize]);

  // Handle empty state
  if (velocityData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth Velocity</CardTitle>
          <CardDescription>
            Track your growth rate and momentum over time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[350px]">
          <p className="text-muted-foreground">No growth data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Velocity</CardTitle>
        <CardDescription>
          Track your growth rate and momentum over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[350px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={velocityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis
                yAxisId="left"
                className="text-xs text-muted-foreground"
                tickFormatter={(value: number) => `${value.toFixed(1)}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs text-muted-foreground"
                tickFormatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Tooltip content={CustomTooltip} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="movingAverage"
                stroke="hsl(var(--chart-1))"
                name="Moving Average"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="velocity"
                stroke="hsl(var(--chart-2))"
                name="Growth Rate (%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          {[
            { name: "Moving Average", color: "hsl(var(--chart-1))" },
            { name: "Growth Rate (%)", color: "hsl(var(--chart-2))" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthVelocityTracker;
