/** TokenForge 공용 타입 — Pages Functions 바인딩 및 데이터 모델. */

/** Pages Functions 가 주입하는 환경(바인딩 + 시크릿). */
export interface Env {
  /** Cloudflare KV 기억 저장소 (wrangler.toml [[kv_namespaces]]) */
  TF_MEMORY?: KVNamespace;
  /** DeepSeek 시크릿(옵션) — 없으면 클라이언트 키 또는 mock */
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
  /** Upstash Redis (옵션, 외부 장기 저장소) */
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  /** Neon Postgres (옵션, Phase 2 예정) */
  NEON_DATABASE_URL?: string;
}

export type MemoryKind = "project" | "prompt" | "wiki" | "skill";

/** 기억(Memory) 항목 — 프로젝트 계획 / 세부 프롬프트 / 위키 스니펫 / 스킬 */
export interface MemoryEntry {
  id: string;
  kind: MemoryKind;
  title: string;
  tags: string[];
  content: string;
  /** 프로젝트 계획(전체 설계) 구조 — kind=project 일 때 */
  plan?: PlanDocument | null;
  /** 최적화 전 원문(한국어 등) */
  sourceText?: string | null;
  /** 최적화된 영어 프롬프트 */
  optimizedText?: string | null;
  /** 대상 모델군 claude|chatgpt */
  targetFamily?: "claude" | "chatgpt" | null;
  stats?: { sourceTokens?: number; optimizedTokens?: number } | null;
  createdAt: string;
  updatedAt: string;
}

/** 전체 계획 프롬프트 생성 결과 */
export interface PlanDocument {
  title: string;
  goal: string;
  /** 마스터 전체 계획 프롬프트(영어) — AI 에게 "전체를 계획하라"고 시키는 프롬프트 */
  wholePromptEn: string;
  steps: PlanStep[];
  risks: string[];
  outputs: string[];
  explanationKo: string;
}

export interface PlanStep {
  id: string;
  title: string;
  descriptionKo: string;
  /** 이 단계를 실행할 세부 프롬프트(아직 원문 언어) — 사용자가 작성/편집 */
  draftPrompt?: string;
}

/** 최적화(번역+압축) 결과 */
export interface OptimizeResult {
  optimizedPrompt: string;
  summaryKo: string;
  changes: string[];
  tips: string[];
  targetFamily: "claude" | "chatgpt";
  mode: "live" | "mock";
  model: string;
  saved?: boolean;
}

export type TargetFamily = "claude" | "chatgpt";
