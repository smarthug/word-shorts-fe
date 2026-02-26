import { create } from 'zustand';
import type { VocabWord } from '../types';

interface AppStore {
  currentWord: VocabWord | null;
  viewedWords: string[];
  setCurrentWord: (word: VocabWord) => void;
  markViewed: (wordId: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentWord: null,
  viewedWords: [],
  setCurrentWord: (word) => set({ currentWord: word }),
  markViewed: (wordId) =>
    set((state) => ({
      viewedWords: state.viewedWords.includes(wordId)
        ? state.viewedWords
        : [...state.viewedWords, wordId],
    })),
}));
