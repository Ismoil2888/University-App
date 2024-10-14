// WelcomePage.jsx
import React from 'react';
import { motion } from 'framer-motion';

const WelcomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.5 },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <div style={styles.pageContainer}>
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
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    color: '#333',
  },
  paragraph: {
    fontSize: '1.5rem',
    color: '#555',
  },
};

export default WelcomePage;
