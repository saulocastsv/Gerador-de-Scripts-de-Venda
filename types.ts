export interface ScriptContent {
  initial_message: string;
  follow_up_1: string;
  follow_up_2: string;
  follow_up_final: string;
  recommended_cta: string;
  strategy_note?: string; // Optional thinking output or strategy explanation
}

export interface GeneratedScript {
  id: string;
  timestamp: number;
  niche: string;
  objective: string;
  content: ScriptContent;
}

export interface Template {
  id: string;
  label: string;
  niche: string;
  objective: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}