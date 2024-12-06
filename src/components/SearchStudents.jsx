import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import { getDatabase, ref as databaseRef, onValue, query, orderByChild, startAt, endAt, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import '../SearchPage.css';
import basiclogo from "../basic-logo.png";
import { Link } from "react-router-dom";
import { FaPlusCircle, FaArrowLeft } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

const SearchStudents = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false); // Новое состояние
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [userUid, setUserUid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const searchHistoryRef = useRef(null);
  const chatListRef = useRef(null);

  // Обработчик скролла
  const handleTouchStart = (e, element) => {
    element.scrollStart = element.scrollTop; // Запоминаем начальное положение скролла
  };

  const handleTouchMove = (e, element) => {
    const isAtTop =
      element.scrollTop === 0 && e.touches[0].clientY > element.scrollStart;
    const isAtBottom =
      element.scrollTop + element.offsetHeight >= element.scrollHeight &&
      e.touches[0].clientY < element.scrollStart;

    if (isAtTop || isAtBottom) {
      e.preventDefault(); // Блокируем скролл родительского элемента
    }
  };

  // Добавление и удаление событий
  useEffect(() => {
    const searchHistoryEl = searchHistoryRef.current;
    const chatListEl = chatListRef.current;

    if (searchHistoryEl) {
      searchHistoryEl.addEventListener("touchstart", (e) =>
        handleTouchStart(e, searchHistoryEl),
        { passive: false }
      );
      searchHistoryEl.addEventListener("touchmove", (e) =>
        handleTouchMove(e, searchHistoryEl),
        { passive: false }
      );
    }

    if (chatListEl) {
      chatListEl.addEventListener("touchstart", (e) =>
        handleTouchStart(e, chatListEl),
        { passive: false }
      );
      chatListEl.addEventListener("touchmove", (e) =>
        handleTouchMove(e, chatListEl),
        { passive: false }
      );
    }

    // Убираем обработчики при размонтировании
    return () => {
      if (searchHistoryEl) {
        searchHistoryEl.removeEventListener("touchstart", (e) =>
          handleTouchStart(e, searchHistoryEl)
        );
        searchHistoryEl.removeEventListener("touchmove", (e) =>
          handleTouchMove(e, searchHistoryEl)
        );
      }

      if (chatListEl) {
        chatListEl.removeEventListener("touchstart", (e) =>
          handleTouchStart(e, chatListEl)
        );
        chatListEl.removeEventListener("touchmove", (e) =>
          handleTouchMove(e, chatListEl)
        );
      }
    };
  }, []);




  useEffect(() => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `messages`);

    // Получение всех сообщений из Firebase
    onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesArray = Object.entries(messagesData).map(([userId, userMessages]) => ({
          userId,
          lastMessage: Object.values(userMessages).pop(), // Последнее сообщение от пользователя
        }));
        setMessages(messagesArray);
      }
    });
  }, []);

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  useEffect(() => {
    const auth = getAuth();

    // Отслеживаем аутентификацию пользователя
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Пользователь вошел в систему, используем его UID
        setUserUid(user.uid);

                // Получаем URL аватарки пользователя
                const db = getDatabase();
                const userRef = databaseRef(db, `users/${user.uid}`);
                onValue(userRef, (snapshot) => {
                  const userData = snapshot.val();
                  if (userData && userData.avatarUrl) {
                    setUserAvatarUrl(userData.avatarUrl);
                  } else {
                    setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
                  }
                });

        // Загружаем историю поиска для конкретного пользователя
        const savedHistory = JSON.parse(localStorage.getItem(`searchHistory_${user.uid}`)) || [];
        setSearchHistory(savedHistory);
      } else {
        navigate("/"); // Перенаправляем на страницу входа, если пользователь не аутентифицирован
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSearch = async (queryText) => {
    setSearchQuery(queryText);
  
    if (queryText.trim() === "") {
      setSearchResults([]);
      return;
    }
  
    try {
      const dbRef = databaseRef(getDatabase(), "users");
  
      // Загружаем все данные пользователей
      const snapshot = await get(dbRef);
      const results = [];
  
      if (snapshot.exists()) {
        const lowerCaseQuery = queryText.toLowerCase();
  
        // Фильтруем пользователей по нечувствительному к регистру имени
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const username = userData.username || "";
  
          if (username.toLowerCase().includes(lowerCaseQuery)) {
            results.push({ uid: childSnapshot.key, ...userData });
          }
        });
      }
  
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  };  

  const saveUserToDatabase = (userId, userData) => {
    const db = getDatabase();
    const userRef = databaseRef(db, `users/${userId}`);
  
    const newUser = {
      ...userData,
      username_lowercase: userData.username.toLowerCase(), // Добавляем имя в нижнем регистре
    };
  
    set(userRef, newUser)
      .then(() => console.log("User saved"))
      .catch((error) => console.error("Error saving user:", error));
  };  
  

  const goToProfile = (userId) => {
    if (userUid) {
      const visitedUser = searchResults.find((user) => user.uid === userId);
      if (visitedUser) {
        const updatedHistory = [visitedUser, ...searchHistory.filter(item => item.uid !== visitedUser.uid)];
        setSearchHistory(updatedHistory);
        localStorage.setItem(`searchHistory_${userUid}`, JSON.stringify(updatedHistory));
      }
      navigate(`/profile/${userId}`);
    }
  };

  const goToProfileSettings = () => {
    navigate("/authdetails");
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(`searchHistory_${userUid}`);
  };

  const removeFromHistory = (userId) => {
    const updatedHistory = searchHistory.filter(user => user.uid !== userId);
    setSearchHistory(updatedHistory);
    localStorage.setItem(`searchHistory_${userUid}`, JSON.stringify(updatedHistory));
  };

  const goToProfileFromHistory = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      // Очищаем локальные данные
      setSearchHistory([]);
      localStorage.removeItem(`searchHistory_${auth.currentUser.uid}`);
      navigate("/");
    });
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

  return (
    <div className="chat-page" onContextMenu={handleContextMenu}>
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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Поиск студентов</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-nav-2">

        <Link className="back-button" style={{marginLeft: "15px"}} onClick={() => navigate(-1)}>
              <FaArrowLeft />
          </Link>

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Поиск студентов</ul>

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

        </div>
      </header>

      <div className="chat-page-header">
        {/* <div className="chat-page-menu-icon" onClick={() => setShowMenu(!showMenu)}>
          <FaEllipsisV />
        </div> */}

        {/* Секция для отображения историй */}
        <div className="chat-page-stories-section">
          <div className="chat-page-story-item">
            <img
              src="./default-image.png"
              alt="Моя история"
              className="chat-page-story-avatar"
            />
            <p>Моя история</p>
          </div>
        </div>

        <div className="chat-page-search-icon" onClick={() => setShowSearch(!showSearch)}>
          <FaSearch />
        </div>
      </div>

      {showSearch && (
        <>
          <div className="chat-page-search-bar">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Искать пользователей"
          />
            <FaTimes className="chat-page-close-search" onClick={() => setShowSearch(false)} />
          </div>

          {/* Если пользователь не вводит текст и не в фокусе - показываем историю */}
          {searchHistory.length > 0 && !isInputFocused && searchQuery === "" && (
            <div className="chat-page-search-history" ref={searchHistoryRef} style={{ overflowY: "auto", maxHeight: "1000px" }}>
              <div className="chat-page-history-header">
                <h3 style={{color: "grey"}}>Недавнее</h3>
                <span onClick={clearSearchHistory} className="chat-page-clear-history">
                  Очистить все
                </span>
              </div>
              {searchHistory.map((user) => (
                <div
                  key={user.uid}
                  className="chat-page-chat-item"
                >
                  <div style={{display: "flex", alignItems: "center"}}>
                  <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="chat-page-avatarka" />
                  <div 
                    className="chat-page-chat-info"
                    onClick={() => goToProfileFromHistory(user.uid)}
                  >
                    <h3 style={{color: "white"}}>{user.username}</h3>
                    <p>{user.aboutMe || "Информация не указана"}</p>
                  </div>
                  </div>
                  <div style={{marginLeft: "15px"}}>
                  <FaTimes className="chat-page-remove-from-history" onClick={() => removeFromHistory(user.uid)} />
                    </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showSearch && (
        <div className="chat-page-chat-list" ref={chatListRef} style={{ overflowY: "auto", maxHeight: "1000px" }}>
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.uid} className="chat-page-chat-item" onClick={() => goToProfile(user.uid)}>
                <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="chat-page-avatarka" />
                <div className="chat-page-chat-info">
                  <h3 style={{color: "white"}}>{user.username}</h3>
                  <p>{user.aboutMe || "Информация не указана"}</p>
                </div>
              </div>
            ))
          ) : (
            searchQuery.trim() !== "" && <p style={{color: "whitesmoke"}}>Ничего не найдено</p>
          )}
        </div>
      )}

<div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon  active-icon" style={{}} /></Link>
        <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
        <Link to="/myprofile">
          <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
        </Link>
      </div>
    </div>
  );
};

export default SearchStudents;














// import React, { useState, useEffect, useRef } from "react";
// import { FaEllipsisV, FaSearch, FaTimes, FaUser } from "react-icons/fa";
// import { getDatabase, ref as databaseRef, onValue, query, orderByChild, startAt, endAt, get, set } from "firebase/database";
// import { useNavigate } from "react-router-dom";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import '../SearchPage.css';
// import basiclogo from "../basic-logo.png";
// import { Link } from "react-router-dom";
// import { FaPlusCircle, FaArrowLeft } from "react-icons/fa";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

// const SearchStudents = () => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchHistory, setSearchHistory] = useState([]);
//   const [isInputFocused, setIsInputFocused] = useState(false); // Новое состояние
//   const menuRef = useRef(null);
//   const navigate = useNavigate();
//   const [userUid, setUserUid] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);

//   useEffect(() => {
//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `messages`);

//     // Получение всех сообщений из Firebase
//     onValue(messagesRef, (snapshot) => {
//       const messagesData = snapshot.val();
//       if (messagesData) {
//         const messagesArray = Object.entries(messagesData).map(([userId, userMessages]) => ({
//           userId,
//           lastMessage: Object.values(userMessages).pop(), // Последнее сообщение от пользователя
//         }));
//         setMessages(messagesArray);
//       }
//     });
//   }, []);

//   const handleChatClick = (userId) => {
//     navigate(`/chat/${userId}`);
//   };

//   useEffect(() => {
//     const auth = getAuth();

//     // Отслеживаем аутентификацию пользователя
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // Пользователь вошел в систему, используем его UID
//         setUserUid(user.uid);

//                 // Получаем URL аватарки пользователя
//                 const db = getDatabase();
//                 const userRef = databaseRef(db, `users/${user.uid}`);
//                 onValue(userRef, (snapshot) => {
//                   const userData = snapshot.val();
//                   if (userData && userData.avatarUrl) {
//                     setUserAvatarUrl(userData.avatarUrl);
//                   } else {
//                     setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
//                   }
//                 });

//         // Загружаем историю поиска для конкретного пользователя
//         const savedHistory = JSON.parse(localStorage.getItem(`searchHistory_${user.uid}`)) || [];
//         setSearchHistory(savedHistory);
//       } else {
//         navigate("/"); // Перенаправляем на страницу входа, если пользователь не аутентифицирован
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   const handleSearch = async (queryText) => {
//     setSearchQuery(queryText);
  
//     if (queryText.trim() === "") {
//       setSearchResults([]);
//       return;
//     }
  
//     try {
//       const dbRef = databaseRef(getDatabase(), "users");
  
//       // Загружаем все данные пользователей
//       const snapshot = await get(dbRef);
//       const results = [];
  
//       if (snapshot.exists()) {
//         const lowerCaseQuery = queryText.toLowerCase();
  
//         // Фильтруем пользователей по нечувствительному к регистру имени
//         snapshot.forEach((childSnapshot) => {
//           const userData = childSnapshot.val();
//           const username = userData.username || "";
  
//           if (username.toLowerCase().includes(lowerCaseQuery)) {
//             results.push({ uid: childSnapshot.key, ...userData });
//           }
//         });
//       }
  
//       setSearchResults(results);
//     } catch (error) {
//       console.error("Error fetching data from Firebase:", error);
//     }
//   };  

//   const saveUserToDatabase = (userId, userData) => {
//     const db = getDatabase();
//     const userRef = databaseRef(db, `users/${userId}`);
  
//     const newUser = {
//       ...userData,
//       username_lowercase: userData.username.toLowerCase(), // Добавляем имя в нижнем регистре
//     };
  
//     set(userRef, newUser)
//       .then(() => console.log("User saved"))
//       .catch((error) => console.error("Error saving user:", error));
//   };  
  

//   const goToProfile = (userId) => {
//     if (userUid) {
//       const visitedUser = searchResults.find((user) => user.uid === userId);
//       if (visitedUser) {
//         const updatedHistory = [visitedUser, ...searchHistory.filter(item => item.uid !== visitedUser.uid)];
//         setSearchHistory(updatedHistory);
//         localStorage.setItem(`searchHistory_${userUid}`, JSON.stringify(updatedHistory));
//       }
//       navigate(`/profile/${userId}`);
//     }
//   };

//   const goToProfileSettings = () => {
//     navigate("/authdetails");
//   };

//   const clearSearchHistory = () => {
//     setSearchHistory([]);
//     localStorage.removeItem(`searchHistory_${userUid}`);
//   };

//   const removeFromHistory = (userId) => {
//     const updatedHistory = searchHistory.filter(user => user.uid !== userId);
//     setSearchHistory(updatedHistory);
//     localStorage.setItem(`searchHistory_${userUid}`, JSON.stringify(updatedHistory));
//   };

//   const goToProfileFromHistory = (userId) => {
//     navigate(`/profile/${userId}`);
//   };

//   const handleLogout = () => {
//     const auth = getAuth();
//     auth.signOut().then(() => {
//       // Очищаем локальные данные
//       setSearchHistory([]);
//       localStorage.removeItem(`searchHistory_${auth.currentUser.uid}`);
//       navigate("/");
//     });
//   };

//   const [isMenuOpen, setIsMenuOpen] = useState(false);
  
//   const toggleMenu = () => {
//     if (isMenuOpen) {
//       setTimeout(() => {
//         setIsMenuOpen(false);
//       }, 0);
//     } else {
//       setIsMenuOpen(true);
//     }
//   };

//   const handleContextMenu = (event) => {
//     event.preventDefault();
//   }

//   return (
//     <div className="chat-page" onContextMenu={handleContextMenu}>
//             <header>
//             <nav>
//           <ul>
//             <li><Link to="/home">Главная</Link></li>
//             <li><Link to="/about">О факультете</Link></li>
//             <li><Link to="/teachers">Преподаватели</Link></li>
//             <li><Link to="/schedule">Расписание</Link></li>
//             <li><Link to="/library">Библиотека</Link></li>
//             <li><Link to="/contacts">Контакты</Link></li>
//           </ul>
//           <ul style={{color: "#58a6ff", fontSize: "25px"}}>Поиск студентов</ul>
//           <ul>
//             <li>
//               <Link to="/myprofile">
//               <FaUser className="user-icon"></FaUser>
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         <div className="header-nav-2">

//         <Link className="back-button" style={{marginLeft: "15px"}} onClick={() => navigate(-1)}>
//               <FaArrowLeft />
//           </Link>

//         <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Поиск студентов</ul>

//         <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//         </div>

//         <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
//         <ul>
//            <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
//            <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
//            <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
//            <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
//            <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
//            <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
//            <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
//         </ul>
//         </div>

//         </div>
//       </header>

//       <div className="chat-page-header">
//         {/* <div className="chat-page-menu-icon" onClick={() => setShowMenu(!showMenu)}>
//           <FaEllipsisV />
//         </div> */}

//         {/* Секция для отображения историй */}
//         <div className="chat-page-stories-section">
//           <div className="chat-page-story-item">
//             <img
//               src="./default-image.png"
//               alt="Моя история"
//               className="chat-page-story-avatar"
//             />
//             <p>Моя история 2</p>
//           </div>
//         </div>

//         <div className="chat-page-search-icon" onClick={() => setShowSearch(!showSearch)}>
//           <FaSearch />
//         </div>
//       </div>

//       {showSearch && (
//         <>
//           <div className="chat-page-search-bar">
//           <input
//             type="search"
//             value={searchQuery}
//             onChange={(e) => handleSearch(e.target.value)}
//             onFocus={() => setIsInputFocused(true)}
//             onBlur={() => setIsInputFocused(false)}
//             placeholder="Искать пользователей"
//           />
//             <FaTimes className="chat-page-close-search" onClick={() => setShowSearch(false)} />
//           </div>

//           {/* Если пользователь не вводит текст и не в фокусе - показываем историю */}
//           {searchHistory.length > 0 && !isInputFocused && searchQuery === "" && (
//             <div className="chat-page-search-history">
//               <div className="chat-page-history-header">
//                 <h3 style={{color: "grey"}}>Недавнее</h3>
//                 <span onClick={clearSearchHistory} className="chat-page-clear-history">
//                   Очистить все
//                 </span>
//               </div>
//               {searchHistory.map((user) => (
//                 <div
//                   key={user.uid}
//                   className="chat-page-chat-item"
//                 >
//                   <div style={{display: "flex", alignItems: "center"}}>
//                   <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="chat-page-avatarka" />
//                   <div 
//                     className="chat-page-chat-info"
//                     onClick={() => goToProfileFromHistory(user.uid)}
//                   >
//                     <h3 style={{color: "white"}}>{user.username}</h3>
//                     <p>{user.aboutMe || "Информация не указана"}</p>
//                   </div>
//                   </div>
//                   <div style={{marginLeft: "15px"}}>
//                   <FaTimes className="chat-page-remove-from-history" onClick={() => removeFromHistory(user.uid)} />
//                     </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {showSearch && (
//         <div className="chat-page-chat-list">
//           {searchResults.length > 0 ? (
//             searchResults.map((user) => (
//               <div key={user.uid} className="chat-page-chat-item" onClick={() => goToProfile(user.uid)}>
//                 <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="chat-page-avatarka" />
//                 <div className="chat-page-chat-info">
//                   <h3 style={{color: "white"}}>{user.username}</h3>
//                   <p>{user.aboutMe || "Информация не указана"}</p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             searchQuery.trim() !== "" && <p style={{color: "whitesmoke"}}>Ничего не найдено</p>
//           )}
//         </div>
//       )}

// <div className="footer-nav">
//         <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
//         <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon  active-icon" style={{}} /></Link>
//         <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
//         <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
//         <Link to="/myprofile">
//           <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default SearchStudents;