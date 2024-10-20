import { Routes, Route } from "react-router-dom";
import './App.css';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import AuthDetails from './components/AuthDetails';
import HomePage from "./components/HomePage";
import Library from "./components/Library";
import Schedule from "./components/Schedule";
import Teachers from "./components/Teachers";
import Contacts from "./components/Contacts";
import WelcomePage from './components/WelcomePage';
import LibraryPage from './components/LibraryPage';
import TeachersPage from './components/TeachersPage';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import NotfoundPage from './components/NotfoundPage';
import About from './components/About';

function App() {
  return (
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authdetails" element={<AuthDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/welcomepage" element={<WelcomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="*" element={<NotfoundPage />} />
        </Routes>
  );
}

export default App;