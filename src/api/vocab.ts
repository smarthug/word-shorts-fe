export const API_BASE = 'https://word-shorts-api.kirklayer6590.workers.dev';

export const getVocabList = async () => {
  const res = await fetch(`${API_BASE}/api/vocab`);
  return res.json();
};

export const getVocabWord = async (word: string) => {
  const res = await fetch(`${API_BASE}/api/vocab/${word}`);
  return res.json();
};

export const getImageUrl = (slug: string, filename: string) =>
  `${API_BASE}/images/v3/${slug}/${filename}`;
