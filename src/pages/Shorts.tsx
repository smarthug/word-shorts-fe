import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Mousewheel } from 'swiper/modules';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/virtual';

const API_BASE = 'https://word-shorts-api.kirklayer6590.workers.dev';

// 10개 단어
const WORDS = [
  'replenish',
  'instigate',
  'substantiate',
  'deliberate',
  'strenuous',
  'conjunction',
  'extant',
  'sedentary',
  'invoke',
  'pervasive',
];

interface ImageInfo {
  style_id: string;
  style_name: string;
  path: string;
  variation: number;
}

interface WordData {
  word: string;
  slug: string;
  meaning_en: string;
  meaning_kr: string;
  images: ImageInfo[];
}

// 이미지 URL 생성 (path에서 파일명 추출)
const getImageUrl = (slug: string, path: string) => {
  const filename = path.split('/').pop();
  return `${API_BASE}/images/v3/${slug}/${filename}`;
};

// 네이버 사전 URL 생성
const getNaverDictUrl = (word: string) => {
  return `https://en.dict.naver.com/#/search?query=${encodeURIComponent(word)}`;
};

// TTS 재생 함수
const speakWord = (word: string) => {
  if ('speechSynthesis' in window) {
    // 이전 발화 취소
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
};

export default function Shorts() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wordDataMap, setWordDataMap] = useState<Record<string, WordData>>({});
  const [loading, setLoading] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [ttsEnabled] = useState(true);
  
  // 스와이프 TTS 재생 추적용
  const lastSpokenRef = useRef<string>('');

  // API에서 메타데이터 가져오기
  useEffect(() => {
    const fetchAllWords = async () => {
      setLoading(true);
      const dataMap: Record<string, WordData> = {};
      
      await Promise.all(
        WORDS.map(async (word) => {
          try {
            const res = await fetch(`${API_BASE}/api/vocab/${word}`);
            if (res.ok) {
              const data = await res.json();
              dataMap[word] = data;
            }
          } catch (error) {
            console.error(`Failed to fetch ${word}:`, error);
          }
        })
      );
      
      setWordDataMap(dataMap);
      setLoading(false);
    };

    fetchAllWords();
  }, []);

  // 단어별 슬라이드 데이터
  const wordSlides = useMemo(() => {
    return WORDS.map((slug) => {
      const data = wordDataMap[slug];
      if (data) {
        return {
          slug,
          word: data.word,
          meaning_en: data.meaning_en,
          meaning_kr: data.meaning_kr,
          images: data.images.map((img) => ({
            style: img.style_name,
            styleId: img.style_id,
            url: getImageUrl(slug, img.path),
          })),
        };
      }
      // 데이터 없으면 placeholder
      return {
        slug,
        word: slug.charAt(0).toUpperCase() + slug.slice(1),
        meaning_en: '',
        meaning_kr: '',
        images: [],
      };
    });
  }, [wordDataMap]);

  const handleVerticalSlideChange = useCallback((swiper: any) => {
    setCurrentWordIndex(swiper.activeIndex);
    setCurrentImageIndex(0);
  }, []);

  const handleHorizontalSlideChange = useCallback(
    (swiper: any, wordIdx: number) => {
      if (wordIdx === currentWordIndex) {
        setCurrentImageIndex(swiper.activeIndex);
        
        // 가로 스와이프 시 TTS 재생
        if (ttsEnabled) {
          const word = wordSlides[wordIdx]?.word;
          const key = `${wordIdx}-${swiper.activeIndex}`;
          if (word && lastSpokenRef.current !== key) {
            lastSpokenRef.current = key;
            speakWord(word);
          }
        }
      }
    },
    [currentWordIndex, ttsEnabled, wordSlides]
  );

  const handleToggleMeaning = useCallback(() => {
    setShowMeaning((prev) => !prev);
  }, []);

  const handleOpenNaverDict = useCallback(() => {
    const currentWord = wordSlides[currentWordIndex];
    if (currentWord) {
      window.open(getNaverDictUrl(currentWord.word), '_blank');
    }
  }, [currentWordIndex, wordSlides]);

  const handleSpeakWord = useCallback(() => {
    const currentWord = wordSlides[currentWordIndex];
    if (currentWord) {
      speakWord(currentWord.word);
    }
  }, [currentWordIndex, wordSlides]);

  const currentWord = wordSlides[currentWordIndex];

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
        }}
      >
        <CircularProgress sx={{ color: '#fff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', bgcolor: '#000', position: 'relative' }}>
      {/* 상단 카운터 */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          color: '#fff',
          bgcolor: 'rgba(0,0,0,0.5)',
          px: 2,
          py: 0.5,
          borderRadius: 2,
        }}
      >
        <Typography variant="body2">
          {currentWordIndex + 1} / {WORDS.length}
        </Typography>
      </Box>

      {/* 스와이프 힌트 */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 12,
        }}
      >
        ↑↓ 단어 • ←→ 이미지
      </Box>

      {/* 오른쪽 액션 버튼 (인스타 릴스 스타일) */}
      <Box
        sx={{
          position: 'absolute',
          right: 12,
          bottom: '30%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* TTS 발음 듣기 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleSpeakWord}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
              },
              width: 48,
              height: 48,
            }}
          >
            <VolumeUpIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            발음
          </Typography>
        </Box>

        {/* 뜻 표시 토글 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleToggleMeaning}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
              },
              width: 48,
              height: 48,
            }}
          >
            {showMeaning ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {showMeaning ? '뜻 숨기기' : '뜻 보기'}
          </Typography>
        </Box>

        {/* 네이버 사전 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleOpenNaverDict}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
              },
              width: 48,
              height: 48,
            }}
          >
            <MenuBookIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            사전
          </Typography>
        </Box>
      </Box>

      {/* 세로 Swiper: 단어 간 이동 */}
      <Swiper
        direction="vertical"
        slidesPerView={1}
        mousewheel={{ sensitivity: 1 }}
        speed={300}
        virtual={{
          enabled: true,
          addSlidesAfter: 2,
          addSlidesBefore: 2,
        }}
        modules={[Virtual, Mousewheel]}
        onSlideChange={handleVerticalSlideChange}
        style={{ height: '100%' }}
      >
        {wordSlides.map((wordData, wordIdx) => (
          <SwiperSlide key={wordData.slug} virtualIndex={wordIdx}>
            <WordSlideContent
              wordData={wordData}
              wordIdx={wordIdx}
              currentWordIndex={currentWordIndex}
              showMeaning={showMeaning}
              onHorizontalChange={handleHorizontalSlideChange}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 하단 인디케이터 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* 이미지 도트 */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {currentWord?.images.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: idx === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// 단어 슬라이드 컨텐츠 (메모이제이션)
interface WordSlideData {
  slug: string;
  word: string;
  meaning_en: string;
  meaning_kr: string;
  images: { style: string; styleId: string; url: string }[];
}

interface WordSlideContentProps {
  wordData: WordSlideData;
  wordIdx: number;
  currentWordIndex: number;
  showMeaning: boolean;
  onHorizontalChange: (swiper: any, wordIdx: number) => void;
}

const WordSlideContent = memo(function WordSlideContent({
  wordData,
  wordIdx,
  currentWordIndex,
  showMeaning,
  onHorizontalChange,
}: WordSlideContentProps) {
  // 현재 카드 근처만 horizontal swiper 활성화
  const isNearby = Math.abs(wordIdx - currentWordIndex) <= 1;

  if (!isNearby || wordData.images.length === 0) {
    // 멀리 있는 카드 또는 이미지 없으면 placeholder
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          bgcolor: '#111',
          pt: 8,
        }}
      >
        <Typography variant="h3" sx={{ color: '#fff' }}>
          {wordData.word}
        </Typography>
        {wordData.meaning_kr && (
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, opacity: showMeaning ? 1 : 0, transition: 'opacity 0.2s' }}>
            {wordData.meaning_kr}
          </Typography>
        )}
        {wordData.meaning_en && (
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, opacity: showMeaning ? 1 : 0, transition: 'opacity 0.2s' }}>
            {wordData.meaning_en}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Swiper
      direction="horizontal"
      slidesPerView={1}
      speed={250}
      nested={true}
      onSlideChange={(swiper) => onHorizontalChange(swiper, wordIdx)}
      style={{ height: '100%' }}
    >
      {wordData.images.map((image, slideIdx) => (
        <SwiperSlide key={slideIdx}>
          <ImageSlide wordData={wordData} image={image} showMeaning={showMeaning} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
});

// 이미지 슬라이드 (메모이제이션)
interface ImageSlideProps {
  wordData: WordSlideData;
  image: { style: string; styleId: string; url: string };
  showMeaning: boolean;
}

const ImageSlide = memo(function ImageSlide({ wordData, image, showMeaning }: ImageSlideProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        bgcolor: '#000',
        position: 'relative',
        px: 2,
        pt: 8,
        pb: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* 단어 & 뜻 */}
      <Box sx={{ textAlign: 'center', py: 2, zIndex: 5 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {wordData.word}
        </Typography>
        {wordData.meaning_kr && (
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mt: 1,
              opacity: showMeaning ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            {wordData.meaning_kr}
          </Typography>
        )}
        {wordData.meaning_en && (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              mt: 0.5,
              fontStyle: 'italic',
              opacity: showMeaning ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            {wordData.meaning_en}
          </Typography>
        )}
      </Box>

      {/* 이미지 */}
      <Box sx={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
        {imageLoading && !imageError && (
          <CircularProgress sx={{ position: 'absolute', color: 'rgba(255,255,255,0.5)' }} />
        )}
        {!imageError ? (
          <Box
            component="img"
            src={image.url}
            alt={`${wordData.word} - ${image.style}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            sx={{
              width: '100%',
              maxWidth: 500,
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: 4,
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              maxWidth: 500,
              aspectRatio: '1 / 1',
              bgcolor: '#222',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#666' }}>이미지 로딩 실패</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
});
