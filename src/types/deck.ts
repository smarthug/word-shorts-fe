// 단어 타입
export interface Word {
  id: string;
  word: string;        // 영단어
  slug: string;        // URL용 슬러그
  meaning_en: string;  // 영어 뜻
  meaning_kr: string;  // 한국어 뜻
}

// 암기 단계
export type MemorizationStage = 'unlearned' | 'learning' | 'mastered';

// 덱 타입
export interface Deck {
  id: string;
  name: string;              // 덱 이름
  description?: string;      // 설명
  words: Word[];             // 원본 단어 배열 (immutable)
  unlearned: string[];       // 미암기 단어 ID 배열
  learning: string[];        // 암기 중 단어 ID 배열
  mastered: string[];        // 암기 완료 단어 ID 배열
  createdAt: number;
  updatedAt: number;
}

// 덱 통계
export interface DeckStats {
  total: number;
  unlearned: number;
  learning: number;
  mastered: number;
  unlearnedPercent: number;
  learningPercent: number;
  masteredPercent: number;
}

// API에서 가져오는 단어 타입 (기존 호환)
export interface ApiWord {
  word: string;
  slug: string;
  meaning_en: string;
  meaning_kr: string;
  imageCount?: number;
}
