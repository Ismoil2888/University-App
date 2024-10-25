import React from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa"; // Импорт иконки крестика
import "../App.css"; // Импортируем стили
import facultyLogo from "../logo.png";
import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    const toggleMenu = () => {
      if (isMenuOpen) {
        setTimeout(() => {
          setIsMenuOpen(false);
        }, 0); // Задержка для плавного исчезновения
      } else {
        setIsMenuOpen(true);
      }
    };

  return (
    <div className="home-container">
      <header>
        <nav>
          <ul>
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/about">О факультете</Link></li>
            <li><Link to="/teachers">Преподаватели</Link></li>
            <li><Link to="/schedule">Расписание</Link></li>
            <li><Link to="/library">Библиотека</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
          <ul>
            <li>
              <Link to="/authdetails">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
          </ul>
        </nav>

        <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          
          <span className="bm-span"></span>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
        </div>

        <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
        <ul>
           <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
           <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
           <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
           <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
           <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
           <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
           <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
        </ul>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <h1>Добро пожаловать на факультет Кибербезопасности</h1>
          <p>Изучайте и защищайте цифровой мир вместе с нами.</p>
        </section>

        <div className="faculty-image">
          <img style={{ width: "300px", height: "300px" }} src={facultyLogo} alt="Фото факультета информационной безопасности" />
        </div>

        <section className="news">
          <h2>Последние новости</h2>

          <article>
            <h3>Открытие нового учебного года</h3>
            <p>
              Приглашаем всех студентов на торжественное открытие нового учебного года. Подробности внутри.
            </p>
          </article>

          <article>
            <h3>Киберфорум 2024</h3>
            <p>
              Присоединяйтесь к крупнейшему форуму по кибербезопасности. Узнайте о новых тенденциях и угрозах в области информационной безопасности.
            </p>
          </article>
        </section>
      </main>

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default HomePage;