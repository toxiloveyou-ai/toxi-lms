export type NodeType = 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'speaking' | 'exam' | 'milestone';
export type NodeStatus = 'locked' | 'available' | 'completed' | 'current';

export interface RoadmapNode {
  id: string;
  title: string;
  type: NodeType;
  status: NodeStatus;
  progress: number;
  level: string; // e.g. "HSK 1", "Sơ cấp"
  module?: string;
  description?: string;
}

export interface RoadmapConnection {
  from: string;
  to: string;
}
