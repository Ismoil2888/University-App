import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa"; // Импорт иконки крестика
import "../App.css";
import "../library.css";
import "../contact.css";

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Обработать отправку формы
    setResponseMessage("Ваше сообщение успешно отправлено!");
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: ""
    });
  };

    const toggleMenu = () => {
    // Логика открытия/закрытия бургер-меню
    const menu = document.querySelector(".burger-menu");
    menu.classList.toggle("open");
  };

  return (
    <div className="contact-body">
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

      <div className="contact-container">
        <h1>Свяжитесь с нами</h1>

        <section className="social-media">
          <h2>Мы в социальных сетях</h2>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </section>

        <section className="contact-form">
          <h2>Отправьте ваши вопросы</h2>
          <form id="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Имя:</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Электронная почта:</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="phone">Номер телефона:</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label htmlFor="message">Сообщение:</label>
            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">Отправить</button>
          </form>
          <div id="response-message">{responseMessage}</div>
        </section>
      </div>

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Contacts;