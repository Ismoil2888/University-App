import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "../schedule.css";

const Schedule = () => {
  const scheduleData = [
    {
      group: "1-980101-0105А",
      days: [
        {
          day: "Понедельник",
          lessons: [
            { time: "08:00 - 08:50", subject: "", teacher: "", room: "" },
            { time: "09:00 - 09:50", subject: "КМРО/Схемотехникаи воистахои электрони", teacher: "Толибова С.Н.", room: "Ауд. 419" },
            { time: "10:00 - 10:50", subject: "ЛК/Схемотехникаи воистахои электрони", teacher: "Толибова С.Н.", room: "Ауд. 420" },
            { time: "11:00 - 11:50", subject: "ЛБ/Электротехника ва электроника", teacher: "Назримадов Д.А.", room: "Ауд. 223" },
            { time: "12:00 - 12:50", subject: "ЛК/Мудофиаи шахрванди/н.и.техники", teacher: "Зоиров Ф.Б.", room: "Ауд. 103" },
          ],
        },
        {
          day: "Вторник",
          lessons: [
            { time: "08:00 - 09:00", subject: "", teacher: "", room: "" },
            { time: "09:00 - 10:00", subject: "", teacher: "", room: "" },
            { time: "10:00 - 11:00", subject: "Сетевые технологии", teacher: "Кузнецов К.К.", room: "Ауд. 404" },
            { time: "11:00 - 12:00", subject: "Информационная безопасность", teacher: "Новиков Н.Н.", room: "Ауд. 505" },
            { time: "12:00 - 13:00", subject: "Физическая культура", teacher: "Михайлов М.М.", room: "Ауд.606" },
          ],
        },
        // Добавьте остальные дни по аналогии
      ],
    },
  ];

  const toggleMenu = () => {
    // Логика открытия/закрытия бургер-меню
    const menu = document.querySelector(".burger-menu");
    menu.classList.toggle("open");
  };

  return (
    <div className="glav-container">
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

        <div className="burger-menu-icon" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
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

      <section className="sch-hero">
        <h1>Расписание занятий факультета</h1>
      </section>

      <section className="schedule-section">
        <div className="sch-container">
          <h2>Расписание для каждой группы (1-Семестр / 2024)</h2>

          {scheduleData.map((groupSchedule, groupIndex) => (
            <div className="schedule-table" key={groupIndex}>
              <h3>{groupSchedule.group}</h3>
              <table>
                <thead>
                  <tr>
                    <th>День недели</th>
                    <th>Время</th>
                    <th>Предмет</th>
                    <th>Преподаватель</th>
                    <th>Аудитория</th>
                  </tr>
                </thead>
                <tbody>
                  {groupSchedule.days.map((daySchedule, dayIndex) => (
                    daySchedule.lessons.map((lesson, lessonIndex) => (
                      <tr key={lessonIndex}>
                        {lessonIndex === 0 && <td rowSpan={daySchedule.lessons.length}>{daySchedule.day}</td>}
                        <td>{lesson.time}</td>
                        <td>{lesson.subject}</td>
                        <td>{lesson.teacher}</td>
                        <td>{lesson.room}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
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

export default Schedule;