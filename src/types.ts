/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModuleId = 'origins' | 'physics' | 'relativity_ai' | 'cognitive_ai' | 'aesthetics' | 'compiler_sdk';

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  philosopher: string;
  description: string;
  formula: string;
  interactiveType: 'tangent' | 'area' | 'berkeley_ghost';
  paradoxText?: string;
  options?: Array<{text: string; effect: string; isCorrect: boolean}>;
}

export interface PhysicsSimState {
  id: 'tacoma' | 'kepler' | 'boiler' | 'heat';
  name: string;
  isRunning: boolean;
  isFailed: boolean;
  parameters: Record<string, number>;
  simulationHistory: Array<{ t: number; val1: number; val2: number }>;
  message: string;
}

export interface AIWhatIfScenario {
  id: string;
  title: string;
  originalIdea: string;
  withdrawnTool: string;
  defaultPrompt: string;
  illustrationPrompt: string;
}

export interface CompiledResult {
  python: string;
  matlab: string;
  webgl: string;
}

export interface PresetEquation {
  id: string;
  name: string;
  expression: string;
  vars: string[];
  latex: string;
  description: string;
  defaultValues: Record<string, number>;
}
