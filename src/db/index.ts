import Dexie, { type Table } from 'dexie';
import type { Deck } from '../types/deck';

// Dexie 데이터베이스 클래스
class WordShortsDB extends Dexie {
  decks!: Table<Deck, string>;

  constructor() {
    super('WordShortsDB');
    
    this.version(1).stores({
      decks: 'id, name, createdAt, updatedAt'
    });
  }
}

// 싱글톤 인스턴스
export const db = new WordShortsDB();

// 헬퍼 함수들
export async function getAllDecks(): Promise<Deck[]> {
  return db.decks.toArray();
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return db.decks.get(id);
}

export async function saveDeck(deck: Deck): Promise<string> {
  deck.updatedAt = Date.now();
  return db.decks.put(deck);
}

export async function deleteDeck(id: string): Promise<void> {
  return db.decks.delete(id);
}

export async function clearAllDecks(): Promise<void> {
  return db.decks.clear();
}
