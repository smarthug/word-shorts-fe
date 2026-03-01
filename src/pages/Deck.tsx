import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  LinearProgress,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  HelpOutline,
  School,
  CheckCircle,
  PlayArrow,
} from '@mui/icons-material';
import { useDeckStore } from '../store/deckStore';
import type { MemorizationStage } from '../types/deck';

// 스테이지 설정
const STAGES: {
  key: MemorizationStage;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: 'unlearned', label: '미암기', icon: <HelpOutline />, color: '#ff6b6b' },
  { key: 'learning', label: '암기중', icon: <School />, color: '#ffd93d' },
  { key: 'mastered', label: '완료', icon: <CheckCircle />, color: '#6bcb77' },
];

export default function Deck() {
  const navigate = useNavigate();
  const {
    currentStage,
    selectStage,
    getCurrentDeck,
    getDeckStats,
    isLoading,
  } = useDeckStore();

  const deck = getCurrentDeck();
  const stats = getDeckStats();

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }} color="text.secondary">
          로딩 중...
        </Typography>
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
          p: 3,
        }}
      >
        <Typography color="text.secondary">
          덱을 찾을 수 없습니다
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 덱 정보 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {deck.name}
        </Typography>
        {deck.description && (
          <Typography variant="body2" color="text.secondary">
            {deck.description}
          </Typography>
        )}
      </Box>

      {/* 전체 진행률 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              전체 진행률
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              {stats.mastered} / {stats.total} ({stats.masteredPercent}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stats.masteredPercent}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: '#eee',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#6bcb77',
                borderRadius: 6,
              },
            }}
          />
          
          {/* 단계별 미니 통계 */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="center">
            {STAGES.map((stage) => (
              <Chip
                key={stage.key}
                icon={stage.icon as React.ReactElement}
                label={`${stage.label} ${stats[stage.key]}`}
                size="small"
                sx={{
                  backgroundColor: `${stage.color}22`,
                  '& .MuiChip-icon': {
                    color: stage.color,
                  },
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* 암기 단계 선택 */}
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        학습할 단계 선택
      </Typography>

      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {STAGES.map((stage) => {
          const count = stats[stage.key];
          const isSelected = currentStage === stage.key;
          const percent = stats.total > 0 
            ? Math.round((count / stats.total) * 100) 
            : 0;

          return (
            <Card
              key={stage.key}
              sx={{
                border: isSelected ? `2px solid ${stage.color}` : '2px solid transparent',
                backgroundColor: isSelected ? `${stage.color}11` : undefined,
              }}
            >
              <CardActionArea onClick={() => selectStage(stage.key)}>
                <CardContent sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* 아이콘 */}
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: `${stage.color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stage.color,
                      }}
                    >
                      {stage.icon}
                    </Box>

                    {/* 텍스트 */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {stage.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count}개 단어 ({percent}%)
                      </Typography>
                    </Box>

                    {/* 체크 표시 */}
                    {isSelected && (
                      <CheckCircle sx={{ color: stage.color }} />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>

      {/* 쇼츠 시작 버튼 */}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<PlayArrow />}
          onClick={() => navigate('/')}
          disabled={stats[currentStage] === 0}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontSize: '1.1rem',
          }}
        >
          {currentStage === 'unlearned' && '학습 시작'}
          {currentStage === 'learning' && '복습하기'}
          {currentStage === 'mastered' && '다시 보기'}
          {' '}({stats[currentStage]}개)
        </Button>
      </Box>
    </Box>
  );
}
