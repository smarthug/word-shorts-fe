import { useRef, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDeckStore } from '../store/deckStore';
import type { MemorizationStage, Word } from '../types/deck';

// 스테이지 색상
const STAGE_COLORS: Record<MemorizationStage, string> = {
  unlearned: '#ff6b6b',
  learning: '#ffd93d',
  mastered: '#6bcb77',
};

const STAGE_LABELS: Record<MemorizationStage, string> = {
  unlearned: '미암기',
  learning: '암기중',
  mastered: '완료',
};

// 단어 + 스테이지 정보
interface WordWithStage extends Word {
  stage: MemorizationStage;
}

// 테이블 행 컴포넌트
interface TableRowProps {
  word: WordWithStage;
  index: number;
}

function TableRow({ word, index }: TableRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        borderBottom: '1px solid #eee',
        backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
      }}
    >
      {/* 번호 */}
      <Typography
        sx={{
          width: 40,
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
      >
        {index + 1}
      </Typography>

      {/* 단어 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight="bold" noWrap>
          {word.word}
        </Typography>
      </Box>

      {/* 뜻 */}
      <Box sx={{ flex: 2, minWidth: 0, px: 1 }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {word.meaning_kr || word.meaning_en}
        </Typography>
      </Box>

      {/* 스테이지 */}
      <Chip
        label={STAGE_LABELS[word.stage]}
        size="small"
        sx={{
          backgroundColor: STAGE_COLORS[word.stage],
          color: '#fff',
          fontSize: '0.7rem',
          height: 24,
        }}
      />
    </Box>
  );
}

export default function Table() {
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<MemorizationStage | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const { getCurrentDeck, getDeckStats, isLoading } = useDeckStore();
  const deck = getCurrentDeck();
  const stats = getDeckStats();

  // 모든 단어 + 스테이지 정보
  const allWords = useMemo(() => {
    if (!deck) return [];

    const words: WordWithStage[] = [];

    // 스테이지별로 단어 추가
    const stages: MemorizationStage[] = ['unlearned', 'learning', 'mastered'];
    for (const stage of stages) {
      for (const wordId of deck[stage]) {
        const word = deck.words.find((w) => w.id === wordId);
        if (word) {
          words.push({ ...word, stage });
        }
      }
    }

    return words;
  }, [deck]);

  // 검색 + 필터 적용
  const filteredWords = useMemo(() => {
    return allWords.filter((word) => {
      // 스테이지 필터
      if (filterStage && word.stage !== filterStage) return false;

      // 검색 필터
      if (search) {
        const q = search.toLowerCase();
        return (
          word.word.toLowerCase().includes(q) ||
          word.meaning_kr?.toLowerCase().includes(q) ||
          word.meaning_en?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allWords, search, filterStage]);

  const virtualizer = useVirtualizer({
    count: filteredWords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  if (isLoading || !deck || !stats) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography color="text.secondary">로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        {/* 검색 */}
        <TextField
          fullWidth
          size="small"
          placeholder="단어 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        {/* 필터 칩 */}
        <Stack direction="row" spacing={1}>
          <Chip
            label={`전체 ${stats.total}`}
            size="small"
            variant={filterStage === null ? 'filled' : 'outlined'}
            onClick={() => setFilterStage(null)}
          />
          <Chip
            label={`미암기 ${stats.unlearned}`}
            size="small"
            variant={filterStage === 'unlearned' ? 'filled' : 'outlined'}
            onClick={() =>
              setFilterStage(filterStage === 'unlearned' ? null : 'unlearned')
            }
            sx={{
              backgroundColor:
                filterStage === 'unlearned' ? STAGE_COLORS.unlearned : undefined,
              color: filterStage === 'unlearned' ? '#fff' : undefined,
            }}
          />
          <Chip
            label={`암기중 ${stats.learning}`}
            size="small"
            variant={filterStage === 'learning' ? 'filled' : 'outlined'}
            onClick={() =>
              setFilterStage(filterStage === 'learning' ? null : 'learning')
            }
            sx={{
              backgroundColor:
                filterStage === 'learning' ? STAGE_COLORS.learning : undefined,
              color: filterStage === 'learning' ? '#fff' : undefined,
            }}
          />
          <Chip
            label={`완료 ${stats.mastered}`}
            size="small"
            variant={filterStage === 'mastered' ? 'filled' : 'outlined'}
            onClick={() =>
              setFilterStage(filterStage === 'mastered' ? null : 'mastered')
            }
            sx={{
              backgroundColor:
                filterStage === 'mastered' ? STAGE_COLORS.mastered : undefined,
              color: filterStage === 'mastered' ? '#fff' : undefined,
            }}
          />
        </Stack>
      </Box>

      {/* 테이블 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.5,
          borderBottom: '2px solid #ddd',
          backgroundColor: '#f5f5f5',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: 'text.secondary',
        }}
      >
        <Box sx={{ width: 40 }}>#</Box>
        <Box sx={{ flex: 1 }}>단어</Box>
        <Box sx={{ flex: 2, px: 1 }}>뜻</Box>
        <Box sx={{ width: 60, textAlign: 'center' }}>상태</Box>
      </Box>

      {/* 가상화 테이블 */}
      <Box
        ref={parentRef}
        sx={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {filteredWords.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
            }}
          >
            <Typography color="text.secondary">
              {search ? '검색 결과가 없습니다' : '단어가 없습니다'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const word = filteredWords[virtualItem.index];
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
                  <TableRow word={word} index={virtualItem.index} />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
