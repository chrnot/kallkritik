
export enum GameState {
  WELCOME = 'WELCOME',
  SYSTEM1V2 = 'SYSTEM1V2',
  AI_DETECTION = 'AI_DETECTION',
  CONFIRMATION_BIAS = 'CONFIRMATION_BIAS',
  LATERAL_READING = 'LATERAL_READING',
  TRUTH_EFFECT = 'TRUTH_EFFECT',
  RESULTS = 'RESULTS'
}

export interface UserProgress {
  score: number;
  categories: {
    logic: number;
    aiAwareness: number;
    biasResistance: number;
    lateralReading: number;
  };
  totalChallenges: number;
}

export interface NewsItem {
  headline: string;
  body: string;
  source: string;
  isTrue: boolean;
  explanation: string;
  clues: string[];
}
