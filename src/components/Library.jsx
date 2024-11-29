import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, set, push, update, remove } from "firebase/database";
import { auth } from "../firebase";
import { FaTimes, FaHeart, FaCommentDots } from "react-icons/fa";
import bookIcon from '../book-icon.png';
import "../App.css";
import "../library.css";
import basiclogo from "../basic-logo.png";
import { GoKebabHorizontal } from "react-icons/go";
import { FaPlusCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import defaultAvatar from '../default-image.png';
import anonymAvatar from '../anonym2.jpg';

const Library = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [commentModal, setCommentModal] = useState({ isOpen: false, bookId: null });
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  const database = getDatabase();
  const navigate = useNavigate();
  const [identificationStatus, setIdentificationStatus] = useState(null);

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Загрузка пользовательских данных и статуса идентификации
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const requestRef = dbRef(database, "requests");
      onValue(requestRef, (snapshot) => {
        const requests = snapshot.val();
        const userRequest = Object.values(requests || {}).find(
          (request) => request.email === user.email
        );

        if (userRequest) {
          setIdentificationStatus(
            userRequest.status === "accepted" ? "идентифицирован" : "не идентифицирован"
          );
        } else {
          setIdentificationStatus("не идентифицирован");
        }
      });

      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatarUrl) {
          setUserAvatarUrl(userData.avatarUrl);
        } else {
          setUserAvatarUrl(defaultAvatar);
        }
      });
    }
  }, [database]);

  // Загрузка книг
  useEffect(() => {
    const fetchBooks = () => {
      const teachersRef = dbRef(database, "teachers");
      const booksRef = dbRef(database, "books");
      const loadedBooks = [];
  
      // Загрузка книг от учителей
      onValue(teachersRef, (snapshot) => {
        const data = snapshot.val();
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
                  commentCount: 0, // Инициализируем значение
                });
              });
            }
          });
        }
      });
  
      // Загрузка книг из общего списка
      onValue(booksRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.keys(data).forEach((bookId) => {
            loadedBooks.push({
              id: bookId,
              ...data[bookId],
              publishedDate: new Date().toLocaleDateString(),
              commentCount: 0, // Инициализируем значение
            });
          });
        }
  
        // Подсчет количества комментариев
        loadedBooks.forEach((book) => {
          const commentsRef = dbRef(database, `comments/${book.id}`);
          onValue(commentsRef, (commentSnapshot) => {
            const commentsData = commentSnapshot.val();
            book.commentCount = commentsData ? Object.keys(commentsData).length : 0;
            setBooks([...loadedBooks]); // Обновляем состояние
          });
        });
  
        setFilteredBooks(loadedBooks);
      });
    };

    const user = auth.currentUser;
    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserDetails({
            username: data.username || "User",
            avatarUrl: data.avatarUrl || defaultAvatar,
          });
        }
      });
    }
  
    fetchBooks();
  }, [database]);
  

  const localStorageKey = `searchHistory_${userId}`;

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    setSearchHistory(savedHistory);
  }, [localStorageKey]);

  const saveHistoryToLocalStorage = (history) => {
    localStorage.setItem(localStorageKey, JSON.stringify(history));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = books.filter((book) =>
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
      saveHistoryToLocalStorage(newHistory);
    }
  };

  const removeFromHistory = (bookTitle) => {
    const newHistory = searchHistory.filter((title) => title !== bookTitle);
    setSearchHistory(newHistory);
    saveHistoryToLocalStorage(newHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    saveHistoryToLocalStorage([]);
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

  const openCommentModal = (bookId) => {
    setCommentModal({ isOpen: true, bookId });

    const database = getDatabase();
    const commentsRef = dbRef(database, `comments/${bookId}`);
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
        setComments(loadedComments);
      } else {
        setComments([]);
      }
    });
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, bookId: null });
    setComments([]);
    setActionMenuId(null);
    setEditingCommentId(null);
    setNewComment("");
  };

  const handleCommentSubmit = (isAnonymous = false) => {
    if (newComment.trim() === "") return;

    const database = getDatabase();
    const commentRef = dbRef(database, `comments/${commentModal.bookId}`);

    if (editingCommentId) {
      update(dbRef(database, `comments/${commentModal.bookId}/${editingCommentId}`), {
        comment: newComment,
        timestamp: new Date().toLocaleString(),
      });
      setEditingCommentId(null);
    } else {
      const newCommentRef = push(commentRef);
      update(newCommentRef, {
        avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
        username: isAnonymous ? "Анонимно" : userDetails.username,
        userId: isAnonymous ? null : auth.currentUser?.uid,
        anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null, // Сохраняем ID для анонимного комментария
        comment: newComment,
        timestamp: new Date().toLocaleString(),
      });
    }
    setNewComment("");
  };

  const handleEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setNewComment(commentText);
    setActionMenuId(null);
  };

  const handleDeleteComment = (commentId) => {
    const database = getDatabase();
    remove(dbRef(database, `comments/${commentModal.bookId}/${commentId}`));
    setActionMenuId(null);
  };

  const toggleActionMenu = (commentId) => {
    setActionMenuId((prev) => (prev === commentId ? null : commentId));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideMenu = actionMenuRef.current && actionMenuRef.current.contains(event.target);
      const isActionButton = event.target.closest(".action-menu button");
      
      // Закрываем меню только если клик произошел за пределами actionMenu и не на кнопках
      if (!isInsideMenu && !isActionButton) {
        setActionMenuId(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);  

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

      if (identificationStatus === "не идентифицирован") {
        return (
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
    <div className="library-body" onContextMenu={handleContextMenu}>
      <header className="library-head">
        <div className="header-nav-2">

        <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Библиотека</ul>

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
           <li><Link to="/library"><FontAwesomeIcon icon={faBook} style={{color: "red"}} /> Библиотека</Link></li>
           <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
           <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
        </ul>
        </div>

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
              setIsSearchFocused(false);
            }}
            placeholder="Поиск книг..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {searchQuery && (
            <FaTimes className="clear-search-icon" onClick={clearSearch} />
          )}

          {isSearchFocused && searchHistory.length > 0 && !searchQuery && (
            <div className="search-history">
              <h3>Недавнее</h3>
              <button className="clear-all-btn" onClick={clearHistory}>Очистить все</button>
              <ul>
                {searchHistory.map((title, index) => (
                  <li
                    key={index}
                    className="search-history-item"
                    onClick={() => handleHistoryClick(title)}
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

            return (
              <div key={index} className="book-card" onClick={() => openBookModal(book)}>
                <img src={bookIcon} alt="Book Icon" className="book-icon" onContextMenu={handleContextMenu}/>
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p style={{ color: "gray" }}>{book.description}</p>
                  <p className="published-date">Опубликовано: {book.publishedDate}</p>
                </div>
                <div className="book-actions">
            <div className="comment-icon-and-count">
              <FaCommentDots className="comment-icon"
              onClick={(event) => {
                event.stopPropagation(); // Предотвращает открытие модального окна книги
                openCommentModal(book.id); // Открывает модальное окно комментариев
              }}
               />
              <span className="comment-count">{book.commentCount}</span>
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

{commentModal.isOpen && (
        <div className="comment-modal-overlay">
          <div className="comment-modal">
            <div className="modal-header">
              <h3>Комментарии</h3>
              <button className="close-modal" onClick={closeCommentModal}>
                &times;
              </button>
            </div>
            <div className="comments-list">
              {comments
              .slice() // Создаёт копию массива, чтобы не мутировать оригинал
              .reverse() // Изменяет порядок на обратный
              .map((comment) => (
                <div className="comment" key={comment.id}>
                  <img
                    src={comment.avatarUrl || defaultAvatar}
                    alt={comment.username}
                    onClick={() => goToProfile(comment.userId)} // Переход по клику на аватар
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <p className="comment-username" onClick={() => goToProfile(comment.userId)}>{comment.username}</p>
                    <p className="comment-text">{comment.comment}</p>
                    <span className="comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <div ref={actionMenuRef} className="menu-icon-container">
  {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
    <>
      <GoKebabHorizontal
        style={{fontSize: "20px", color: "grey"}}
        onClick={() => toggleActionMenu(comment.id)}
        className="action-icon"
      />
      {actionMenuId === comment.id && (
        <div className={`action-menu show`}>
          <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
          <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
        </div>
      )}
    </>
  )}
</div>
                </div>
              ))}
            </div>
            <div className="new-comment">
              <input
                type="text"
                placeholder="Напишите комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={() => handleCommentSubmit(false)}>Отправить</button>
              <button onClick={() => handleCommentSubmit(true)}>Отправить анонимно</button>
            </div>
          </div>
        </div>
      )}
</div>

<footer className="footer-desktop">
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
        <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" style={{color: "red"}} /></Link>
        <Link to="/myprofile">
          <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
        </Link>
      </div>
    </div>
  );
};

export default Library;




              {/* {(comment.userId === auth.currentUser?.uid) && (
                    <div ref={actionMenuRef}>
                      <button onClick={() => handleEditComment(comment.id, comment.comment)}>
                        Изменить
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
                    </div>
                  )} */}