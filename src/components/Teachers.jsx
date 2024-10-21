import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "../teachers.css";
import teacherimg from "../teacher.png";
import karimzodaimg from "../Каримзода.jpg"

const Teachers = () => {
  const [activeDescription, setActiveDescription] = useState(null);

  const toggleDescription = (id) => {
    setActiveDescription(activeDescription === id ? null : id);
  };

  const teachersData = [
    {
      id: "desc1",
      name: "Каримзода Ҷамшед Ҳалим",
      role: "Декан факультета, номзади илмҳои техникӣ, и.в. дотсент",
      image: "images/Каримзода.jpg",
      description: "Полное описание о преподавателе 1, его опыте, науках и курсах.",
    },
    {
      id: "desc2",
      name: "Имя Преподавателя 2",
      role: "Краткая информация о преподавателе 2",
      image: "images/Каримзода.jpg",
      description: "Декани факултет, номзади илмҳои техникӣ, и.в. дотсент",
    },
    // Добавьте больше данных преподавателей по аналогии
  ];

  const toggleMenu = () => {
    // Логика открытия/закрытия бургер-меню
    const menu = document.querySelector(".burger-menu");
    menu.classList.toggle("open");
  };

  return (
    <div className="glav-cotainer">
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
        </nav>

        <div className="burger-menu-icon" onClick={() => toggleMenu()}>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
        </div>

        <div className="burger-menu">
          <ul>
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/about">О факультете</Link></li>
            <li><Link to="/teachers">Преподаватели</Link></li>
            <li><Link to="/schedule">Расписание</Link></li>
            <li><Link to="/library">Библиотека</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
            <li><Link to="/authdetails">Настройки Профиля</Link></li>
          </ul>
        </div>
      </header>

      <section className="tch-hero">
        <div className="faculty-image">
        <img style={{ height: "175px" }} width="255px" src={teacherimg} alt="Фото факультета информационной безопасности" />
        </div>
        <h1>Преподаватели факультета информационной безопасности</h1>
      </section>

      <section className="teachers-section">
        <div className="tch-container">
          {teachersData.map((teacher) => (
            <div className="teacher-card" key={teacher.id} onClick={() => toggleDescription(teacher.id)}>
              <img src={karimzodaimg} alt={karimzodaimg} />
              <h3>{teacher.name}</h3>
              <p>{teacher.role}</p>
              {activeDescription === teacher.id && (
                <div className="description">
                  <p>{teacher.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Teachers;