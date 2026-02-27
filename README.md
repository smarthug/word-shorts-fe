# Word Shorts Frontend 📱

TikTok/Instagram Reels 스타일의 영어 단어 학습 앱

## 🎯 프로젝트 개요

AI 생성 이미지를 활용한 몰입형 영단어 학습 앱. 세로 스와이프로 단어를 넘기고, 가로 스와이프로 다양한 아트 스타일의 이미지를 탐색합니다.

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Material UI (MUI)
- **상태관리**: Zustand
- **라우팅**: React Router
- **스와이프**: Swiper.js (Virtual)
- **Backend**: Cloudflare Workers + R2 + KV

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📱 주요 기능

### Shorts 페이지
- **세로 스와이프**: 단어 간 이동 (Virtual Swiper로 성능 최적화)
- **가로 스와이프**: 같은 단어의 다른 스타일 이미지 탐색
- **TTS 발음**: Web Speech API로 영어 발음 재생 (스와이프 시 자동)
- **뜻 토글**: 한국어/영어 뜻 표시/숨김
- **네이버 사전**: 원클릭으로 네이버 영어사전 연결

### 하단 네비게이션
- Deck (단어장)
- Shorts (메인 학습)
- Quiz (퀴즈) - Coming Soon

## 🎨 이미지 생성 파이프라인

### v4 (현재)
- **해상도**: 1024×1024 (1:1)
- **시나리오 생성**: GPT-4o
- **이미지 생성**: Flux-2-Klein-4B (ComfyUI)
- **스타일**: 10가지 아트 스타일

자세한 내용: [IMAGE_GENERATION_V4.md](docs/IMAGE_GENERATION_V4.md)

## 🌐 API

- **Base URL**: `https://word-shorts-api.kirklayer6590.workers.dev`
- `GET /api/vocab` - 전체 단어 목록
- `GET /api/vocab/:word` - 단어 상세 (메타데이터)
- `GET /images/v3/{word}/{filename}` - R2 이미지 서빙

## 📂 프로젝트 구조

```
src/
├── api/           # API 호출 함수
├── components/    # 재사용 컴포넌트
│   └── AppLayout.tsx
├── pages/         # 페이지 컴포넌트
│   ├── Shorts.tsx
│   ├── Deck.tsx
│   └── Quiz.tsx
├── store/         # Zustand 스토어
├── types/         # TypeScript 타입
├── App.tsx
└── main.tsx

docs/
├── SHORTS_SPEC.md          # Shorts 페이지 기획서
├── IMAGE_GENERATION_V4.md  # 이미지 생성 파이프라인
├── PRD.md                  # 제품 요구사항
└── TECH_STACK.md           # 기술 스택
```

## 📝 문서

- [Shorts 기획서](docs/SHORTS_SPEC.md)
- [이미지 생성 v4](docs/IMAGE_GENERATION_V4.md)
- [PRD](docs/PRD.md)
- [기술 스택](docs/TECH_STACK.md)

## 🔗 관련 레포지토리

- **word-shorts-app**: 백엔드 + 이미지 생성 스크립트
- **word-shorts-prd**: PRD 문서

## 📅 업데이트 로그

### 2026-02-27
- ✅ **124개 단어** 이미지 생성 완료
- ✅ Cloudflare KV 메타데이터 업로드 완료
- ✅ WordForge 파이프라인 안정화

### 2026-02-26
- ✅ Shorts 페이지 구현 (Virtual Swiper)
- ✅ 액션 버튼 추가 (TTS, 뜻 토글, 네이버 사전)
- ✅ 이미지 파이프라인 v4 (1024x1024, gpt-4o)
- ✅ R2/KV 연동 완료

---

MIT License
