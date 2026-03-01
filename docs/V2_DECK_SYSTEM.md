# Word Shorts 2.0 - 덱 시스템 PRD

> **브랜치**: `feature/v2-deck-system`
> **시작일**: 2026-03-01

---

## 📋 개요

Git의 staging/commit 컨셉을 차용한 단어 암기 단계 관리 시스템

---

## 🎯 핵심 개념

### 덱 (Deck) 구조

```
┌─────────────────────────────────────────────────────────┐
│                        덱 (Deck)                        │
├─────────────────────────────────────────────────────────┤
│  📦 원본 배열 (immutable)                               │
│     └── 영단어 원본 데이터, 절대 수정 안 됨              │
│                                                         │
│  📋 미암기 배열                                         │
│     └── 초기에 원본 클론, 암기 시작 전 단어들            │
│                                                         │
│  🔄 암기 중 배열                                        │
│     └── 현재 학습 중인 단어들                           │
│                                                         │
│  ✅ 암기 완료 배열                                      │
│     └── 완전히 암기한 단어들                            │
└─────────────────────────────────────────────────────────┘
```

### 단어 이동 흐름

```
미암기 ──────────────────────────────────► 암기 중
   │                                          │
   │                                          │
   │                                          ▼
   │                                      암기 완료
   │                                          │
   │          ◄────────────────────────────────
   │          (다시 학습 필요시)
   ▼
[Git 비유: Working Dir → Staging → Committed]
```

---

## 🛠️ 기술 스택

### 상태 관리
- **Zustand**: 전역 상태 (현재 선택된 덱, 암기 단계)

### 로컬 저장소
- **IndexedDB**: 덱 데이터 영구 저장
- **Wrapper 후보**:
  - `Dexie.js` - 인기, 문서 풍부
  - `idb` - 경량, Promise 기반

### UI
- **Virtualized List**: 대용량 단어 목록 (react-virtualized 또는 @tanstack/react-virtual)
- **MUI**: 기존 유지

---

## 📱 페이지 구조

### 1. AppBar (공통)

```
┌─────────────────────────────────────────────────────────┐
│  [←]     📚 기초영단어 | 미암기 (120/500)        [···]  │
└─────────────────────────────────────────────────────────┘
            ↑ 현재 덱명     ↑ 현재 단계 (진행률)
```

### 2. 덱 뷰 페이지 (`/deck`)

```
┌─────────────────────────────────────────────────────────┐
│  덱 선택                                                │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ 기초영단어   │  │ 토익필수    │  │ 비즈니스    │     │
│  │ 500 words   │  │ 1000 words  │  │ 300 words   │     │
│  │ ████░░ 45%  │  │ ██░░░░ 20%  │  │ █░░░░░ 10%  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  암기 단계 선택                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐                    │
│  │ 미암기  │  │ 암기중  │  │ 완료   │                    │
│  │ 120    │  │ 80     │  │ 300    │                    │
│  └────────┘  └────────┘  └────────┘                    │
├─────────────────────────────────────────────────────────┤
│  [카드뷰] [테이블뷰]                    [쇼츠 시작 →]   │
└─────────────────────────────────────────────────────────┘
```

### 3. 테이블 뷰 페이지 (`/table`)

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 미암기    │  │ 암기 중   │  │ 암기 완료 │  ← 클릭시   │
│  │ 120/500  │  │ 80/500   │  │ 300/500  │    필터링    │
│  │   24%    │  │   16%    │  │   60%    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
├─────────────────────────────────────────────────────────┤
│  [  ] 3 selected                    [More Actions ▼]   │
├─────────────────────────────────────────────────────────┤
│  [  ] │ ◀ │ abandon    │ 버리다      │ ▶ │             │
│  [✓] │ ◀ │ ability    │ 능력        │ ▶ │             │
│  [✓] │ ◀ │ abolish    │ 폐지하다    │ ▶ │             │
│  [  ] │ ◀ │ abroad     │ 해외에      │ ▶ │             │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
     ↑      ↑                              ↑
  체크박스  이전 단계로              다음 단계로
```

### 4. 쇼츠 뷰 페이지 (`/shorts`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [이미지]                             │
│                                                         │
│                   "abandon"                             │
│                   버리다                                │
│                                                         │
│     [🔊]    [👁️]    [📖]    [✅ 암기]                  │
│                                   ↑                     │
│                        미암기→암기중 / 암기중→완료       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 데이터 구조

### TypeScript 타입

```typescript
// 단어 타입
interface Word {
  id: string;
  word: string;        // 영단어
  meaning_kr: string;  // 한국어 뜻
  meaning_en: string;  // 영어 뜻
  slug: string;        // URL용
}

// 암기 단계
type MemorizationStage = 'unlearned' | 'learning' | 'mastered';

// 덱 타입
interface Deck {
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

// Zustand 스토어
interface DeckStore {
  // 현재 상태
  currentDeckId: string | null;
  currentStage: MemorizationStage;
  
  // 덱 관리
  decks: Deck[];
  loadDecks: () => Promise<void>;
  selectDeck: (deckId: string) => void;
  selectStage: (stage: MemorizationStage) => void;
  
  // 단어 이동
  moveWord: (wordId: string, from: MemorizationStage, to: MemorizationStage) => void;
  moveWords: (wordIds: string[], from: MemorizationStage, to: MemorizationStage) => void;
  
  // 통계
  getStats: (deckId: string) => {
    total: number;
    unlearned: number;
    learning: number;
    mastered: number;
  };
}
```

### IndexedDB 스키마 (Dexie)

```typescript
// db.ts
import Dexie from 'dexie';

class WordShortsDB extends Dexie {
  decks!: Table<Deck, string>;
  
  constructor() {
    super('WordShortsDB');
    this.version(1).stores({
      decks: 'id, name, createdAt, updatedAt'
    });
  }
}

export const db = new WordShortsDB();
```

---

## 📝 개발 태스크

### Phase 1: 기반 작업

- [ ] IndexedDB 설정 (Dexie)
- [ ] Deck 타입 정의
- [ ] Zustand 스토어 리팩토링
- [ ] 기본 덱 데이터 마이그레이션 (기존 124개 단어)

### Phase 2: 덱 뷰 페이지

- [ ] 덱 선택 UI
- [ ] 암기 단계 선택 UI
- [ ] 진행률 표시 (퍼센트, 분수)
- [ ] 카드뷰/테이블뷰 토글

### Phase 3: 테이블 뷰 페이지

- [ ] Virtualized 테이블 구현
- [ ] 체크박스 다중 선택
- [ ] 좌우 화살표 이동 버튼
- [ ] 상단 단계별 카드
- [ ] More Actions 메뉴
- [ ] 카드뷰 전환 (스와이프)

### Phase 4: 쇼츠 뷰 업데이트

- [ ] 암기 버튼 추가
- [ ] 현재 단계 배열만 표시
- [ ] 단계 이동 기능

### Phase 5: AppBar 업데이트

- [ ] 현재 덱/단계 표시
- [ ] 진행률 표시

---

## ✅ 기술 결정 사항 (2026-03-01 확정)

### 1. IndexedDB Wrapper: **Dexie.js** ✅

- 문서 풍부, 커뮤니티 큼
- 타입스크립트 지원 우수
- 복잡한 쿼리, 마이그레이션 지원

```bash
npm install dexie
```

### 2. Virtualization: **@tanstack/react-virtual** ✅

- 최신, 경량, 유연
- React 18 호환

```bash
npm install @tanstack/react-virtual
```

### 3. 데이터 전략: **로컬 우선 (Local-First)** ✅

```
앱 시작
  ↓
IndexedDB에 덱 있음?
  ├─ YES → 로컬 데이터 사용 (빠름!)
  └─ NO  → API에서 가져와서 IndexedDB에 저장
              ↓
         다음부터는 로컬 사용
```

**장점:**
- 첫 로딩만 API 호출
- 이후 오프라인에서도 작동
- 암기 진행률이 로컬에 저장됨
- 나중에 "덱 새로고침" 버튼으로 API에서 다시 가져오기 가능

---

## 🚀 다음 단계

1. ~~이 문서 검토 및 피드백~~ ✅
2. ~~기술 선택 확정~~ ✅
3. **Phase 1 시작** ← 현재

---

*작성일: 2026-03-01*
