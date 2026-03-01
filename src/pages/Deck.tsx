import { useRef, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  LinearProgress,
  Paper,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  CheckCircle,
  School,
  HelpOutline,
} from '@mui/icons-material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDeckStore } from '../store/deckStore';
import type { MemorizationStage, Word } from '../types/deck';

// 탭 인덱스 ↔ 스테이지 변환
const STAGES: MemorizationStage[] = ['unlearned', 'learning', 'mastered'];
const STAGE_LABELS: Record<MemorizationStage, string> = {
  unlearned: '미암기',
  learning: '암기중',
  mastered: '완료',
};
const STAGE_ICONS: Record<MemorizationStage, React.ReactNode> = {
  unlearned: <HelpOutline />,
  learning: <School />,
  mastered: <CheckCircle />,
};
const STAGE_COLORS: Record<MemorizationStage, string> = {
  unlearned: '#ff6b6b',
  learning: '#ffd93d',
  mastered: '#6bcb77',
};

// 단어 아이템 컴포넌트
interface WordItemProps {
  word: Word;
  stage: MemorizationStage;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

function WordItem({
  word,
  stage,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}: WordItemProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        mx: 1,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderLeft: `4px solid ${STAGE_COLORS[stage]}`,
      }}
    >
      {/* 왼쪽 이동 버튼 */}
      <IconButton
        size="small"
        onClick={onMoveLeft}
        disabled={!canMoveLeft}
        sx={{ opacity: canMoveLeft ? 1 : 0.3 }}
      >
        <KeyboardArrowLeft />
      </IconButton>

      {/* 단어 정보 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          noWrap
          sx={{ lineHeight: 1.3 }}
        >
          {word.word}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ lineHeight: 1.3 }}
        >
          {word.meaning_kr || word.meaning_en}
        </Typography>
      </Box>

      {/* 오른쪽 이동 버튼 */}
      <IconButton
        size="small"
        onClick={onMoveRight}
        disabled={!canMoveRight}
        sx={{ opacity: canMoveRight ? 1 : 0.3 }}
      >
        <KeyboardArrowRight />
      </IconButton>
    </Paper>
  );
}

// 가상화된 단어 리스트
interface VirtualWordListProps {
  words: Word[];
  stage: MemorizationStage;
  onMove: (wordId: string, to: MemorizationStage) => void;
}

function VirtualWordList({ words, stage, onMove }: VirtualWordListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: words.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // 예상 아이템 높이
    overscan: 5,
  });

  const stageIndex = STAGES.indexOf(stage);

  const handleMoveLeft = useCallback(
    (wordId: string) => {
      if (stageIndex > 0) {
        onMove(wordId, STAGES[stageIndex - 1]);
      }
    },
    [stageIndex, onMove]
  );

  const handleMoveRight = useCallback(
    (wordId: string) => {
      if (stageIndex < STAGES.length - 1) {
        onMove(wordId, STAGES[stageIndex + 1]);
      }
    },
    [stageIndex, onMove]
  );

  if (words.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
        }}
      >
        <Typography>단어가 없습니다</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={parentRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        pt: 1,
      }}
    >
      <Box
        sx={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const word = words[virtualItem.index];
          return (
            <Box
              key={virtualItem.key}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <WordItem
                word={word}
                stage={stage}
                onMoveLeft={() => handleMoveLeft(word.id)}
                onMoveRight={() => handleMoveRight(word.id)}
                canMoveLeft={stageIndex > 0}
                canMoveRight={stageIndex < STAGES.length - 1}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// 메인 Deck 페이지
export default function Deck() {
  const {
    currentStage,
    selectStage,
    moveWord,
    getCurrentDeck,
    getDeckStats,
    isLoading,
  } = useDeckStore();

  const deck = getCurrentDeck();
  const stats = getDeckStats();
  const tabIndex = STAGES.indexOf(currentStage);

  // 현재 스테이지의 단어들
  const currentWords = deck
    ? deck[currentStage]
        .map((id) => deck.words.find((w) => w.id === id))
        .filter((w): w is Word => w !== undefined)
    : [];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    selectStage(STAGES[newValue]);
  };

  const handleMoveWord = useCallback(
    (wordId: string, to: MemorizationStage) => {
      moveWord(wordId, to);
    },
    [moveWord]
  );

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!deck || !stats) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography color="text.secondary">덱을 찾을 수 없습니다</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 통계 헤더 */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {deck.name}
        </Typography>

        {/* 진행률 바 */}
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={stats.masteredPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#eee',
              '& .MuiLinearProgress-bar': {
                backgroundColor: STAGE_COLORS.mastered,
              },
            }}
          />
        </Box>

        {/* 통계 칩 */}
        <Stack direction="row" spacing={1} justifyContent="center">
          {STAGES.map((stage) => (
            <Chip
              key={stage}
              icon={STAGE_ICONS[stage] as React.ReactElement}
              label={`${STAGE_LABELS[stage]} ${stats[stage]}`}
              size="small"
              sx={{
                backgroundColor:
                  stage === currentStage
                    ? STAGE_COLORS[stage]
                    : `${STAGE_COLORS[stage]}33`,
                color: stage === currentStage ? '#fff' : 'inherit',
                fontWeight: stage === currentStage ? 'bold' : 'normal',
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 탭 */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 48,
          },
        }}
      >
        {STAGES.map((stage) => (
          <Tab
            key={stage}
            label={`${STAGE_LABELS[stage]} (${deck[stage].length})`}
            sx={{
              '&.Mui-selected': {
                color: STAGE_COLORS[stage],
              },
            }}
          />
        ))}
      </Tabs>

      {/* 단어 리스트 */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualWordList
          words={currentWords}
          stage={currentStage}
          onMove={handleMoveWord}
        />
      </Box>
    </Box>
  );
}
