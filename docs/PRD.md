# Word Shorts Frontend - PRD

## 개요
TikTok 스타일의 영단어 학습 앱. 세로 스와이프로 단어 카드를 넘기며 학습.

## 기술 스택
- **React** + **Vite**
- **TypeScript**
- **MUI (Material UI)** - UI 컴포넌트
- **React Router** - 라우팅
- **Swiper** - 스와이프 UI
- **Zustand** - 상태 관리

## 백엔드 연동
- **Cloudflare Workers API**: `https://word-shorts-api.kirklayer6590.workers.dev`
- **KV**: 메타데이터 저장
- **R2**: 이미지 저장

### API 엔드포인트
```
GET /api/vocab          - 전체 단어 목록
GET /api/vocab/:word    - 특정 단어 상세
GET /images/v3/:word/:filename.png - 이미지
```

---

## 페이지 구조

### 1. 쇼츠 (Shorts) - 메인
- TikTok 스타일 세로 스와이프
- 참고: https://github.com/smarthug/anki-deck-loader/blob/main/src/components/SwipeViewer.jsx
- 단어 카드 표시 (이미지 + 단어 + 뜻 + 예문)
- 스타일 전환 (10가지 아트 스타일)

### 2. 덱 (Deck) - WIP
- 단어 목록 관리
- 학습 진도 확인
- 덱 생성/편집

### 3. 퀴즈 (Quiz) - WIP
- 빈칸 채우기
- 객관식
- 학습 결과 통계

---

## UI 레이아웃

### 하단 네비게이션 (BottomNavigation)
```
┌─────────┬─────────┬─────────┐
│  쇼츠   │   덱    │  퀴즈   │
│   📱    │   📚    │   ✏️    │
└─────────┴─────────┴─────────┘
```

### 상단 AppBar
```
┌──────────────────────────────┐
│ ☰                      👤    │
│ Drawer                Avatar │
└──────────────────────────────┘
```

#### Drawer 메뉴
- 설정
- 통계
- 정보

#### Avatar 메뉴
- 프로필
- 로그아웃

---

## 데이터 구조

### 단어 (Vocab)
```typescript
interface VocabWord {
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
```

### 학습 진도
```typescript
interface Progress {
  wordId: string;
  viewed: number;
  correct: number;
  lastSeen: Date;
}
```

---

## 참고 자료
- SwipeViewer: https://github.com/smarthug/anki-deck-loader/blob/main/src/components/SwipeViewer.jsx
- Worker API: https://word-shorts-api.kirklayer6590.workers.dev
- 이미지 생성 문서: word-shorts-app/docs/IMAGE_GENERATION_V1.md
