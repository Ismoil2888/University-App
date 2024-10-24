import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa"; // Импорт иконки крестика
import { getDatabase, ref as dbRef, onValue } from "firebase/database"; // Firebase
import "../App.css";
import "../teachers.css";
import defaultTeacherImg from "../teacher.png"; // Изображение по умолчанию

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]); // Фильтрованные преподаватели
  const [searchQuery, setSearchQuery] = useState(""); // Поле для хранения запроса поиска
  const [activeDescription, setActiveDescription] = useState(null);

  // Получаем данные преподавателей из Firebase при монтировании компонента
  useEffect(() => {
    const database = getDatabase();
    const teachersRef = dbRef(database, 'teachers');
    
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTeachers = Object.keys(data).map(id => ({ id, ...data[id] }));
        setTeachers(loadedTeachers);
        setFilteredTeachers(loadedTeachers); // Изначально отображаем всех преподавателей
      } else {
        setTeachers([]);
        setFilteredTeachers([]);
      }
    });
  }, []);

  // Обработка изменений в поле поиска
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Фильтрация преподавателей по имени или фамилии
    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(query) || teacher.surname.toLowerCase().includes(query)
    );
    setFilteredTeachers(filtered);
  };

  const toggleDescription = (id) => {
    setActiveDescription(activeDescription === id ? null : id);
  };

  const toggleMenu = () => {
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
          <ul>
            <li>
              <Link to="/authdetails">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
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
          <img style={{ height: "175px" }} width="255px" src={defaultTeacherImg} alt="Фото преподавателей" />
        </div>
        <h1>Преподаватели факультета информационной безопасности</h1>
      </section>

      <section className="teachers-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Поиск преподавателя..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="tch-container">
          {filteredTeachers.length === 0 ? (
            <p>Преподаватели не найдены.</p>
          ) : (
            filteredTeachers.map((teacher) => (
              <div className="teacher-card" key={teacher.id} onClick={() => toggleDescription(teacher.id)}>
                <img src={teacher.photo || defaultTeacherImg} alt={`${teacher.name} ${teacher.surname}`} />
                <h3>{`${teacher.name} ${teacher.surname}`}</h3>
                <p><strong>Предмет:</strong> {teacher.subject}</p>
                <p><strong>Статус:</strong> {teacher.status}</p>
                {activeDescription === teacher.id && (
                  <div className="description">
                    <p>Подробная информация о преподавателе будет доступна позже.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Teachers;