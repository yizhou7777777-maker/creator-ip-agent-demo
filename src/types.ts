export type Platform = "小红书" | "抖音" | "视频号" | "朋友圈";

export type Niche =
  | "美妆护肤"
  | "母婴亲子"
  | "家居家装"
  | "时尚穿搭"
  | "个人IP专家";

export type Tone =
  | "接地气测评"
  | "妈妈视角"
  | "松弛生活"
  | "轻奢情绪"
  | "专业干货";

export type FanStage = "<1k 起步期" | "1k-1w 冷启动" | "1w-10w 上升期" | "10w+ 成熟期";

export interface CreatorProfile {
  platform: Platform;
  niche: Niche;
  tone: Tone;
  fanStage: FanStage;
  monetizationGoal: string;
  brandBrief: string;
}

export interface SourceInput {
  url: string;
  title: string;
  content: string;
  sampleId: string;
  imageCue: string;
}

export interface UserIntent {
  story: string;
  viewpoint: string;
  product: string;
  desiredShape: string;
  mustMention: string;
  avoid: string;
}

export interface ParseResult {
  ok: boolean;
  mode: "professional" | "xhs" | "manual";
  title?: string;
  content?: string;
  imageCue?: string;
  raw?: unknown;
  message: string;
}

export interface SamplePost {
  id: string;
  label: string;
  platform: Platform;
  niche: Niche;
  tone: Tone;
  url: string;
  title: string;
  content: string;
  imageCue: string;
  brandBrief: string;
}

export interface Breakdown {
  hook: string;
  formula: string;
  structure: Array<{ name: string; detail: string }>;
  keywords: string[];
  coverLogic: string;
  interactionCue: string;
  reusableTemplate: string;
}

export interface GeneratedWork {
  titles: string[];
  note: string;
  script: Array<{ scene: string; shot: string; line: string }>;
  coverIdeas: Array<{ style: string; text: string; direction: string }>;
  platformVariants: Record<Platform, string>;
}

export interface Evaluation {
  heatScore: number;
  commercialScore: number;
  assistantVerdict: string;
  risks: Array<{ term: string; reason: string; suggestion: string }>;
  improvements: string[];
  publishWindow: string;
  successMetric: string;
}

export interface AgentResult {
  breakdown: Breakdown;
  generated: GeneratedWork;
  evaluation: Evaluation;
  log: Record<string, unknown>;
  source?: "deepseek" | "fallback";
  message?: string;
}
