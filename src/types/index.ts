// 덱 관련 타입 re-export
export * from './deck';

export interface VocabWord {
  id: string;
  word: string;
  slug: string;
  meaning_en: string;
  meaning_kr: string;
  example?: string;
  images: {
    style: string;
    file: string;
  }[];
}

export interface Progress {
  wordId: string;
  viewed: number;
  correct: number;
  lastSeen: Date;
}
