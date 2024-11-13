import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import { getDatabase, ref as databaseRef, onValue, query, orderByChild, startAt, endAt, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import '../ChatPage.css';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";


const ChatPage = () => {
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
      const userQuery = query(
        dbRef,
        orderByChild("username"),
        startAt(queryText),
        endAt(queryText + "\uf8ff")
      );

      const snapshot = await get(userQuery);

      const results = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          results.push({ uid: childSnapshot.key, ...childSnapshot.val() });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
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
    <div className="chat-page">
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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>TIK</ul>
          <ul>
            <li>
              <Link to="/authdetails">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
          </ul>
        </nav>

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "35px"}}>T I K</ul>

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
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)} // Отслеживание ввода
              onFocus={() => setIsInputFocused(true)} // Устанавливаем фокус
              onBlur={() => setIsInputFocused(false)} // Снимаем фокус
              placeholder="Искать пользователей"
            />
            <FaTimes className="chat-page-close-search" onClick={() => setShowSearch(false)} />
          </div>

          {/* Если пользователь не вводит текст и не в фокусе - показываем историю */}
          {searchHistory.length > 0 && !isInputFocused && searchQuery === "" && (
            <div className="chat-page-search-history">
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
                  <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="chat-page-avatarka" />
                  <div 
                    className="chat-page-chat-info"
                    onClick={() => goToProfileFromHistory(user.uid)}
                  >
                    <h3 style={{color: "white"}}>{user.username}</h3>
                    <p>{user.aboutMe || "Информация не указана"}</p>
                  </div>
                  <FaTimes className="chat-page-remove-from-history" onClick={() => removeFromHistory(user.uid)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showSearch && (
        <div className="chat-page-chat-list">
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
            searchQuery.trim() !== "" && <p>No results found</p>
          )}
        </div>
      )}


    <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" onContextMenu={handleContextMenu}/></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" style={{color: "red"}} onContextMenu={handleContextMenu}/></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" onContextMenu={handleContextMenu}/></Link>
        <Link to="/authdetails"><FontAwesomeIcon icon={faUser} className="footer-icon" onContextMenu={handleContextMenu}/></Link>
      </div>
    </div>
  );
};

export default ChatPage;







// import React, { useState, useEffect, useRef } from "react";
// import { FaEllipsisV, FaSearch, FaTimes } from "react-icons/fa";
// import { getDatabase, ref as databaseRef, query, orderByChild, startAt, endAt, get } from "firebase/database";
// import { useNavigate } from "react-router-dom";
// import { getAuth, onAuthStateChanged } from "firebase/auth";

// const ChatPage = () => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchHistory, setSearchHistory] = useState([]);
//   const [isInputFocused, setIsInputFocused] = useState(false); // Новое состояние
//   const menuRef = useRef(null);
//   const navigate = useNavigate();
//   const [userUid, setUserUid] = useState(null);

//   useEffect(() => {
//     const auth = getAuth();

//     // Отслеживаем аутентификацию пользователя
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // Пользователь вошел в систему, используем его UID
//         setUserUid(user.uid);

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
//       const userQuery = query(
//         dbRef,
//         orderByChild("username"),
//         startAt(queryText),
//         endAt(queryText + "\uf8ff")
//       );

//       const snapshot = await get(userQuery);

//       const results = [];
//       if (snapshot.exists()) {
//         snapshot.forEach((childSnapshot) => {
//           results.push({ uid: childSnapshot.key, ...childSnapshot.val() });
//         });
//       }

//       setSearchResults(results);
//     } catch (error) {
//       console.error("Error fetching data from Firebase:", error);
//     }
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

//   return (
//     <div className="chat-page">
//       <div className="header">
//         <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
//           <FaEllipsisV />
//         </div>

//         {/* Секция для отображения историй */}
//         <div className="stories-section">
//           <div className="story-item">
//             <img
//               src="./default-image.png"
//               alt="Моя история"
//               className="story-avatar"
//             />
//             <p>Моя история</p>
//           </div>
//         </div>

//         <div className="search-icon" onClick={() => setShowSearch(!showSearch)}>
//           <FaSearch />
//         </div>
//       </div>

//       {showMenu && (
//         <div className="menu-dropdown" ref={menuRef}>
//           <ul>
//             <li onClick={goToProfileSettings}>Настройки профиля</li>
//             <li>Конфиденциальность</li>
//             <li>Помощь</li>
//             <li onClick={handleLogout}>Выход</li>
//           </ul>
//         </div>
//       )}

//       {showSearch && (
//         <>
//           <div className="search-bar">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)} // Отслеживание ввода
//               onFocus={() => setIsInputFocused(true)} // Устанавливаем фокус
//               onBlur={() => setIsInputFocused(false)} // Снимаем фокус
//               placeholder="Искать пользователей"
//             />
//             <FaTimes className="close-search" onClick={() => setShowSearch(false)} />
//           </div>

//           {/* Если пользователь не вводит текст и не в фокусе - показываем историю */}
//           {searchHistory.length > 0 && !isInputFocused && searchQuery === "" && (
//             <div className="search-history">
//               <div className="history-header">
//                 <h3>Недавнее</h3>
//                 <span onClick={clearSearchHistory} className="clear-history">
//                   Очистить все
//                 </span>
//               </div>
//               {searchHistory.map((user) => (
//                 <div
//                   key={user.uid}
//                   className="chat-item"
//                 >
//                   <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="avatarka" />
//                   <div 
//                     className="chat-info"
//                     onClick={() => goToProfileFromHistory(user.uid)}
//                   >
//                     <h3>{user.username}</h3>
//                     <p>{user.aboutMe || "No info available"}</p>
//                   </div>
//                   <FaTimes className="remove-from-history" onClick={() => removeFromHistory(user.uid)} />
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {showSearch && (
//         <div className="chat-list">
//           {searchResults.length > 0 ? (
//             searchResults.map((user) => (
//               <div key={user.uid} className="chat-item" onClick={() => goToProfile(user.uid)}>
//                 <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="avatarka" />
//                 <div className="chat-info">
//                   <h3>{user.username}</h3>
//                   <p>{user.aboutMe || "No info available"}</p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             searchQuery.trim() !== "" && <p>No results found</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatPage;