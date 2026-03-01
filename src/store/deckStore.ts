import { create } from 'zustand';
import type { Deck, MemorizationStage, DeckStats, Word, ApiWord } from '../types/deck';
import { getAllDecks, saveDeck } from '../db';

const API_BASE = 'https://word-shorts-api.kirklayer6590.workers.dev';

interface DeckStore {
  // 상태
  decks: Deck[];
  currentDeckId: string | null;
  currentStage: MemorizationStage;
  isLoading: boolean;
  isInitialized: boolean;

  // 초기화
  initialize: () => Promise<void>;
  
  // 덱 선택
  selectDeck: (deckId: string) => void;
  selectStage: (stage: MemorizationStage) => void;
  
  // 단어 이동
  moveWord: (wordId: string, to: MemorizationStage) => Promise<void>;
  moveWords: (wordIds: string[], to: MemorizationStage) => Promise<void>;
  
  // 현재 덱/단어 가져오기
  getCurrentDeck: () => Deck | null;
  getCurrentWords: () => Word[];
  getDeckStats: (deckId?: string) => DeckStats | null;
  
  // 덱 새로고침 (API에서 다시 가져오기)
  refreshDeck: (deckId: string) => Promise<void>;
}

// 기본 덱 ID
const DEFAULT_DECK_ID = 'default-deck';

export const useDeckStore = create<DeckStore>((set, get) => ({
  decks: [],
  currentDeckId: null,
  currentStage: 'unlearned',
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    
    try {
      // IndexedDB에서 덱 로드
      let decks = await getAllDecks();
      
      // 덱이 없으면 API에서 가져와서 생성
      if (decks.length === 0) {
        console.log('No decks found, fetching from API...');
        const response = await fetch(`${API_BASE}/api/vocab`);
        const apiWords: ApiWord[] = await response.json();
        
        // API 단어를 Word 타입으로 변환
        const words: Word[] = apiWords.map((w, index) => ({
          id: `word-${index}`,
          word: w.word,
          slug: w.slug,
          meaning_en: w.meaning_en || '',
          meaning_kr: w.meaning_kr || '',
        }));
        
        // 기본 덱 생성
        const defaultDeck: Deck = {
          id: DEFAULT_DECK_ID,
          name: '기본 영단어',
          description: 'Word Shorts 기본 단어장',
          words: words,
          unlearned: words.map(w => w.id), // 모든 단어를 미암기로
          learning: [],
          mastered: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        await saveDeck(defaultDeck);
        decks = [defaultDeck];
        console.log(`Created default deck with ${words.length} words`);
      }
      
      set({
        decks,
        currentDeckId: decks[0]?.id || null,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to initialize decks:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  selectDeck: (deckId: string) => {
    set({ currentDeckId: deckId });
  },

  selectStage: (stage: MemorizationStage) => {
    set({ currentStage: stage });
  },

  moveWord: async (wordId: string, to: MemorizationStage) => {
    const { currentDeckId, decks } = get();
    if (!currentDeckId) return;
    
    const deckIndex = decks.findIndex(d => d.id === currentDeckId);
    if (deckIndex === -1) return;
    
    const deck = { ...decks[deckIndex] };
    const stages: MemorizationStage[] = ['unlearned', 'learning', 'mastered'];
    
    // 모든 단계에서 단어 제거
    for (const stage of stages) {
      deck[stage] = deck[stage].filter(id => id !== wordId);
    }
    
    // 대상 단계에 추가
    deck[to] = [...deck[to], wordId];
    deck.updatedAt = Date.now();
    
    // DB에 저장
    await saveDeck(deck);
    
    // 상태 업데이트
    const newDecks = [...decks];
    newDecks[deckIndex] = deck;
    set({ decks: newDecks });
  },

  moveWords: async (wordIds: string[], to: MemorizationStage) => {
    const { currentDeckId, decks } = get();
    if (!currentDeckId) return;
    
    const deckIndex = decks.findIndex(d => d.id === currentDeckId);
    if (deckIndex === -1) return;
    
    const deck = { ...decks[deckIndex] };
    const stages: MemorizationStage[] = ['unlearned', 'learning', 'mastered'];
    
    // 모든 단계에서 단어들 제거
    for (const stage of stages) {
      deck[stage] = deck[stage].filter(id => !wordIds.includes(id));
    }
    
    // 대상 단계에 추가
    deck[to] = [...deck[to], ...wordIds];
    deck.updatedAt = Date.now();
    
    // DB에 저장
    await saveDeck(deck);
    
    // 상태 업데이트
    const newDecks = [...decks];
    newDecks[deckIndex] = deck;
    set({ decks: newDecks });
  },

  getCurrentDeck: () => {
    const { currentDeckId, decks } = get();
    return decks.find(d => d.id === currentDeckId) || null;
  },

  getCurrentWords: () => {
    const { currentStage } = get();
    const deck = get().getCurrentDeck();
    if (!deck) return [];
    
    const wordIds = deck[currentStage];
    return wordIds
      .map(id => deck.words.find(w => w.id === id))
      .filter((w): w is Word => w !== undefined);
  },

  getDeckStats: (deckId?: string) => {
    const { decks, currentDeckId } = get();
    const targetId = deckId || currentDeckId;
    if (!targetId) return null;
    
    const deck = decks.find(d => d.id === targetId);
    if (!deck) return null;
    
    const total = deck.words.length;
    const unlearned = deck.unlearned.length;
    const learning = deck.learning.length;
    const mastered = deck.mastered.length;
    
    return {
      total,
      unlearned,
      learning,
      mastered,
      unlearnedPercent: total > 0 ? Math.round((unlearned / total) * 100) : 0,
      learningPercent: total > 0 ? Math.round((learning / total) * 100) : 0,
      masteredPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  },

  refreshDeck: async (deckId: string) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch(`${API_BASE}/api/vocab`);
      const apiWords: ApiWord[] = await response.json();
      
      const words: Word[] = apiWords.map((w, index) => ({
        id: `word-${index}`,
        word: w.word,
        slug: w.slug,
        meaning_en: w.meaning_en || '',
        meaning_kr: w.meaning_kr || '',
      }));
      
      const { decks } = get();
      const deckIndex = decks.findIndex(d => d.id === deckId);
      
      if (deckIndex !== -1) {
        const deck = {
          ...decks[deckIndex],
          words,
          unlearned: words.map(w => w.id),
          learning: [],
          mastered: [],
          updatedAt: Date.now(),
        };
        
        await saveDeck(deck);
        
        const newDecks = [...decks];
        newDecks[deckIndex] = deck;
        set({ decks: newDecks, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to refresh deck:', error);
      set({ isLoading: false });
    }
  },
}));
