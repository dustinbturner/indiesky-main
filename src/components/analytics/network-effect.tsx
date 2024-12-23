"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ForceGraph2D } from "react-force-graph";
import { cn } from "@/lib/utils";

// First, let's define our data structure types
interface Author {
  did: string;
  handle: string;
}

interface Subject {
  did: string;
}

interface Interaction {
  author: Author;
  type: "repost" | "quote" | "reply" | "like";
  subject: Subject;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface NetworkEffectAnalysisProps {
  interactions: Interaction[];
}

// Type for the node canvas object function parameters
interface NodeCanvasObjectParams {
  node: GraphNode;
  ctx: CanvasRenderingContext2D;
  globalScale: number;
}

interface ForceGraphProps {
  graphData?: any;
  width?: number | string;
  height?: number | string;
  nodeAutoColorBy?: string;
  backgroundColor?: string;
  nodeCanvasObject?: (
    node: any,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => void;
  linkColor?: (link: any) => string;
  linkDirectionalParticles?: number;
  linkDirectionalParticleColor?: (link: any) => string;
  linkDirectionalParticleWidth?: number;
  linkDirectionalParticleSpeed?: (link: any) => number;
}

const NetworkEffectAnalysis: React.FC<NetworkEffectAnalysisProps> = ({
  interactions = [],
}) => {
  // Transform interaction data into nodes and links with proper typing
  const graphData = React.useMemo<GraphData>(() => {
    if (!Array.isArray(interactions) || interactions.length === 0) {
      return { nodes: [], links: [] };
    }

    const nodes = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Build nodes from interactions
    interactions.forEach((interaction) => {
      if (!nodes.has(interaction.author.did)) {
        nodes.set(interaction.author.did, {
          id: interaction.author.did,
          name: interaction.author.handle,
          val: 1,
        });
      }

      if (interaction.type === "repost" || interaction.type === "quote") {
        const sourceNode = nodes.get(interaction.author.did);
        if (sourceNode) {
          sourceNode.val += 1;
        }

        links.push({
          source: interaction.author.did,
          target: interaction.subject.did,
          value: 1,
        });
      }
    });

    return {
      nodes: Array.from(nodes.values()),
      links,
    };
  }, [interactions]);

  // Handle empty state
  if (graphData.nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Spread Analysis</CardTitle>
          <CardDescription>
            Visualize how your content spreads through the network
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[500px]">
          <p className="text-muted-foreground">No network data available</p>
        </CardContent>
      </Card>
    );
  }

  const handleNodeCanvasObject = (
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px var(--font-sans)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = node.color || "hsl(var(--foreground))";
    ctx.fillText(label, node.x || 0, node.y || 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Spread Analysis</CardTitle>
        <CardDescription>
          Visualize how your content spreads through the network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn("min-h-[500px] w-full rounded-md border", "bg-muted/5")}
        >
          <ForceGraph2D
            graphData={graphData}
            nodeAutoColorBy="group"
            backgroundColor="transparent"
            nodeCanvasObject={handleNodeCanvasObject}
            linkColor={() => "hsl(var(--border))"}
            linkDirectionalParticles={2}
            linkDirectionalParticleColor={() => "hsl(var(--primary))"}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={(d: GraphLink) => {
              const link = d as GraphLink;
              return link.value * 0.001;
            }}
            width={800}
            height={500}
          />
        </div>

        {/* Network stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { label: "Total Connections", value: graphData.links.length },
            { label: "Active Nodes", value: graphData.nodes.length },
            {
              label: "Avg. Interactions",
              value: (
                graphData.links.length / Math.max(1, graphData.nodes.length)
              ).toFixed(1),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center p-2 rounded-md border bg-muted/5"
            >
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-lg font-mono">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkEffectAnalysis;
