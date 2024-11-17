import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, set, push } from "firebase/database";
import { auth } from "../firebase";
import { FaTimes, FaUser, FaHeart, FaComment } from "react-icons/fa";
import bookIcon from '../book-icon.png';
import "../App.css";
import "../library.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

const Library = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);

  const database = getDatabase();
  const navigate = useNavigate();
  const [identificationStatus, setIdentificationStatus] = useState(null);


  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Проверяем статус идентификации пользователя
      const requestRef = dbRef(database, `requests`);
      onValue(requestRef, (snapshot) => {
        const requests = snapshot.val();
        const userRequest = Object.values(requests || {}).find(
          (request) => request.email === user.email
        );
        
        if (userRequest) {
          // Обновляем статус идентификации пользователя
          setIdentificationStatus(
            userRequest.status === "accepted" ? "идентифицирован" : "не идентифицирован"
          );
        } else {
          setIdentificationStatus("не идентифицирован");
        }
      });

                      // Получаем URL аватарки пользователя
                      const db = getDatabase();
                      const userRef = dbRef(db, `users/${user.uid}`);
                      onValue(userRef, (snapshot) => {
                        const userData = snapshot.val();
                        if (userData && userData.avatarUrl) {
                          setUserAvatarUrl(userData.avatarUrl);
                        } else {
                          setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
                        }
                      });
    }
  }, []);

  useEffect(() => {
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
                teacherId,
                publishedDate: new Date().toLocaleDateString(),
              });
            });
          }
        });
      }
      setBooks(loadedBooks);
      setFilteredBooks(loadedBooks);
    });
  }, [database, identificationStatus]);

  useEffect(() => {
    const likesRef = dbRef(database, `likes`);
    const commentsRef = dbRef(database, `userComments/${userId}`);
    const historyRef = dbRef(database, `userSearchHistory/${userId}`);

    onValue(likesRef, (snapshot) => {
      setLikes(snapshot.val() || {});
    });

    onValue(commentsRef, (snapshot) => {
      setComments(snapshot.val() || {});
    });

    onValue(historyRef, (snapshot) => {
      setSearchHistory(snapshot.val() || []);
    });
  }, [database, userId]);

  const toggleLike = (bookId, e) => {
    e.stopPropagation();

    const bookLikes = likes[bookId] || {};
    const hasLiked = bookLikes[userId] === true;

    // Обновляем данные в базе данных
    const bookLikeRef = dbRef(database, `likes/${bookId}/${userId}`);
    if (hasLiked) {
      set(bookLikeRef, null); // Удаляем лайк, если пользователь уже поставил
    } else {
      set(bookLikeRef, true); // Ставим лайк, если его не было
    }
  };

  const openCommentModal = (book, e) => {
    e.stopPropagation();
    setSelectedBook(book);
    setShowCommentModal(true);
    setCommentText("");
  };

  const submitComment = (bookId, commentText) => {
    const commentRef = push(dbRef(database, `userComments/${userId}/${bookId}`));
    set(commentRef, {
      text: commentText,
      timestamp: Date.now(),
    });
    setShowCommentModal(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredBooks(books);
  };

  const addToHistory = (bookTitle) => {
    if (!searchHistory.includes(bookTitle)) {
      const newHistory = [...searchHistory, bookTitle];
      setSearchHistory(newHistory);

      const historyRef = dbRef(database, `userSearchHistory/${userId}`);
      set(historyRef, newHistory);
    }
  };

  const removeFromHistory = (bookTitle) => {
    const newHistory = searchHistory.filter(title => title !== bookTitle);
    setSearchHistory(newHistory);

    const historyRef = dbRef(database, `userSearchHistory/${userId}`);
    set(historyRef, newHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    const historyRef = dbRef(database, `userSearchHistory/${userId}`);
    set(historyRef, []);
  };

  const openBookModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
    addToHistory(book.title);
  };

  const closeBookModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  const handleHistoryClick = (title) => {
    setSearchQuery(title);
    handleSearch(title);
    setIsSearchFocused(false);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    if (isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 0);
    } else {
      setIsMenuOpen(true);
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  }


  // Проверяем статус и отображаем сообщение при отсутствии идентификации
      if (identificationStatus === "не идентифицирован") {
        return (
          // <div className="not-identified">
          //   <p>Пройдите идентификацию, чтобы пользоваться библиотекой!</p>
          //   <p style={{color: "skyblue", marginTop: "15px"}} onClick={() => navigate(-1)}>Назад</p>
          // </div>
    
    
          <div className="not-identified-container">
            <div className="not-identified">
            <h2 className="not-identified-h2" data-text="T I K">T I K</h2>
            <p style={{color: "#008cb3", textAlign: "center", fontSize: "18px", marginTop: "15px"}}>Пройдите идентификацию, чтобы пользоваться библиотекой!</p>
            <p style={{color: "skyblue", marginTop: "15px"}} onClick={() => navigate(-1)}>Назад</p>
            </div>
          </div>
    );
  }

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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Библиотека</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
          </ul>
        </nav>

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Библиотека</ul>

        <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} onContextMenu={handleContextMenu}>          
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

<div className="library-main">
      <section className="library-header">
        <h1>Библиотека Факультета Информационной Безопасности</h1>
        <div className="search-filter">
          <input
            type="search"
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

      <section className="book-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => {
            const bookLikes = likes[book.id] || {};
            const isLikedByUser = bookLikes[userId] === true;
            const totalLikes = Object.keys(bookLikes).length;

            return (
              <div key={index} className="book-card" onClick={() => openBookModal(book)}>
                <img src={bookIcon} alt="Book Icon" className="book-icon" onContextMenu={handleContextMenu}/>
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p style={{ color: "gray" }}>{book.description}</p>
                  <p className="published-date">Опубликовано: {book.publishedDate}</p>
                </div>
                <div className="book-actions">
                  <div className="like-block">
                    <FaHeart
                      className={`heart-icon ${isLikedByUser ? 'liked' : ''}`}
                      onClick={(e) => toggleLike(book.id, e)}
                      style={{ color: isLikedByUser ? 'red' : 'gray' }}
                    />
                    <span style={{color: "green"}}>{totalLikes}</span>
                  </div>
                  <div className="comment-block">
                    <FaComment
                      className="comment-icon"
                      onClick={(e) => openCommentModal(book, e)}
                    />
                    <span style={{color: "green"}}>
                      {comments[book.id] ? Object.keys(comments[book.id]).length : 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>Книги не найдены</p>
        )}
      </section>

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

{showCommentModal && selectedBook && (
  <div className="modal-comment">
    <div className="modal-content-comment">
      <h3>Оставьте комментарий для {selectedBook.title}</h3>
      <div className="comment-section">
        {comments[selectedBook.id] &&
          Object.values(comments[selectedBook.id]).map((comment, index) => (
            <div key={index} className="comment">
              <p className="comment-text">{comment.text}</p>
              <span className="comment-timestamp">
                {new Date(comment.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
      </div>
      <textarea
        rows="4"
        placeholder="Ваш комментарий..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <button onClick={() => submitComment(selectedBook.id, commentText)}>
        Отправить
      </button>
      <button onClick={() => setShowCommentModal(false)}>Закрыть</button>
      
      {/* Отображение существующих комментариев */}
    </div>
  </div>
)}

</div>

      <footer className="footer-desktop">
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" onContextMenu={handleContextMenu}/></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" onContextMenu={handleContextMenu}/></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" style={{color: "red"}} onContextMenu={handleContextMenu}/></Link>
        <Link to="/myprofile">
          <img 
            src={userAvatarUrl} 
            alt="User Avatar" 
            className="footer-avatar" 
            onContextMenu={handleContextMenu}
          />
        </Link>   
      </div>
    </div>
  );
};

export default Library;






// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { getDatabase, ref as dbRef, onValue, set, push, update } from "firebase/database";
// import { FaTimes, FaUser, FaHeart, FaComment } from "react-icons/fa"; // Импорт иконки крестика
// import bookIcon from '../book-icon.png'; // Иконка книги
// import "../App.css"; // Подключаем CSS
// import "../library.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";

// const Library = ({ userId }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [books, setBooks] = useState([]);
//   const [filteredBooks, setFilteredBooks] = useState([]);
//   const [selectedBook, setSelectedBook] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [searchHistory, setSearchHistory] = useState([]);
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
//   const [likes, setLikes] = useState({});
//   const [comments, setComments] = useState({});
//   const [showCommentModal, setShowCommentModal] = useState(false);
//   const [commentText, setCommentText] = useState(""); // Добавлено состояние для текста комментария

//   const database = getDatabase();


//   useEffect(() => {
//     const teachersRef = dbRef(database, 'teachers');
//     onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       const loadedBooks = [];

//       if (data) {
//         Object.keys(data).forEach((teacherId) => {
//           const teacherBooks = data[teacherId].books;
//           if (teacherBooks) {
//             Object.keys(teacherBooks).forEach((bookId) => {
//               loadedBooks.push({
//                 id: bookId,
//                 ...teacherBooks[bookId],
//                 teacherId,
//                 publishedDate: new Date().toLocaleDateString(),
//               });
//             });
//           }
//         });
//       }
//       setBooks(loadedBooks);
//       setFilteredBooks(loadedBooks);
//     });
//   }, [database]);

//   useEffect(() => {
//     const likesRef = dbRef(database, `userLikes/${userId}`);
//     const commentsRef = dbRef(database, `userComments/${userId}`);

//     onValue(likesRef, (snapshot) => {
//       setLikes(snapshot.val() || {});
//     });

//     onValue(commentsRef, (snapshot) => {
//       setComments(snapshot.val() || {});
//     });
//   }, [database, userId]);



//   const toggleLike = (bookId, e) => {
//     e.stopPropagation(); // Останавливает всплытие события на карточке книги
//     const newLikes = { ...likes };
//     newLikes[bookId] = !newLikes[bookId];
//     setLikes(newLikes);

//     const userLikeRef = dbRef(database, `userLikes/${userId}/${bookId}`);
//     set(userLikeRef, newLikes[bookId] ? true : null);
//   };

//   const openCommentModal = (book, e) => {
//     e.stopPropagation(); // Останавливает всплытие события на карточке книги
//     setSelectedBook(book);
//     setShowCommentModal(true);
//     setCommentText("");
//   };

//   const submitComment = (bookId, commentText) => {
//     const commentRef = push(dbRef(database, `userComments/${userId}/${bookId}`));
//     set(commentRef, {
//       text: commentText,
//       timestamp: Date.now(),
//     });
//     setShowCommentModal(false);
//   };


//   const handleSearch = (query) => {
//     setSearchQuery(query);
//     // Фильтруем книги по названию
//     const filtered = books.filter(book => 
//       book.title.toLowerCase().includes(query.toLowerCase())
//     );
//     setFilteredBooks(filtered);
//   };

//   const clearSearch = () => {
//     setSearchQuery("");
//     setFilteredBooks(books); // Возвращаем полный список книг
//   };

//   const addToHistory = (bookTitle) => {
//     if (!searchHistory.includes(bookTitle)) {
//       setSearchHistory([...searchHistory, bookTitle]);
//     }
//   };

//   const removeFromHistory = (bookTitle) => {
//     setSearchHistory(searchHistory.filter(title => title !== bookTitle));
//   };

//   const clearHistory = () => {
//     setSearchHistory([]);
//   };

//   const openBookModal = (book) => {
//     setSelectedBook(book);
//     setShowModal(true);
//     addToHistory(book.title); // Добавляем книгу в историю при открытии
//   };

//   const closeBookModal = () => {
//     setShowModal(false);
//     setSelectedBook(null);
//   };

//   const handleHistoryClick = (title) => {
//     setSearchQuery(title); // Устанавливаем текст из истории в поле поиска
//     handleSearch(title); // Выполняем поиск по этому запросу
//     setIsSearchFocused(false); // Закрываем историю поиска
//   };

//   const [isMenuOpen, setIsMenuOpen] = useState(false);
  
//     const toggleMenu = () => {
//       if (isMenuOpen) {
//         setTimeout(() => {
//           setIsMenuOpen(false);
//         }, 0); // Задержка для плавного исчезновения
//       } else {
//         setIsMenuOpen(true);
//       }
//     };


//   return (
//     <div className="library-body">
//       <header className="library-head">
//         <nav>
//           <ul>
//             <li><Link to="/home">Главная</Link></li>
//             <li><Link to="/about">О факультете</Link></li>
//             <li><Link to="/teachers">Преподаватели</Link></li>
//             <li><Link to="/schedule">Расписание</Link></li>
//             <li><Link to="/library">Библиотека</Link></li>
//             <li><Link to="/contacts">Контакты</Link></li>
//           </ul>
//           <ul>
//             <li>
//               <Link to="/authdetails">
//               <FaUser className="user-icon"></FaUser>
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          <span className="bm-span"></span>
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//         </div>

//         <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>     
//         <ul>   
//           <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
//            <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
//            <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
//            <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
//            <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
//            <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
//            <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
//         </ul>
//         </div>
//       </header>

//       <section className="library-header">
//         <h1>Библиотека Факультета Информационной Безопасности</h1>
//         <div className="search-filter">
//           <input
//             type="text"
//             id="search-input"
//             value={searchQuery}
//             onChange={(e) => {
//               handleSearch(e.target.value);
//               setIsSearchFocused(false); // Скрываем историю поиска при вводе текста
//             }}
//             placeholder="Поиск книг..."
//             onFocus={() => setIsSearchFocused(true)} // Устанавливаем фокус
//             onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Скрываем историю после клика (timeout нужен для корректного удаления элемента)
//           />
//           {searchQuery && (
//             <FaTimes className="clear-search-icon" onClick={clearSearch} /> // Иконка крестика для очистки
//           )}

//           {/* История поиска появляется только при фокусе и пустом поисковом запросе */}
//           {isSearchFocused && searchHistory.length > 0 && !searchQuery && (
//             <div className="search-history">
//               <h3>Недавнее</h3>
//               <button className="clear-all-btn" onClick={clearHistory}>Очистить все</button>
//               <ul>
//                 {searchHistory.map((title, index) => (
//                   <li
//                     key={index}
//                     className="search-history-item"
//                     onClick={() => handleHistoryClick(title)} // При клике выполняем поиск
//                   >
//                     <span>{title}</span>
//                     <FaTimes className="remove-history-icon" onClick={() => removeFromHistory(title)} />
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       </section>

//       <section className="book-grid">
//         {filteredBooks.length > 0 ? (
//           filteredBooks.map((book, index) => (
//             <div key={index} className="book-card" onClick={() => openBookModal(book)}>
//               <img src={bookIcon} alt="Book Icon" className="book-icon" />
//               <div className="book-info">
//                 <h4>{book.title}</h4>
//                 <p style={{ color: "gray" }}>{book.description}</p>
//                 <p className="published-date">Опубликовано: {book.publishedDate}</p>
//               </div>
//               <div className="book-actions">
//                 <div className="like-block">
//                 <FaHeart
//                   className={`heart-icon ${likes[book.id] ? 'liked' : ''}`}
//                   onClick={(e) => toggleLike(book.id, e)}
//                 />
//                 <span style={{color: "green"}}>{Object.values(likes).filter(Boolean).length}</span>
//                 </div>
//                 <div className="comment-block">
//                 <FaComment
//                   className="comment-icon"
//                   onClick={(e) => openCommentModal(book, e)}
//                 />
//                 <span style={{color: "green"}}>{comments[book.id] ? Object.keys(comments[book.id]).length : 0}</span>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>Книги не найдены</p>
//         )}
//       </section>

//       {showModal && selectedBook && (
//         <div className="modal-book">
//           <div className="modal-content-book">
//             <h3>{selectedBook.title}</h3>
//             <p>{selectedBook.description}</p>
//             <div className="modal-book-buttons">
//               <a href={selectedBook.fileURL} target="_blank" rel="noopener noreferrer">
//                 <button>Открыть</button>
//               </a>
//               <a href={selectedBook.fileURL} download>
//                 <button>Скачать</button>
//               </a>
//               <button onClick={closeBookModal}>Закрыть</button>
//             </div>
//           </div>
//         </div>
//       )}

// {showCommentModal && selectedBook && (
//   <div className="modal-comment">
//     <div className="modal-content-comment">
//       <h3>Оставьте комментарий для {selectedBook.title}</h3>
//       <div className="comment-section">
//         {comments[selectedBook.id] &&
//           Object.values(comments[selectedBook.id]).map((comment, index) => (
//             <div key={index} className="comment">
//               <p className="comment-text">{comment.text}</p>
//               <span className="comment-timestamp">
//                 {new Date(comment.timestamp).toLocaleString()}
//               </span>
//             </div>
//           ))}
//       </div>
//       <textarea
//         rows="4"
//         placeholder="Ваш комментарий..."
//         value={commentText}
//         onChange={(e) => setCommentText(e.target.value)}
//       />
//       <button onClick={() => submitComment(selectedBook.id, commentText)}>
//         Отправить
//       </button>
//       <button onClick={() => setShowCommentModal(false)}>Закрыть</button>
      
//       {/* Отображение существующих комментариев */}
//     </div>
//   </div>
// )}

//       <footer>
//         <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
//       </footer>
//     </div>
//   );
// };

// export default Library;