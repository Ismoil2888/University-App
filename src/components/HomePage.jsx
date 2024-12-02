import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, get, push, set, update, remove } from "firebase/database";
import { auth, database } from "../firebase";
import defaultAvatar from "../default-image.png";
import basiclogo from "../basic-logo.png";
import "../App.css";
import "../PostForm.css";
import anonymAvatar from '../anonym2.jpg';
import { GoKebabHorizontal } from "react-icons/go";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlusCircle, FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faBell } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [posts, setPosts] = useState([]);
  const [menuPostId, setMenuPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({}); // Для отслеживания состояния каждого поста
  const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);
  const menuRef = useRef(null);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const userId = auth.currentUser?.uid; // Текущий пользователь
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCount, setShowCount] = useState(true); // Управляет видимостью счетчика  
  const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
  if (location.pathname === "/notifications") {
    clearNotifications(); // Сбрасываем уведомления при переходе
  }
}, [location]);

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
      // Получаем URL аватарки пользователя
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatarUrl) {
          setUserAvatarUrl(userData.avatarUrl);
        } else {
          setUserAvatarUrl(defaultAvatar); // Изображение по умолчанию
        }
      });
    }
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const postsRef = dbRef(db, "posts");

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const postsArray = Object.keys(postsData).map((key) => ({
          id: key,
          ...postsData[key],
        }));
        setPosts(postsArray);
      }
    });

    // Загрузка данных текущего пользователя
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

    return () => unsubscribe(); // Отписываемся от слушателя при размонтировании компонента
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

  const openCommentModal = (postId) => {
    setCommentModal({ isOpen: true, postId });

    const database = getDatabase();
    const commentsRef = dbRef(database, `postComments/${postId}`);
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
    setCommentModal({ isOpen: false, postId: null });
    setComments([]);
    setEditingCommentId(null);
    setNewComment("");
  };

  const handleCommentSubmit = (isAnonymous = false) => {
    if (newComment.trim() === "") return;

    const database = getDatabase();
    const commentRef = dbRef(database, `postComments/${commentModal.postId}`);
    const postRef = dbRef(database, `posts/${commentModal.postId}`);

    const formattedTimestamp = new Date().toLocaleString("ru-RU"); // Форматируем дату для записи

    if (editingCommentId) {
      update(dbRef(database, `postComments/${commentModal.postId}/${editingCommentId}`), {
        comment: newComment,
        timestamp: formattedTimestamp, // Используем читаемую дату
      });
      setEditingCommentId(null);
    } else {
      const newCommentRef = push(commentRef);
      update(newCommentRef, {
        avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
        username: isAnonymous ? "Анонимно" : userDetails.username,
        userId: isAnonymous ? null : auth.currentUser?.uid,
        anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null,
        comment: newComment,
        timestamp: formattedTimestamp, // Используем читаемую дату
      });

      // Уведомление владельца поста
      get(postRef).then((snapshot) => {
        const postOwnerId = snapshot.val()?.userId;
        if (postOwnerId && postOwnerId !== auth.currentUser?.uid) {
          const notificationRef = dbRef(database, `notifications/${postOwnerId}`);
          const notificationKey = `comment_${newCommentRef.key}`; // Уникальный ключ для комментария
          set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
            avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
            username: isAnonymous ? "Анонимно" : userDetails.username,
            comment: newComment,
            timestamp: formattedTimestamp, // Используем читаемую дату
            type: 'comment',
          }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
        }
      });

      // Обновление commentCount
      get(commentRef).then((snapshot) => {
        const commentCount = snapshot.size || 0;
        update(postRef, { commentCount });
      });
    }
    setNewComment("");
  };

  const handleEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setNewComment(commentText);
    setActionMenuId(null); // Закрыть меню
  };

  const handleDeleteComment = (commentId) => {
    const database = getDatabase();
    const commentRef = dbRef(database, `postComments/${commentModal.postId}/${commentId}`);
    const postRef = dbRef(database, `posts/${commentModal.postId}`);

    remove(commentRef).then(() => {
      onValue(dbRef(database, `postComments/${commentModal.postId}`), (snapshot) => {
        const commentCount = snapshot.size || 0;
        update(postRef, { commentCount });
      });
    });
  };

  // Обработчик нажатия на лайк
  const handleLikeToggle = (postId) => {
    if (!userId) return; // Убедитесь, что пользователь авторизован

    const db = getDatabase();
    const postLikesRef = dbRef(db, `posts/${postId}/likes`);

    const post = posts.find((p) => p.id === postId);
    const isLiked = post?.likes && post.likes[userId];
    const updatedLikes = { ...post.likes };

    if (isLiked) {
      delete updatedLikes[userId]; // Удаляем лайк локально
    } else {
      updatedLikes[userId] = true; // Добавляем лайк локально
    }

    // Обновляем состояние постов
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );

    // Обновляем данные в Firebase
    if (isLiked) {
      // Снимаем лайк
      update(postLikesRef, { [userId]: null }).catch((error) =>
        console.error("Ошибка при снятии лайка: ", error)
      );

      // Удаляем уведомление о лайке
      get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
        const postOwnerId = snapshot.val()?.userId;
        if (postOwnerId && postOwnerId !== userId) {
          const notificationKey = `like_${postId}_${userId}`;
          const notificationRef = dbRef(database, `notifications/${postOwnerId}/${notificationKey}`);
          remove(notificationRef).catch((error) => console.error("Ошибка при удалении уведомления: ", error));
        }
      });
    } else {
      // Добавляем лайк
      update(postLikesRef, { [userId]: true }).catch((error) =>
        console.error("Ошибка при добавлении лайка: ", error)
      );

      // Добавляем уведомление о лайке
      get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
        const postOwnerId = snapshot.val()?.userId;
        if (postOwnerId && postOwnerId !== userId) {
          const notificationKey = `like_${postId}_${userId}`;
          set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
            avatarUrl: userDetails.avatarUrl || defaultAvatar,
            username: userDetails.username || "Пользователь",
            message: `Пользователю "${userDetails.username}" понравилась ваша публикация`,
            timestamp: new Date().toLocaleString("ru-RU"), // Читаемый формат даты
            type: 'like',
          }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
        }
      });
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const user = auth.currentUser;
  
    if (user) {
      const notificationsRef = dbRef(db, `notifications/${user.uid}`);
  
      onValue(notificationsRef, (snapshot) => {
        const notifications = snapshot.val();
        if (notifications) {
          const notificationKeys = Object.keys(notifications);
          setUnreadCount(notificationKeys.length);
  
          // Если уведомления появились, снова показываем счетчик
          setShowCount(true);
        } else {
          setUnreadCount(0);
          setShowCount(false);
        }
      });
    }
  }, []);  

  const clearNotifications = () => {
    setShowCount(false); // Скрыть счетчик
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Если клик вне menu-options, закрываем меню
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuPostId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 50 },
    },
  };
  
  // Модальное окно для отображения пользователей, поставивших лайк
  const [likesModal, setLikesModal] = useState({ isOpen: false, users: [] });

  const openLikesModal = (postId) => {
    const db = getDatabase();
    const likesRef = dbRef(db, `posts/${postId}/likes`);

    onValue(likesRef, (snapshot) => {
      if (snapshot.exists()) {
        const likesData = snapshot.val();
        const userIds = Object.keys(likesData);

        if (userIds.length === 0) {
          setLikesModal({ isOpen: true, users: [] });
          return;
        }

        // Получаем данные о пользователях, поставивших лайк
        const usersPromises = userIds.map((uid) =>
          get(dbRef(db, `users/${uid}`)).then((userSnap) => ({
            userId: uid,
            username: userSnap.val()?.username || "Пользователь",
            avatarUrl: userSnap.val()?.avatarUrl || defaultAvatar,
          }))
        );

        Promise.all(usersPromises)
          .then((users) => {
            setLikesModal({ isOpen: true, users });
          })
          .catch((error) => {
            console.error("Ошибка при получении данных о пользователях лайков:", error);
            setLikesModal({ isOpen: true, users: [] });
          });
      } else {
        setLikesModal({ isOpen: true, users: [] });
      }
    });
  };

  const closeLikesModal = () => {
    setLikesModal({ isOpen: false, users: [] });
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

          <Link to="/notifications">
  <div style={{ position: "relative" }}>
    <FontAwesomeIcon icon={faBell} className="footer-icon" />
    {showCount && unreadCount > 0 && (
      <span
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "8px",
          height: "10px",
          top: "8px",
          right: "-10px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          padding: "4px 6px",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        {unreadCount}
      </span>
    )}
  </div>
</Link>

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

      <main style={{ paddingTop: "70px", paddingBottom: "100px" }}>
        <section id="posts">
          {posts
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Сортируем по дате создания
           .map((post) => {
            const likesCount = post.likes ? Object.keys(post.likes).length : 0;
            const isLiked = post.likes && post.likes[userId];
            return(
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
                      <div ref={menuRef} className="menu-options">
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
                {isLiked ? (
                  <FaHeart
                    className="post-icon liked"
                    onClick={() => handleLikeToggle(post.id)}
                    style={{ color: "red" }}
                  />
                ) : (
                  <FaRegHeart
                    className="post-icon"
                    onClick={() => handleLikeToggle(post.id)}
                  />
                )}
                <FaRegComment 
                  className="post-icon" 
                  onClick={() => openCommentModal(post.id)} 
                />
                <FaRegBookmark className="post-icon" />
              </div>

              {/* Likes Count */}
              <p 
                className="post-likes" 
                onClick={() => openLikesModal(post.id)}
                style={{ cursor: "pointer" }}
              >
                Нравится: {likesCount}
              </p>

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

              <p 
                style={{color: "grey", marginLeft: "10px", marginTop: "5px"}} 
                onClick={() => openCommentModal(post.id)} 
              >
                Посмотреть все комментарии ({post.commentCount || 0})
              </p>

              {commentModal.isOpen && commentModal.postId === post.id && (
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
                      .slice()
                      .reverse()
                      .map((comment) => (
                        <div className="comment" key={comment.id}>
                          <img 
                            src={comment.avatarUrl || defaultAvatar} 
                            alt={comment.username} 
                            className="comment-avatar" 
                            onClick={() => goToProfile(comment.userId)}
                          />
                          <div className="comment-content">
                            <p 
                              className="comment-username"  
                              onClick={() => goToProfile(comment.userId)}
                            >
                              {comment.username}
                            </p>
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

 {likesModal.isOpen && (
   <div className="like-modal-overlay">
     <div className="like-modal">
       <div className="like-modal-header">
         <h3>Лайкнувшие пользователи</h3>
         <button className="close-like-modal" onClick={closeLikesModal}>
           &times;
         </button>
       </div>
       <div className="like-modal-body">
         {likesModal.users.length > 0 ? (
           likesModal.users.map((user) => (
             <div key={user.userId} className="like-user">
               <img src={user.avatarUrl} alt={user.username} className="like-avatar" onClick={() => goToProfile(post.userId)} />
               <span className="like-username" onClick={() => goToProfile(post.userId)}>{user.username}</span>
             </div>
           ))
         ) : (
           <p style={{color: "grey"}}>Нет лайков для этого поста.</p>
         )}
       </div>
     </div>
   </div>
 )}

              {/* Дата публикации */}
              <p className="post-date">{new Date(post.createdAt).toLocaleString("ru-RU")}</p>
            </div>
            );
          })}
        </section>
      </main>

      <footer className="footer-desktop">
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <motion.nav 
          variants={navbarVariants} 
          initial="hidden" 
          animate="visible" 
          className="footer-nav"
        >
          <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon active-icon" style={{ }} /></Link>
          <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
          <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
          <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
          <Link to="/myprofile">
            <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
          </Link>
        </motion.nav> 
      </div>
    </div>
  );
};

export default HomePage;



















// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { getDatabase, ref as dbRef, onValue, get, push, set, update, remove } from "firebase/database";
// import { auth, database } from "../firebase";
// import defaultAvatar from "../default-image.png";
// import basiclogo from "../basic-logo.png";
// import "../App.css";
// import "../PostForm.css";
// import anonymAvatar from '../anonym2.jpg';
// import { GoKebabHorizontal } from "react-icons/go";
// import { motion } from 'framer-motion';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { FaPlusCircle, FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark } from "react-icons/fa";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faBell } from "@fortawesome/free-solid-svg-icons";

// const HomePage = () => {
//   const [notification, setNotification] = useState("");
//   const [notificationType, setNotificationType] = useState("");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [menuPostId, setMenuPostId] = useState(null);
//   const [expandedPosts, setExpandedPosts] = useState({}); // Для отслеживания состояния каждого поста
//   const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null });
// const [comments, setComments] = useState([]);
// const [newComment, setNewComment] = useState("");
// const [editingCommentId, setEditingCommentId] = useState(null);
// const [actionMenuId, setActionMenuId] = useState(null);
// const actionMenuRef = useRef(null);
// const menuRef = useRef(null);
// const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
// const userId = auth.currentUser?.uid; // Текущий пользователь
// const [likesModal, setLikesModal] = useState({ isOpen: false, users: [] });

//     const [isMenuOpenn, setIsMenuOpenn] = useState(false);
//     const navigate = useNavigate();

//     const goToProfile = (userId) => {
//       navigate(`/profile/${userId}`);
//     };
//     const MAX_TEXT_LENGTH = 100; // Максимальное количество символов до сокращения текста
  
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

//       // Получаем URL аватарки пользователя
//       const db = getDatabase();
//       const userRef = dbRef(db, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const userData = snapshot.val();
//         if (userData && userData.avatarUrl) {
//           setUserAvatarUrl(userData.avatarUrl);
//         } else {
//           setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
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

//         // Загрузка данных текущего пользователя
//         const user = auth.currentUser;
//         if (user) {
//           const userRef = dbRef(database, `users/${user.uid}`);
//           onValue(userRef, (snapshot) => {
//             const data = snapshot.val();
//             if (data) {
//               setUserDetails({
//                 username: data.username || "User",
//                 avatarUrl: data.avatarUrl || "./default-image.png",
//               });
//             }
//           });
//         }
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

//   const toggleTextExpansion = (postId) => {
//     setExpandedPosts((prev) => ({
//       ...prev,
//       [postId]: !prev[postId], // Переключение между свернутым и развернутым состоянием
//     }));
//   };

//   const openCommentModal = (postId) => {
//     setCommentModal({ isOpen: true, postId });
  
//     const database = getDatabase();
//     const commentsRef = dbRef(database, `postComments/${postId}`);
//     onValue(commentsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
//         setComments(loadedComments);
//       } else {
//         setComments([]);
//       }
//     });
//   };
  
//   const closeCommentModal = () => {
//     setCommentModal({ isOpen: false, postId: null });
//     setComments([]);
//     setEditingCommentId(null);
//     setNewComment("");
//   };

//   const handleCommentSubmit = (isAnonymous = false) => {
//     if (newComment.trim() === "") return;
  
//     const database = getDatabase();
//     const commentRef = dbRef(database, `postComments/${commentModal.postId}`);
//     const postRef = dbRef(database, `posts/${commentModal.postId}`);
  
//     const formattedTimestamp = new Date().toLocaleString("ru-RU"); // Форматируем дату для записи
  
//     if (editingCommentId) {
//       update(dbRef(database, `postComments/${commentModal.postId}/${editingCommentId}`), {
//         comment: newComment,
//         timestamp: formattedTimestamp, // Используем читаемую дату
//       });
//       setEditingCommentId(null);
//     } else {
//       const newCommentRef = push(commentRef);
//       update(newCommentRef, {
//         avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//         username: isAnonymous ? "Анонимно" : userDetails.username,
//         userId: isAnonymous ? null : auth.currentUser?.uid,
//         anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null,
//         comment: newComment,
//         timestamp: formattedTimestamp, // Используем читаемую дату
//       });
  
//       // Уведомление владельца поста
//       get(postRef).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== auth.currentUser?.uid) {
//           const notificationRef = dbRef(database, `notifications/${postOwnerId}`);
//           get(notificationRef).then((notifSnapshot) => {
//             const notifications = notifSnapshot.val();
//             const isDuplicate = Object.values(notifications || {}).some(
//               (notif) =>
//                 notif.comment === newComment &&
//                 notif.username === (isAnonymous ? "Анонимно" : userDetails.username)
//             );
//             if (!isDuplicate) {
//               push(notificationRef, {
//                 avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//                 username: isAnonymous ? "Анонимно" : userDetails.username,
//                 comment: newComment,
//                 timestamp: formattedTimestamp, // Используем читаемую дату
//               });
//             }
//           });
//         }
//       });
  
//       // Обновление commentCount
//       get(commentRef).then((snapshot) => {
//         const commentCount = snapshot.size || 0;
//         update(postRef, { commentCount });
//       });
//     }
//     setNewComment("");
//   };

//   const handleEditComment = (commentId, commentText) => {
//     setEditingCommentId(commentId);
//     setNewComment(commentText);
//     setActionMenuId(null); // Закрыть меню
//   };

//   const handleDeleteComment = (commentId) => {
//     const database = getDatabase();
//     const commentRef = dbRef(database, `postComments/${commentModal.postId}/${commentId}`);
//     const postRef = dbRef(database, `posts/${commentModal.postId}`);
  
//     remove(commentRef).then(() => {
//       onValue(dbRef(database, `postComments/${commentModal.postId}`), (snapshot) => {
//         const commentCount = snapshot.size || 0;
//         update(postRef, { commentCount });
//       });
//     });
//   };  

//   const openLikesModal = (postId) => {
//     const db = getDatabase();
//     const likesRef = dbRef(db, `posts/${postId}/likes`);
  
//     onValue(likesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const users = Object.keys(snapshot.val() || {}).map((userId) => ({
//           userId,
//         }));
  
//         Promise.all(
//           users.map((user) =>
//             get(dbRef(db, `users/${user.userId}`)).then((snap) => ({
//               ...user,
//               username: snap.val()?.username || "Неизвестный",
//               avatarUrl: snap.val()?.avatarUrl || defaultAvatar,
//             }))
//           )
//         ).then((usersWithDetails) => {
//           setLikesModal({ isOpen: true, users: usersWithDetails });
//         });
//       } else {
//         setLikesModal({ isOpen: true, users: [] });
//       }
//     });
//   };
  
//   const closeLikesModal = () => {
//     setLikesModal({ isOpen: false, users: [] });
//   }; 

//   const handleLikeToggle = (postId) => {
//     if (!userId) return; // Убедитесь, что пользователь авторизован

//     const db = getDatabase();
//     const postLikesRef = dbRef(db, `posts/${postId}/likes`);

//     const post = posts.find((p) => p.id === postId);
//     const isLiked = post?.likes && post.likes[userId];
//     const updatedLikes = { ...post.likes };

//     if (isLiked) {
//       delete updatedLikes[userId]; // Удаляем лайк локально
//     } else {
//       updatedLikes[userId] = true; // Добавляем лайк локально
//     }

//     // Обновляем состояние постов
//     setPosts((prevPosts) =>
//       prevPosts.map((p) => {
//         if (p.id === postId) {
//           return { ...p, likes: updatedLikes };
//         }
//         return p;
//       })
//     );

//     // Обновляем данные в Firebase
//     if (isLiked) {
//       // Снимаем лайк
//       update(postLikesRef, { [userId]: null }).catch((error) =>
//         console.error("Ошибка при снятии лайка: ", error)
//       );

//       // Удаляем уведомление о лайке
//       get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== userId) {
//           const notificationKey = `like_${postId}_${userId}`;
//           const notificationRef = dbRef(database, `notifications/${postOwnerId}/${notificationKey}`);
//           remove(notificationRef).catch((error) => console.error("Ошибка при удалении уведомления: ", error));
//         }
//       });
//     } else {
//       // Добавляем лайк
//       update(postLikesRef, { [userId]: true }).catch((error) =>
//         console.error("Ошибка при добавлении лайка: ", error)
//       );

//       // Добавляем уведомление о лайке
//       get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== userId) {
//           const notificationKey = `like_${postId}_${userId}`;
//           set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
//             avatarUrl: userDetails.avatarUrl || defaultAvatar,
//             username: userDetails.username || "Пользователь",
//             message: `Пользователю "${userDetails.username}" понравилась ваша публикация`,
//             timestamp: new Date().toLocaleString("ru-RU"), // Читаемый формат даты
//             type: 'like',
//           }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
//         }
//       });
//     }
//   };

//     // Обработчик нажатия на лайк
//     // const handleLikeToggle = (postId) => {
//     //   if (!userId) return; // Убедитесь, что пользователь авторизован
    
//     //   const db = getDatabase();
//     //   const postLikesRef = dbRef(db, `posts/${postId}/likes`);
    
//     //   setPosts((prevPosts) =>
//     //     prevPosts.map((post) => {
//     //       if (post.id === postId) {
//     //         const isLiked = post.likes && post.likes[userId];
//     //         const updatedLikes = { ...post.likes };
    
//     //         if (isLiked) {
//     //           delete updatedLikes[userId]; // Удаляем лайк локально
//     //         } else {
//     //           updatedLikes[userId] = true; // Добавляем лайк локально
//     //         }
    
//     //         return {
//     //           ...post,
//     //           likes: updatedLikes,
//     //         };
//     //       }
//     //       return post;
//     //     })
//     //   );
    
//     //   // Обновляем данные в Firebase
//     //   const isLiked = posts.find((post) => post.id === postId)?.likes?.[userId];
//     //   if (isLiked) {
//     //     update(postLikesRef, { [userId]: null }).catch((error) =>
//     //       console.error("Ошибка при снятии лайка: ", error)
//     //     );
//     //   } else {
//     //     update(postLikesRef, { [userId]: true }).catch((error) =>
//     //       console.error("Ошибка при добавлении лайка: ", error)
//     //     );
//     //   }
//     // };

//   const toggleActionMenu = (commentId) => {
//     setActionMenuId((prev) => (prev === commentId ? null : commentId));
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isInsideMenu = actionMenuRef.current && actionMenuRef.current.contains(event.target);
//       const isActionButton = event.target.closest(".action-menu button");
      
//       // Закрываем меню только если клик произошел за пределами actionMenu и не на кнопках
//       if (!isInsideMenu && !isActionButton) {
//         setActionMenuId(null);
//       }
//     };
  
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Если клик вне menu-options, закрываем меню
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setMenuPostId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const headerVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       transition: { duration: 1, type: 'spring', stiffness: 50 } 
//     },
//   };

//   const navbarVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.8, type: 'spring', stiffness: 50 },
//     },
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

//         <Link to="/notifications">
//           <FontAwesomeIcon icon={faBell} className="footer-icon" />
//         </Link>

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

//       <main style={{ paddingTop: "70px", paddingBottom: "100px" }}>
//         <section id="posts">
//           {posts
//            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Сортируем по дате создания
//            .map((post) => {
//             const likesCount = post.likes ? Object.keys(post.likes).length : 0;
//             const isLiked = post.likes && post.likes[userId];
//             return(
//             <div key={post.id} className="post-card">
//               {/* Заголовок: Аватар и имя пользователя */}
//               <div className="post-header">
//                 <div className="post-author">
//                   <img
//                     src={post.userAvatar || defaultAvatar}
//                     alt="User Avatar"
//                     className="post-avatar"
//                     onClick={() => goToProfile(post.userId)}
//                   />
//                   <span 
//                   className="post-username"
//                   onClick={() => goToProfile(post.userId)}
//                   >{post.userName}</span>
//                 </div>
//                 {post.userId === auth.currentUser?.uid && (
//                   <div className="three-dot-menu">
//                     <span onClick={() => toggleMenu(post.id)}>...</span>
//                     {menuPostId === post.id && (
//                       <div ref={menuRef} className="menu-options">
//                         <span>Изменить</span>
//                         <span onClick={() => handleDeletePost(post.id)}>Удалить</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Медиа (изображение или видео) */}
//               {post.mediaUrl && (
//                 post.mediaUrl.endsWith(".mp4") ? (
//                   <video controls src={post.mediaUrl} className="post-media" />
//                 ) : (
//                   <img src={post.mediaUrl} alt="Post Media" className="post-media" />
//                 )
//               )}

//                            {/* Actions: Like, Comment, Save */}
//               <div className="post-actions">
//               {isLiked ? (
//                       <FaHeart
//                         className="post-icon liked"
//                         onClick={() => handleLikeToggle(post.id)}
//                         style={{ color: "red" }}
//                       />
//                     ) : (
//                       <FaRegHeart
//                         className="post-icon"
//                         onClick={() => handleLikeToggle(post.id)}
//                       />
//                     )}
//                 <FaRegComment 
//                   className="post-icon" 
//                   onClick={() => openCommentModal(post.id)} 
//                 />
//                 <FaRegBookmark className="post-icon" />
//               </div>

//               {/* Likes Count */}
//               <p className="post-likes" onClick={() => openLikesModal(post.id)}>Нравится: {likesCount}</p>


//               {/* Описание с разворачиванием/сворачиванием текста */}
//               <p className="post-content">
//                 <span className="post-username">{post.userName}</span>{" "}
//                 {post.description.length > MAX_TEXT_LENGTH && !expandedPosts[post.id] ? (
//                   <>
//                     {post.description.slice(0, MAX_TEXT_LENGTH)}...
//                     <span
//                       className="toggle-text"
//                       onClick={() => toggleTextExpansion(post.id)}
//                     >
//                       ещё
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     {post.description}
//                     {post.description.length > MAX_TEXT_LENGTH && (
//                       <span
//                         className="toggle-text"
//                         onClick={() => toggleTextExpansion(post.id)}
//                         style={{ marginLeft: "5px"}}
//                       >
//                         свернуть
//                       </span>
//                     )}
//                   </>
//                 )}
//               </p>

//               <p style={{color: "grey",    marginLeft: "10px", marginTop: "5px" }}   onClick={() => openCommentModal(post.id)} 
//               >Посмотреть все комментарии ({post.commentCount || 0})</p>

//               {commentModal.isOpen && (
//   <div className="comment-modal-overlay">
//     <div className="comment-modal">
//       <div className="modal-header">
//         <h3>Комментарии</h3>
//         <button className="close-modal" onClick={closeCommentModal}>
//           &times;
//         </button>
//       </div>
//       <div className="comments-list">
//         {comments 
//         .slice()
//         .reverse()
//         .map((comment) => (
//           <div className="comment" key={comment.id}>
//             <img src={comment.avatarUrl || defaultAvatar} alt={comment.username} className="comment-avatar" onClick={() => goToProfile(comment.userId)}/>
//             <div className="comment-content">
//               <p className="comment-username"  onClick={() => goToProfile(comment.userId)}>{comment.username}</p>
//               <p className="comment-text">{comment.comment}</p>
//               <span className="comment-timestamp">{comment.timestamp}</span>
//             </div>
//             <div ref={actionMenuRef} className="menu-icon-container">
//   {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
//     <>
//       <GoKebabHorizontal style={{fontSize: "20px", color: "grey"}} onClick={() => toggleActionMenu(comment.id)} className="action-icon"/>
//       {actionMenuId === comment.id && (
//         <div className={`action-menu show`}>
//           <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
//           <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
//         </div>
//       )}
//     </>
//   )}
// </div>
//           </div>
//         ))}
//       </div>
//       <div className="new-comment">
//         <input
//           type="text"
//           placeholder="Напишите комментарий..."
//           value={newComment}
//           onChange={(e) => setNewComment(e.target.value)}
//         />
//         <button onClick={() => handleCommentSubmit(false)}>Отправить</button>
//         <button onClick={() => handleCommentSubmit(true)}>Отправить анонимно</button>
//       </div>
//     </div>
//   </div>
// )}

// {likesModal.isOpen && (
//   <div className="like-modal-overlay">
//     <div className="like-modal">
//       <div className="like-modal-header">
//         <h3>Лайкнувшие пользователи</h3>
//         <button className="close-like-modal" onClick={closeLikesModal}>
//           &times;
//         </button>
//       </div>
//       <div className="like-modal-body">
//         {likesModal.users.length > 0 ? (
//           likesModal.users.map((user) => (
//             <div key={user.userId} className="like-user">
//               <img src={user.avatarUrl} alt={user.username} className="like-avatar" onClick={() => goToProfile(post.userId)} />
//               <span className="like-username" onClick={() => goToProfile(post.userId)}>{user.username}</span>
//             </div>
//           ))
//         ) : (
//           <p style={{color: "grey"}}>Нет лайков для этого поста.</p>
//         )}
//       </div>
//     </div>
//   </div>
// )}

//               {/* Дата публикации */}
//               <p className="post-date">{new Date(post.createdAt).toLocaleString()}</p>
//             </div>
//             );
// })}
//         </section>
//       </main>

//       <footer className="footer-desktop">
//         <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
//       </footer>

//       <div className="footer-nav">
//       <motion.nav 
//         variants={navbarVariants} 
//         initial="hidden" 
//         animate="visible" 
//         className="footer-nav"
//       >
//         <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon active-icon" style={{ }} /></Link>
//         <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
//         <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
//         <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
//         <Link to="/myprofile">
//           <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
//         </Link>
//         </motion.nav> 
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