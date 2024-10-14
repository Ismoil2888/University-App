// WelcomePage.jsx
import React from 'react';
import { motion } from 'framer-motion';

const WelcomePage = () => {
  // Варианты анимации для шапки
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, type: 'spring', stiffness: 80 } 
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 1 },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Анимированная шапка */}
      <motion.header 
        variants={headerVariants} 
        initial="hidden" 
        animate="visible" 
        style={styles.header}
      >
        <div style={styles.logo}>University App</div>
        <nav style={styles.nav}>
          <a href="#home" style={styles.navLink}>Главная</a>
          <a href="#about" style={styles.navLink}>О нас</a>
          <a href="#contact" style={styles.navLink}>Контакты</a>
        </nav>
      </motion.header>

      {/* Анимированное приветствие */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={styles.textContainer}
      >
        <motion.h1 variants={textVariants} style={styles.heading}>
          Добро пожаловать на наш сайт!
        </motion.h1>
        <motion.p variants={textVariants} style={styles.paragraph}>
          Мы рады видеть вас здесь. Начните свое путешествие с нами.
        </motion.p>
      </motion.div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    padding: '0 20px',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#fff',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    fontSize: '1rem',
    color: '#333',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.3s',
  },
  navLinkHover: {
    color: '#007bff',
  },
  textContainer: {
    textAlign: 'center',
    marginTop: '100px',
  },
  heading: {
    fontSize: '3rem',
    color: '#333',
  },
  paragraph: {
    fontSize: '1.5rem',
    color: '#555',
  },
};

export default WelcomePage;