import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Shorts from './pages/Shorts';
import Deck from './pages/Deck';
import Quiz from './pages/Quiz';
import { useDeckStore } from './store/deckStore';

function App() {
  const initialize = useDeckStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Shorts />} />
        <Route path="/deck" element={<Deck />} />
        <Route path="/quiz" element={<Quiz />} />
      </Route>
    </Routes>
  );
}

export default App;
