import { Routes, Route, useNavigate  } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { auth } from './firebase'; // Импорт Firebase auth
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
import PrivateRoute from "./components/PrivateRoute";
import AdminPrivateRoute from "./components/AdminPrivateRoute";
import TeacherLogin from './components/TeacherLogin';
import TeacherProfile from './components/TeacherProfile';

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние для отслеживания авторизации

  useEffect(() => {
    // Проверка авторизации пользователя при запуске приложения
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true); // Пользователь авторизован
        navigate('/home'); // Перенаправляем на главную страницу
      } else {
        setIsAuthenticated(false); // Пользователь не авторизован
        navigate('/'); // Перенаправляем на страницу входа
      }
    });

    return () => unsubscribe(); // Отписка при размонтировании
  }, [navigate]);

  return (
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authdetails" element={<AuthDetails />} />
          <Route path="/about" element={<PrivateRoute> <About /> </PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute>  <HomePage /> </PrivateRoute>} />
          <Route path="/library" element={<PrivateRoute> <Library /> </PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute> <Schedule /> </PrivateRoute>} />
          <Route path="/teachers" element={<PrivateRoute> <Teachers /> </PrivateRoute>} />
          <Route path="/contacts" element={<PrivateRoute> <Contacts /> </PrivateRoute>} />
          <Route path="/welcomepage" element={<WelcomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/teacher-profile/:id" element={<TeacherProfile />} />
          <Route path="/admin" element={<AdminPrivateRoute> <AdminPanel /> </AdminPrivateRoute>} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="*" element={<NotfoundPage />} />
        </Routes>
  );
}

export default App;