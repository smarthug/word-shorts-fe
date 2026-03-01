import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Shorts from './pages/Shorts';
import Deck from './pages/Deck';
import Table from './pages/Table';
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
        <Route path="/table" element={<Table />} />
      </Route>
    </Routes>
  );
}

export default App;
