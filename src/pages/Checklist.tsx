import { useRef, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDeckStore } from '../store/deckStore';
import type { MemorizationStage, Word } from '../types/deck';

// 스테이지 설정
const STAGES: {
  key: MemorizationStage | 'all';
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { key: 'all', label: '전체', color: '#666', bgColor: '#f5f5f5' },
  { key: 'unlearned', label: '미암기', color: '#d63031', bgColor: '#ffe8e8' },
  { key: 'learning', label: '암기중', color: '#e17055', bgColor: '#fff3e0' },
  { key: 'mastered', label: '완료', color: '#00a86b', bgColor: '#e8f5e9' },
];

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
  const stage = STAGES.find((s) => s.key === word.stage)!;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        mx: 1,
        mb: 1,
        borderRadius: 2,
        backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
        border: '1px solid #eee',
      }}
    >
      {/* 번호 */}
      <Typography
        sx={{
          width: 32,
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {index + 1}
      </Typography>

      {/* 단어 + 뜻 */}
      <Box sx={{ flex: 1, minWidth: 0, ml: 1 }}>
        <Typography fontWeight="bold" sx={{ color: '#333' }}>
          {word.word}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }} noWrap>
          {word.meaning_kr || word.meaning_en}
        </Typography>
      </Box>

      {/* 상태 배지 */}
      <Chip
        label={stage.label}
        size="small"
        sx={{
          backgroundColor: stage.bgColor,
          color: stage.color,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 26,
        }}
      />
    </Paper>
  );
}

export default function Checklist() {
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<MemorizationStage | 'all'>('all');
  const parentRef = useRef<HTMLDivElement>(null);

  const { getCurrentDeck, getDeckStats, isLoading } = useDeckStore();
  const deck = getCurrentDeck();
  const stats = getDeckStats();

  // 모든 단어 + 스테이지 정보
  const allWords = useMemo(() => {
    if (!deck) return [];

    const words: WordWithStage[] = [];
    const stages: MemorizationStage[] = ['unlearned', 'learning', 'mastered'];

    for (const stage of stages) {
      for (const wordId of deck[stage]) {
        const word = deck.words.find((w) => w.id === wordId);
        if (word) {
          words.push({ ...word, stage });
        }
      }
    }

    // 단어순 정렬
    words.sort((a, b) => a.word.localeCompare(b.word));

    return words;
  }, [deck]);

  // 검색 + 필터 적용
  const filteredWords = useMemo(() => {
    return allWords.filter((word) => {
      // 스테이지 필터
      if (filterStage !== 'all' && word.stage !== filterStage) return false;

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
    estimateSize: () => 72,
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
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: '#ddd',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
          }}
        />

        {/* 필터 칩 */}
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {STAGES.map((stage) => {
            const count =
              stage.key === 'all' ? stats.total : stats[stage.key];
            const isSelected = filterStage === stage.key;

            return (
              <Chip
                key={stage.key}
                label={`${stage.label} ${count}`}
                size="small"
                onClick={() => setFilterStage(stage.key)}
                sx={{
                  backgroundColor: isSelected ? stage.color : stage.bgColor,
                  color: isSelected ? '#fff' : stage.color,
                  fontWeight: 600,
                  border: isSelected ? 'none' : `1px solid ${stage.color}33`,
                  '&:hover': {
                    backgroundColor: isSelected
                      ? stage.color
                      : `${stage.color}22`,
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* 결과 카운트 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredWords.length}개 단어
          {search && ` (검색: "${search}")`}
        </Typography>
      </Box>

      {/* 가상화 리스트 */}
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
