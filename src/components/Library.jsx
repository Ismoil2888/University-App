import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { FaTimes, FaUser } from "react-icons/fa"; // Импорт иконки крестика
import bookIcon from '../book-icon.png'; // Иконка книги
import "../App.css"; // Подключаем CSS
import "../library.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]); // Список книг
  const [filteredBooks, setFilteredBooks] = useState([]); // Фильтрованные книги
  const [selectedBook, setSelectedBook] = useState(null); // Выбранная книга для показа в модальном окне
  const [showModal, setShowModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]); // История поиска
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Фокус на поле поиска

  const database = getDatabase();

  useEffect(() => {
    // Загружаем книги всех преподавателей из Firebase
    const teachersRef = dbRef(database, 'teachers');
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedBooks = [];

      if (data) {
        Object.keys(data).forEach((teacherId) => {
          const teacherBooks = data[teacherId].books;
          if (teacherBooks) {
            Object.keys(teacherBooks).forEach((bookId) => {
              loadedBooks.push({
                id: bookId,
                ...teacherBooks[bookId],
                teacherId, // Для ссылки на преподавателя
                publishedDate: new Date().toLocaleDateString() // Добавляем дату публикации (можно сделать реальной, если есть)
              });
            });
          }
        });
      }

      setBooks(loadedBooks);
      setFilteredBooks(loadedBooks); // Изначально отображаем все книги
    });
  }, [database]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Фильтруем книги по названию
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredBooks(books); // Возвращаем полный список книг
  };

  const addToHistory = (bookTitle) => {
    if (!searchHistory.includes(bookTitle)) {
      setSearchHistory([...searchHistory, bookTitle]);
    }
  };

  const removeFromHistory = (bookTitle) => {
    setSearchHistory(searchHistory.filter(title => title !== bookTitle));
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const openBookModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
    addToHistory(book.title); // Добавляем книгу в историю при открытии
  };

  const closeBookModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  const handleHistoryClick = (title) => {
    setSearchQuery(title); // Устанавливаем текст из истории в поле поиска
    handleSearch(title); // Выполняем поиск по этому запросу
    setIsSearchFocused(false); // Закрываем историю поиска
  };

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





    const [isScrolling, setIsScrolling] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const maxStretch = 100; // Maximum stretch distance
    const mainRef = useRef(null);
  
    useEffect(() => {
      const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY);
        setIsScrolling(false);
      };
  
      const handleTouchMove = (e) => {
        if (!isScrolling) {
          setCurrentY(e.touches[0].clientY);
          const diff = currentY - startY;
  
          if ((diff > 0 && window.scrollY === 0) || (diff < 0 && window.scrollY + window.innerHeight >= document.body.clientHeight)) {
            e.preventDefault();
            const stretchAmount = Math.min(Math.abs(diff), maxStretch) * Math.sign(diff);
            mainRef.current.classList.add('elastic-effect');
            mainRef.current.style.transform = `translateY(${stretchAmount}px)`;
          } else {
            setIsScrolling(true);
          }
        }
      };
  
      const handleTouchEnd = () => {
        mainRef.current.classList.remove('elastic-effect');
        mainRef.current.style.transform = 'translateY(0)';
      };
  
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend',   
   handleTouchEnd);
  
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove',   
   handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);   
  
      };
    }, []);

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
          <ul>
            <li>
              <Link to="/authdetails">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
          </ul>
        </nav>

        <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          <span className="bm-span"></span>
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

      <section className="library-header">
        <h1>Библиотека Факультета Информационной Безопасности</h1>
        <div className="search-filter">
          <input
            type="text"
            id="search-input"
            value={searchQuery}
            onChange={(e) => {
              handleSearch(e.target.value);
              setIsSearchFocused(false); // Скрываем историю поиска при вводе текста
            }}
            placeholder="Поиск книг..."
            onFocus={() => setIsSearchFocused(true)} // Устанавливаем фокус
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Скрываем историю после клика (timeout нужен для корректного удаления элемента)
          />
          {searchQuery && (
            <FaTimes className="clear-search-icon" onClick={clearSearch} /> // Иконка крестика для очистки
          )}

          {/* История поиска появляется только при фокусе и пустом поисковом запросе */}
          {isSearchFocused && searchHistory.length > 0 && !searchQuery && (
            <div className="search-history">
              <h3>Недавнее</h3>
              <button className="clear-all-btn" onClick={clearHistory}>Очистить все</button>
              <ul>
                {searchHistory.map((title, index) => (
                  <li
                    key={index}
                    className="search-history-item"
                    onClick={() => handleHistoryClick(title)} // При клике выполняем поиск
                  >
                    <span>{title}</span>
                    <FaTimes className="remove-history-icon" onClick={() => removeFromHistory(title)} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

    <main ref={mainRef}>
      <section className="book-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => (
            <div key={index} className="book-card" onClick={() => openBookModal(book)}>
              <img src={bookIcon} alt="Book Icon" className="book-icon" />
              <div className="book-info">
                <h4>{book.title}</h4>
                <p style={{color: "gray"}}>{book.description}</p>
                <p className="published-date">Опубликовано: {book.publishedDate}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Книги не найдены</p>
        )}
      </section>
      </main>

      {showModal && selectedBook && (
        <div className="modal-book">
          <div className="modal-content-book">
            <h3>{selectedBook.title}</h3>
            <p>{selectedBook.description}</p>
            <div className="modal-book-buttons">
              <a href={selectedBook.fileURL} target="_blank" rel="noopener noreferrer">
                <button>Открыть</button>
              </a>
              <a href={selectedBook.fileURL} download>
                <button>Скачать</button>
              </a>
              <button onClick={closeBookModal}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Library;