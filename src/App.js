import { Routes, Route } from "react-router-dom";
import './App.css';
import WelcomePage from './components/WelcomePage';
import LibraryPage from './components/LibraryPage';
import TeachersPage from './components/TeachersPage';
import AdminPanel from './components/AdminPanel';
import NotfoundPage from './components/NotfoundPage';

function App() {
  return (
        <Routes>
          <Route path="/home" element={<WelcomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotfoundPage />} />
        </Routes>
  );
}

export default App;