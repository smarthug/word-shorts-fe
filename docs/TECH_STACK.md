# 기술 스택 상세

## 프론트엔드

### React + Vite + TypeScript
```bash
npm create vite@latest . -- --template react-ts
```

### MUI (Material UI)
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

**사용 컴포넌트:**
- `AppBar` - 상단 바
- `Drawer` - 사이드 메뉴
- `BottomNavigation` - 하단 탭
- `Card` - 단어 카드
- `Avatar` - 프로필 아바타
- `IconButton` - 아이콘 버튼

### React Router
```bash
npm install react-router-dom
```

**라우트 구조:**
```
/           → Shorts (메인)
/deck       → Deck
/quiz       → Quiz
/settings   → Settings
```

### Swiper
```bash
npm install swiper
```

**설정:**
```tsx
<Swiper
  direction="vertical"
  slidesPerView={1}
  mousewheel={true}
  pagination={{ clickable: true }}
>
  {words.map(word => (
    <SwiperSlide key={word.id}>
      <WordCard word={word} />
    </SwiperSlide>
  ))}
</Swiper>
```

### Zustand
```bash
npm install zustand
```

**스토어 예시:**
```typescript
interface AppStore {
  currentWord: VocabWord | null;
  viewedWords: string[];
  setCurrentWord: (word: VocabWord) => void;
  markViewed: (wordId: string) => void;
}
```

---

## 백엔드 (Cloudflare)

### Workers API
- URL: `https://word-shorts-api.kirklayer6590.workers.dev`
- KV: 메타데이터
- R2: 이미지

### API 호출 예시
```typescript
const API_BASE = 'https://word-shorts-api.kirklayer6590.workers.dev';

// 단어 목록
const words = await fetch(`${API_BASE}/api/vocab`).then(r => r.json());

// 이미지 URL
const imageUrl = `${API_BASE}/images/v3/${word.slug}/${filename}`;
```

---

## 프로젝트 구조

```
word-shorts-frontend/
├── docs/
│   ├── PRD.md
│   └── TECH_STACK.md
├── src/
│   ├── components/
│   │   ├── AppBar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Drawer.tsx
│   │   ├── WordCard.tsx
│   │   └── ShortsViewer.tsx
│   ├── pages/
│   │   ├── Shorts.tsx
│   │   ├── Deck.tsx
│   │   └── Quiz.tsx
│   ├── store/
│   │   └── useAppStore.ts
│   ├── api/
│   │   └── vocab.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 타입 체크
npm run typecheck

# 린트
npm run lint
```
