declare module "react-force-graph" {
  import React from "react";

  interface ForceGraphProps {
    graphData?: any;
    width?: number | string;
    height?: number | string;
    // Add other props as needed
  }

  export class ForceGraph extends React.Component<ForceGraphProps> {}
  export class ForceGraph2D extends React.Component<ForceGraphProps> {}
  export class ForceGraph3D extends React.Component<ForceGraphProps> {}
}
