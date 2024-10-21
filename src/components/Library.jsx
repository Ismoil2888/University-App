import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css"; // Подключаем CSS
import "../library.css";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]); // Здесь будут храниться книги
  const [reviews, setReviews] = useState([]); // Здесь будут храниться отзывы

  const handleSearch = () => {
    // Реализуйте поиск по книгам здесь
    console.log("Поиск книг по запросу:", searchQuery);
  };

  const toggleMenu = () => {
    // Функция для открытия/закрытия бургер-меню
    const menu = document.querySelector(".burger-menu");
    menu.classList.toggle("open");
  };

  return (
    <div className="library-body">
      <header className="library-head">
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

      <section className="library-header">
        <h1>Библиотека Факультета Информационной Безопасности</h1>
        <div className="search-filter">
          <input
            type="text"
            id="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск книг..."
          />
          <button className="search-btn" onClick={handleSearch}>Поиск</button>
        </div>
      </section>

      <section className="book-grid" id="book-grid">
        {books.length > 0 ? (
          books.map((book, index) => (
            <div key={index} className="book-card">
              {/* Тут выводите карточки книг */}
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              {/* Добавьте здесь элементы отображения книги */}
            </div>
          ))
        ) : (
          <p>Книги не найдены</p>
        )}
      </section>

      <section className="reviews-section">
        <h2>Отзывы о книгах</h2>
        <div id="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review-card">
                {/* Тут выводите отзывы о книгах */}
                <h3>{review.bookTitle}</h3>
                <p>{review.text}</p>
              </div>
            ))
          ) : (
            <p>Нет отзывов</p>
          )}
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Library;