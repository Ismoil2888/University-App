import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, remove } from "firebase/database";
import { auth } from "../firebase";
import defaultAvatar from "../default-image.png";
import basiclogo from "../basic-logo.png";
import "../App.css";
import "../PostForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlusCircle, FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  const [notification, setNotification] = useState(""); // For notifications
  const [notificationType, setNotificationType] = useState(""); // For notification type
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [posts, setPosts] = useState([]);
  const [menuPostId, setMenuPostId] = useState(null); // To track the post that the menu is opened for
  const [expandedPosts, setExpandedPosts] = useState({}); // Для отслеживания состояния каждого поста
    const [isMenuOpenn, setIsMenuOpenn] = useState(false);
    const navigate = useNavigate();

    const goToProfile = (userId) => {
      navigate(`/profile/${userId}`);
    };
    const MAX_TEXT_LENGTH = 100; // Максимальное количество символов до сокращения текста
  
    const toggleMenuu = () => {
      if (isMenuOpen) {
        setTimeout(() => {
          setIsMenuOpen(false);
        }, 0); // Задержка для плавного исчезновения
      } else {
        setIsMenuOpen(true);
      }
    };

  const toggleMenu = (postId) => {
    setMenuPostId(postId === menuPostId ? null : postId); // Toggle visibility for the post
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Fetch user avatar
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatarUrl) {
          setUserAvatarUrl(userData.avatarUrl);
        } else {
          setUserAvatarUrl("./default-image.png"); // Default image
        }
      });
    }
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const postsRef = dbRef(db, "posts");

    onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const postsArray = Object.keys(postsData).map((key) => ({
          id: key,
          ...postsData[key],
        }));
        setPosts(postsArray);
      }
    });
  }, []);

  const handleDeletePost = (postId) => {
    const db = getDatabase();
    const postRef = dbRef(db, `posts/${postId}`);
    remove(postRef)
      .then(() => {
        setNotificationType("success");
        setNotification("Пост удален!");
        setTimeout(() => {
          setNotification("");
          setNotificationType("");
        }, 3000);
      })
      .catch((error) => {
        console.error("Ошибка удаления поста: ", error);
        setNotificationType("error");
        setNotification("Ошибка удаления поста.");
        setTimeout(() => {
          setNotification("");
          setNotificationType("");
        }, 3000);
      });
  };

  const toggleTextExpansion = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Переключение между свернутым и развернутым состоянием
    }));
  };

  return (
    <div className="home-container">
      {notification && (
        <div className={`notification ${notificationType}`}>
          {notification}
        </div>
      )}

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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              {/* <FaUser className="user-icon"></FaUser> */}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-nav-2">

        <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>

        <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenuu}>          
          <span className="bm-span"></span>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
        </div>

        <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
        <ul>
           <li><Link to="/home"><FontAwesomeIcon icon={faHome} style={{color: "red"}} /> Главная</Link></li>
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

      <main style={{ paddingTop: "100px", paddingBottom: "100px" }}>
        <section id="posts">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              {/* Заголовок: Аватар и имя пользователя */}
              <div className="post-header">
                <div className="post-author">
                  <img
                    src={post.userAvatar || defaultAvatar}
                    alt="User Avatar"
                    className="post-avatar"
                    onClick={() => goToProfile(post.userId)}
                  />
                  <span 
                  className="post-username"
                  onClick={() => goToProfile(post.userId)}
                  >{post.userName}</span>
                </div>
                {post.userId === auth.currentUser?.uid && (
                  <div className="three-dot-menu">
                    <span onClick={() => toggleMenu(post.id)}>...</span>
                    {menuPostId === post.id && (
                      <div className="menu-options">
                        <span>Изменить</span>
                        <span onClick={() => handleDeletePost(post.id)}>Удалить</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Медиа (изображение или видео) */}
              {post.mediaUrl && (
                post.mediaUrl.endsWith(".mp4") ? (
                  <video controls src={post.mediaUrl} className="post-media" />
                ) : (
                  <img src={post.mediaUrl} alt="Post Media" className="post-media" />
                )
              )}

                           {/* Actions: Like, Comment, Save */}
              <div className="post-actions">
                <FaRegHeart className="post-icon" />
                <FaRegComment className="post-icon" />
                <FaRegBookmark className="post-icon" />
              </div>

              {/* Likes Count */}
              <p className="post-likes">Нравится: {post.likes || 0}</p>


              {/* Описание с разворачиванием/сворачиванием текста */}
              <p className="post-content">
                <span className="post-username">{post.userName}</span>{" "}
                {post.description.length > MAX_TEXT_LENGTH && !expandedPosts[post.id] ? (
                  <>
                    {post.description.slice(0, MAX_TEXT_LENGTH)}...
                    <span
                      className="toggle-text"
                      onClick={() => toggleTextExpansion(post.id)}
                    >
                      ещё
                    </span>
                  </>
                ) : (
                  <>
                    {post.description}
                    {post.description.length > MAX_TEXT_LENGTH && (
                      <span
                        className="toggle-text"
                        onClick={() => toggleTextExpansion(post.id)}
                        style={{ marginLeft: "5px"}}
                      >
                        свернуть
                      </span>
                    )}
                  </>
                )}
              </p>

              {/* Дата публикации */}
              <p className="post-date">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="footer-desktop">
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" style={{color: "red"}} /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
        <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
        <Link to="/myprofile">
          <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
















// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { getDatabase, ref as dbRef, onValue, remove } from "firebase/database";
// import { auth } from "../firebase";
// import defaultAvatar from "../default-image.png";
// import basiclogo from "../basic-logo.png";
// import "../App.css";
// import "../PostForm.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { FaPlusCircle } from "react-icons/fa";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

// const HomePage = () => {
//   const [notification, setNotification] = useState(""); // For notifications
//   const [notificationType, setNotificationType] = useState(""); // For notification type
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [menuPostId, setMenuPostId] = useState(null); // To track the post that the menu is opened for
//     const [isMenuOpenn, setIsMenuOpenn] = useState(false);
  
//     const toggleMenuu = () => {
//       if (isMenuOpen) {
//         setTimeout(() => {
//           setIsMenuOpen(false);
//         }, 0); // Задержка для плавного исчезновения
//       } else {
//         setIsMenuOpen(true);
//       }
//     };

//   const toggleMenu = (postId) => {
//     setMenuPostId(postId === menuPostId ? null : postId); // Toggle visibility for the post
//   };

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (user) {
//       // Fetch user avatar
//       const db = getDatabase();
//       const userRef = dbRef(db, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const userData = snapshot.val();
//         if (userData && userData.avatarUrl) {
//           setUserAvatarUrl(userData.avatarUrl);
//         } else {
//           setUserAvatarUrl("./default-image.png"); // Default image
//         }
//       });
//     }
//   }, []);

//   useEffect(() => {
//     const db = getDatabase();
//     const postsRef = dbRef(db, "posts");

//     onValue(postsRef, (snapshot) => {
//       const postsData = snapshot.val();
//       if (postsData) {
//         const postsArray = Object.keys(postsData).map((key) => ({
//           id: key,
//           ...postsData[key],
//         }));
//         setPosts(postsArray);
//       }
//     });
//   }, []);

//   const handleDeletePost = (postId) => {
//     const db = getDatabase();
//     const postRef = dbRef(db, `posts/${postId}`);
//     remove(postRef)
//       .then(() => {
//         setNotificationType("success");
//         setNotification("Пост удален!");
//         setTimeout(() => {
//           setNotification("");
//           setNotificationType("");
//         }, 3000);
//       })
//       .catch((error) => {
//         console.error("Ошибка удаления поста: ", error);
//         setNotificationType("error");
//         setNotification("Ошибка удаления поста.");
//         setTimeout(() => {
//           setNotification("");
//           setNotificationType("");
//         }, 3000);
//       });
//   };

//   return (
//     <div className="home-container">
//       {notification && (
//         <div className={`notification ${notificationType}`}>
//           {notification}
//         </div>
//       )}

// <header>
//         <nav>
//           <ul>
//             <li><Link to="/home">Главная</Link></li>
//             <li><Link to="/about">О факультете</Link></li>
//             <li><Link to="/teachers">Преподаватели</Link></li>
//             <li><Link to="/schedule">Расписание</Link></li>
//             <li><Link to="/library">Библиотека</Link></li>
//             <li><Link to="/contacts">Контакты</Link></li>
//           </ul>
//           <ul style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>
//           <ul>
//             <li>
//               <Link to="/myprofile">
//               {/* <FaUser className="user-icon"></FaUser> */}
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         <div className="header-nav-2">

//         <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

//         <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>

//         <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenuu}>          
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//         </div>

//         <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
//         <ul>
//            <li><Link to="/home"><FontAwesomeIcon icon={faHome} style={{color: "red"}} /> Главная</Link></li>
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

//       <main style={{ paddingTop: "100px", paddingBottom: "100px" }}>
//         <section id="posts">
//           {posts.map((post) => (
//             <div key={post.id} className="post-card">
//               {/* Display post author information */}
//               <div className="post-auth-three-dot">
//                 <div className="post-author">
//                   <img
//                     src={post.userAvatar || defaultAvatar}
//                     alt="User Avatar"
//                     style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%" }}
//                   />
//                   <span style={{ fontWeight: "bolder"}}>{post.userName}</span>
//                 </div>

//                 {/* Show the three-dot menu only for the current user's posts */}
//                 {post.userId === auth.currentUser?.uid && (
//                   <div className="three-dot-menu">
//                     <span onClick={() => toggleMenu(post.id)}>...</span>
//                     {/* Show options if the menu is open */}
//                     {menuPostId === post.id && (
//                       <div className="menu-options">
//                         <span>Изменить</span>
//                         <span onClick={() => handleDeletePost(post.id)}>Удалить</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Display post content */}
//               <p className="post-date">{new Date(post.createdAt).toLocaleString()}</p>
//               {post.mediaUrl && (
//                 post.mediaUrl.endsWith(".mp4") ? (
//                   <video controls src={post.mediaUrl} className="post-media" />
//                 ) : (
//                   <img src={post.mediaUrl} alt="Post Media" className="post-media" />
//                 )
//               )}
//               <p className="post-content">{post.description}</p>
//             </div>
//           ))}
//         </section>
//       </main>

//       <footer className="footer-desktop">
//         <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
//       </footer>

//       <div className="footer-nav">
//         <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" style={{color: "red"}} /></Link>
//         <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
//         <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
//         <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
//         <Link to="/myprofile">
//           <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default HomePage;










// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { FaUser } from "react-icons/fa"; // Импорт иконки крестика
// import "../App.css"; // Импортируем стили
// import facultyLogo from "../logo.png";
// import basiclogo from "../basic-logo.png";
// import { getDatabase, ref as dbRef, onValue, set, push, update } from "firebase/database";
// import { auth } from "../firebase";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";

// const HomePage = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  
//     const toggleMenu = () => {
//       if (isMenuOpen) {
//         setTimeout(() => {
//           setIsMenuOpen(false);
//         }, 0); // Задержка для плавного исчезновения
//       } else {
//         setIsMenuOpen(true);
//       }
//     };

//     useEffect(() => {
//       const user = auth.currentUser;
//       if (user) {

//         // Получаем URL аватарки пользователя
//         const db = getDatabase();
//         const userRef = dbRef(db, `users/${user.uid}`);
//         onValue(userRef, (snapshot) => {
//           const userData = snapshot.val();
//           if (userData && userData.avatarUrl) {
//             setUserAvatarUrl(userData.avatarUrl);
//           } else {
//             setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
//           }
//         });

//       }
//     }, []);

//       const handleContextMenu = (event) => {
//         event.preventDefault();
//       }

//   return (
//     <div className="home-container" onContextMenu={handleContextMenu}>
//       <header>
//         <nav>
//           <ul>
//             <li><Link to="/home">Главная</Link></li>
//             <li><Link to="/about">О факультете</Link></li>
//             <li><Link to="/teachers">Преподаватели</Link></li>
//             <li><Link to="/schedule">Расписание</Link></li>
//             <li><Link to="/library">Библиотека</Link></li>
//             <li><Link to="/contacts">Контакты</Link></li>
//           </ul>
//           <ul style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>
//           <ul>
//             <li>
//               <Link to="/myprofile">
//               <FaUser className="user-icon"></FaUser>
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         <div className="header-nav-2">

//         <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

//         <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>

//         <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//         </div>

//         <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
//         <ul>
//            <li><Link to="/home"><FontAwesomeIcon icon={faHome} style={{color: "red"}} /> Главная</Link></li>
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

//       <main>
//         <section className="home-hero">
//           <h1>Добро пожаловать на факультет Кибербезопасности</h1>
//           <p>Изучайте и защищайте цифровой мир вместе с нами.</p>
//         </section>

//         <div className="faculty-image">
//           <img style={{ width: "300px", height: "300px"}} src={facultyLogo} alt="Фото факультета информационной безопасности" />
//         </div>

//         <section className="news">
//           <h2>Последние новости</h2>

//           <article>
//             <h3>Открытие нового учебного года</h3>
//             <p>
//               Приглашаем всех студентов на торжественное открытие нового учебного года. Подробности внутри.
//             </p>
//           </article>

//           <article>
//             <h3>Киберфорум 2024</h3>
//             <p>
//               Присоединяйтесь к крупнейшему форуму по кибербезопасности. Узнайте о новых тенденциях и угрозах в области информационной безопасности.
//             </p>
//           </article>
//         </section>
//       </main>

//       <footer className="footer-desktop">
//         <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
//       </footer>

//       <div className="footer-nav">
//         <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" style={{color: "red"}} /></Link>
//         <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
//         <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
//         <Link to="/myprofile">
//           <img 
//             src={userAvatarUrl} 
//             alt="User Avatar" 
//             className="footer-avatar" 
//           />
//         </Link>   
//       </div>
//     </div>
//   );
// };

// export default HomePage;