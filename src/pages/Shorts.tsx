import { useState, useMemo, useCallback, memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Mousewheel } from 'swiper/modules';
import { Box, Typography } from '@mui/material';

// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/virtual';

const API_BASE = 'https://word-shorts-api.kirklayer6590.workers.dev';

// 10개 단어
const WORDS = [
  'Replenish',
  'Instigate',
  'Substantiate',
  'Deliberate',
  'Strenuous',
  'Conjunction',
  'Extant',
  'Sedentary',
  'Invoke',
  'Pervasive',
];

// 10가지 스타일
const STYLES = [
  'pastel',
  'anime',
  'ghibli',
  'disney',
  'comic',
  'watercolor',
  'minimalist',
  'pixel_art',
  'pop_art',
  'concept_art',
];

// 이미지 URL 생성
const getImageUrl = (word: string, style: string) => {
  const slug = word.toLowerCase();
  return `${API_BASE}/images/v3/${slug}/${slug}_${style}.png`;
};

export default function Shorts() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 단어별 이미지 슬라이드 데이터
  const wordSlides = useMemo(() => {
    return WORDS.map((word) => ({
      word,
      images: STYLES.map((style) => ({
        style,
        url: getImageUrl(word, style),
      })),
    }));
  }, []);

  const handleVerticalSlideChange = useCallback((swiper: any) => {
    setCurrentWordIndex(swiper.activeIndex);
    setCurrentImageIndex(0);
  }, []);

  const handleHorizontalSlideChange = useCallback(
    (swiper: any, wordIdx: number) => {
      if (wordIdx === currentWordIndex) {
        setCurrentImageIndex(swiper.activeIndex);
      }
    },
    [currentWordIndex]
  );

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
          <SwiperSlide key={wordData.word} virtualIndex={wordIdx}>
            <WordSlideContent
              wordData={wordData}
              wordIdx={wordIdx}
              currentWordIndex={currentWordIndex}
              currentImageIndex={currentImageIndex}
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
          {STYLES.map((_, idx) => (
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
        {/* 스타일 라벨 */}
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {STYLES[currentImageIndex]}
        </Typography>
      </Box>
    </Box>
  );
}

// 단어 슬라이드 컨텐츠 (메모이제이션)
interface WordSlideContentProps {
  wordData: { word: string; images: { style: string; url: string }[] };
  wordIdx: number;
  currentWordIndex: number;
  currentImageIndex: number;
  onHorizontalChange: (swiper: any, wordIdx: number) => void;
}

const WordSlideContent = memo(function WordSlideContent({
  wordData,
  wordIdx,
  currentWordIndex,
  onHorizontalChange,
}: WordSlideContentProps) {
  // 현재 카드 근처만 horizontal swiper 활성화
  const isNearby = Math.abs(wordIdx - currentWordIndex) <= 1;

  if (!isNearby) {
    // 멀리 있는 카드는 placeholder만
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#111',
        }}
      >
        <Typography variant="h3" sx={{ color: '#fff' }}>
          {wordData.word}
        </Typography>
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
          <ImageSlide word={wordData.word} image={image} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
});

// 이미지 슬라이드 (메모이제이션)
interface ImageSlideProps {
  word: string;
  image: { style: string; url: string };
}

const ImageSlide = memo(function ImageSlide({ word, image }: ImageSlideProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#000',
        position: 'relative',
      }}
    >
      {/* 이미지 */}
      {!imageError ? (
        <Box
          component="img"
          src={image.url}
          alt={`${word} - ${image.style}`}
          onError={() => setImageError(true)}
          sx={{
            maxWidth: '100%',
            maxHeight: '70%',
            objectFit: 'contain',
            borderRadius: 2,
          }}
        />
      ) : (
        <Box
          sx={{
            width: '80%',
            height: '50%',
            bgcolor: '#222',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: '#666' }}>Image not found</Typography>
        </Box>
      )}

      {/* 단어 */}
      <Typography
        variant="h4"
        sx={{
          color: '#fff',
          mt: 3,
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {word}
      </Typography>
    </Box>
  );
});
