import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Shorts from './pages/Shorts';
import Deck from './pages/Deck';
import Quiz from './pages/Quiz';

function App() {
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
