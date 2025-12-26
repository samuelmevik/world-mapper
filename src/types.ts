import type { LinkObject, NodeObject } from "react-force-graph-2d";

export type Article = {
  id: number;
  title: string;
  content: string;
}

export type ArticleNode = NodeObject<Article>;
export type ArticleLink = LinkObject<ArticleNode>;

export interface GraphData {
  nodes: ArticleNode[];
  links: ArticleLink[];
}

export type ArticleChunk = & Article & { chunkIndex: number };
export type ArticleChunkWithVector = & Article & { chunkIndex: number, vector: number[] };