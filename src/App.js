import { Routes, Route } from "react-router-dom";
import './App.css';
import WelcomePage from './components/WelcomePage';
import NotfoundPage from './components/NotfoundPage';

function App() {
  return (
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="*" element={<NotfoundPage />} />
        </Routes>
  );
}

export default App;