// WelcomePage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMoon, FaHome, FaBook, FaChalkboardTeacher } from 'react-icons/fa';

const WelcomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Варианты анимации для шапки и навигации
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, type: 'spring', stiffness: 80 } 
    },
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 80 },
    },
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  return (
    <div className="page-container">
      {/* Анимированная шапка */}
      <motion.header 
        variants={headerVariants} 
        initial="hidden" 
        animate="visible" 
        className="header"
      >
        <div className="logo">University App</div>
        <div className="icon-button" onClick={toggleTheme}>
          <FaMoon />
        </div>
      </motion.header>

      {/* Анимированное приветствие */}
      <div className="text-container">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }} 
          className="heading"
        >
          Всё что нужно для счастья студента!
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } }} 
          className="paragraph"
        >
          Мы рады видеть вас здесь. Начните свое путешествие с нами.
        </motion.p>
      </div>

      {/* Навигационная панель */}
      <motion.nav 
        variants={navbarVariants} 
        initial="hidden" 
        animate="visible" 
        className="navbar"
      >
        <a href="#">
          <FaHome /> Главная
        </a>
        <a href="#library">
          <FaBook /> Библиотека
        </a>
        <a href="#teachers">
          <FaChalkboardTeacher /> Преподаватели
        </a>
      </motion.nav>
    </div>
  );
};

export default WelcomePage;