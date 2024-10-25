import React from "react";
import { Link } from "react-router-dom"
import { FaUser } from "react-icons/fa"; // Импорт иконки крестика
import "../App.css";
import "../about.css";
import { useState } from 'react';
import facultyLogo from "../logo.png";
import teacherImage from "../teacher.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";

const About = () => {
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
    <div>
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

      <section className="about-hero">
        <h1 className="about-h1">О факультете информационной безопасности</h1>
        <div className="faculty-image">
          <img style={{ height: "175px" }} width="175px" src={facultyLogo} alt="Фото факультета информационной безопасности" />
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <h2>Информация о факультете</h2>
          <p>
            Факультет информационных и коммуникационных технологий Таджикского технического университета имени академика М. С. Осими
            является одной из составляющих структур университета и готовит специалистов в области информационных и коммуникационных
            технологий и управления. На факультете функционируют 7 кафедр, из которых 3 кафедры – кафедр высшей математики,
            обществоведения и информатики и вычислительной техники являются общеобразовательными кафедрами, а 4 кафедры – кафедры
            автоматизированных систем управления, автоматизации технологических и производственных процессов, информационных технологий
            и защиты данных и сетей связи и коммутационных систем являются профильными отделами.
          </p>

          <div className="faculty-image">
            <img src={teacherImage} alt="Фото факультета информационной безопасности" />
          </div>

          <p>
            Наши выпускники востребованы на рынке труда и занимают высокие позиции в различных компаниях, обеспечивая защиту данных и
            информационных систем.
          </p>
          <p>
            Факультет активно сотрудничает с ведущими специалистами и организациями, что позволяет нашим студентам получать актуальные
            знания и практические навыки.
          </p>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default About;