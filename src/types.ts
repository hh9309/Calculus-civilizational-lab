export type ActiveTab =
  | "chronology"
  | "sandbox"
  | "evolution"
  | "dispute"
  | "breakthroughs"
  | "code"
  | "aichat"
  | "guidance"
  | "report";

export interface TimelineEpoch {
  id: string;
  name: string;
  period: string;
  tagline: string;
  description: string;
  keyFigures: string[];
  formalMapping: {
    geometricConcept: string;
    algebraicExpression: string;
    philosophicalStance: string;
    limitStrictness: string;
  };
  milestones: {
    year: string;
    title: string;
    mathematician: string;
    contribution: string;
    formula: string;
  }[];
}

export type SandboxType =
  | "archimedes_parabola"
  | "kepler_barrel"
  | "cavalieri_principle"
  | "barrow_tangent";

export type PersonaId =
  | "historian"
  | "archimedes"
  | "newton"
  | "leibniz"
  | "berkeley"
  | "cauchy"
  | "weierstrass";

export interface PersonaInfo {
  id: PersonaId;
  name: string;
  title: string;
  era: string;
  avatar: string;
  quote: string;
  stance: string;
  coreBelief?: string;
  classicWork?: string;
  suggestedQuestions?: string[];
}

export interface ChatMessage {
  id: string;
  role?: "user" | "model";
  sender?: "user" | "persona";
  content?: string;
  text: string;
  personaId?: PersonaId;
  timestamp: string;
}

export interface BreakthroughItem {
  id: string;
  number: number;
  title: string;
  inventor: string;
  era: string;
  summary: string;
  historicalContext: string;
  coreIdea: string;
  formalFormula: string;
  proofSteps: string[];
  ancientQuote: string;
  interactiveType: SandboxType;
}

export interface GenealogyNode {
  id: string;
  name: string;
  years: string;
  epoch: string;
  mainConcept: string;
  influence: string;
  teachers?: string[];
  students?: string[];
  title?: string;
  historicalFigure?: string;
  era?: string;
  category?: string;
  formalMath?: string;
  coreIdea?: string;
  modernMapping?: string;
  prerequisites?: string[];
  descendants?: string[];
}

export type AIModelType = "gemini-3-flash" | "deepseek-v4-pro";

export interface AIModelConfig {
  model: AIModelType;
  apiKey: string;
  baseUrl?: string;
  customModelName?: string;
}
