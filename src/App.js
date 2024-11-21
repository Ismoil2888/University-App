import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import './App.css';
import { auth } from './firebase';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import AuthDetails from './components/AuthDetails';
import HomePage from "./components/HomePage";
import Library from "./components/Library";
import Schedule from "./components/Schedule";
import Teachers from "./components/Teachers";
import Contacts from "./components/Contacts";
import WelcomePage from './components/WelcomePage';
import TeachersPage from './components/TeachersPage';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import NotfoundPage from './components/NotfoundPage';
import About from './components/About';
import PrivateRoute from "./components/PrivateRoute";
import AdminPrivateRoute from "./components/AdminPrivateRoute";
import TeacherLogin from './components/TeacherLogin';
import TeacherProfile from './components/TeacherProfile';
import SearchPage  from './components/SearchPage';
import UserProfile from './components/UserProfile';
import MyProfile from './components/MyProfile';
import SearchStudents from './components/SearchStudents';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // состояние для загрузки

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false); // завершаем загрузку после получения статуса авторизации
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    // Показываем загрузочный экран, пока идет проверка
    return <div className="loading-container">
    <div className="loading-circuit">
        <div className="circle"></div>
        <div className="line"></div>
        <div className="circle"></div>
        <div className="line"></div>
        <div className="circle"></div>
    </div>
    <p className="loading-text">Securing Connection...</p>
</div>;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <HomePage /> : <SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/authdetails" element={<AuthDetails />} />
      <Route path="/myprofile" element={<MyProfile />} />
      <Route path="/profile/:userId" element={<UserProfile />} />      
      <Route path="/about" element={<PrivateRoute> <About /> </PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute>  <HomePage /> </PrivateRoute>} />
      <Route path="/schedule" element={<PrivateRoute> <Schedule /> </PrivateRoute>} />
      <Route path="/teachers" element={<PrivateRoute> <Teachers /> </PrivateRoute>} />
      <Route path="/library" element={<PrivateRoute> <Library /> </PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute> <Contacts /> </PrivateRoute>} />
      <Route path="/searchpage" element={<PrivateRoute> <SearchPage /> </PrivateRoute>} />
      <Route path="/searchstudents" element={<PrivateRoute> <SearchStudents /> </PrivateRoute>} />
      <Route path="/welcomepage" element={<WelcomePage />} />
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