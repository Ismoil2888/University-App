// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { getDatabase, ref as dbRef, onValue, push, update, remove } from "firebase/database";
// import { auth } from "../firebase";
// import "../App.css";
// import "../teachers.css";
// import logoTip from "../basic-logo.png"; 
// import defaultTeacherImg from "../teacher.png";
// import { FaCommentDots } from "react-icons/fa";
// import { GoKebabHorizontal } from "react-icons/go";
// import anonymAvatar from '../anonym2.jpg';

// const Teachers = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeDescription, setActiveDescription] = useState(null);
//   const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
//   const [commentModal, setCommentModal] = useState({ isOpen: false, teacherId: null });
//   const [newComment, setNewComment] = useState("");
//   const [comments, setComments] = useState([]);
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [actionMenuId, setActionMenuId] = useState(null);
//   const actionMenuRef = useRef(null);

// const navigate = useNavigate();

// const goToProfile = (userId) => {
//   navigate(`/profile/${userId}`);
// };

//   useEffect(() => {
//     const database = getDatabase();
//     const teachersRef = dbRef(database, "teachers");

//     onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedTeachers = Object.keys(data).map((id) => ({ id, ...data[id] }));
//       loadedTeachers.forEach((teacher) => {
//         const commentsRef = dbRef(database, `comments/${teacher.id}`);
//         onValue(commentsRef, (commentSnapshot) => {
//           const commentsData = commentSnapshot.val();
//           teacher.commentCount = commentsData ? Object.keys(commentsData).length : 0;
//           setTeachers([...loadedTeachers]);
//         });
//       });        
//         setFilteredTeachers(loadedTeachers);
//       } else {
//         setTeachers([]);
//         setFilteredTeachers([]);
//       }
//     });

//     const user = auth.currentUser;
//     if (user) {
//       const userRef = dbRef(database, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           setUserDetails({
//             username: data.username || "User",
//             avatarUrl: data.avatarUrl || "./default-image.png",
//           });
//         }
//       });
//     }
//   }, []);

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);
//     setFilteredTeachers(teachers.filter((teacher) =>
//       teacher.name.toLowerCase().includes(query) || teacher.surname.toLowerCase().includes(query)
//     ));
//   };

//   const openCommentModal = (teacherId) => {
//     setCommentModal({ isOpen: true, teacherId });

//     const database = getDatabase();
//     const commentsRef = dbRef(database, `comments/${teacherId}`);
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
//     setCommentModal({ isOpen: false, teacherId: null });
//     setComments([]);
//     setActionMenuId(null);
//     setEditingCommentId(null);
//     setNewComment("");
//   };

//   const handleCommentSubmit = (isAnonymous = false) => {
//     if (newComment.trim() === "") return;
  
//     const database = getDatabase();
//     const commentRef = dbRef(database, `comments/${commentModal.teacherId}`);
  
//     if (editingCommentId) {
//       update(dbRef(database, `comments/${commentModal.teacherId}/${editingCommentId}`), {
//         comment: newComment,
//         timestamp: new Date().toLocaleString(),
//       });
//       setEditingCommentId(null);
//     } else {
//       const newCommentRef = push(commentRef);
//       update(newCommentRef, {
//         avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//         username: isAnonymous ? "Анонимно" : userDetails.username,
//         userId: isAnonymous ? null : auth.currentUser?.uid,
//         anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null, // Сохраняем ID для анонимного комментария
//         comment: newComment,
//         timestamp: new Date().toLocaleString(),
//       });
//     }
//     setNewComment("");
//   };

//   const handleEditComment = (commentId, commentText) => {
//     setEditingCommentId(commentId);
//     setNewComment(commentText);
//     setActionMenuId(null);
//   };

//   const handleDeleteComment = (commentId) => {
//     const database = getDatabase();
//     remove(dbRef(database, `comments/${commentModal.teacherId}/${commentId}`));
//     setActionMenuId(null);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
//         setActionMenuId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const toggleActionMenu = (commentId) => {
//     setActionMenuId((prev) => (prev === commentId ? null : commentId));
//   };

//     const handleContextMenu = (event) => {
//       event.preventDefault();
//     }

//   return (
//     <div className="glav-cotainer" onContextMenu={handleContextMenu}>
//       <section className="tch-hero">
//         <div className="faculty-image">
//           <img style={{ height: "240px", marginTop: "58px" }} width="255px" src={logoTip} alt="Фото преподавателей" />
//         </div>
//         <h1>Преподавательский Состав</h1>
//       </section>

//       <section className="teachers-section">
//         <div className="search-bar">
//           <input 
//             type="search" 
//             placeholder="Поиск преподавателя..." 
//             value={searchQuery}
//             onChange={handleSearchChange}
//             className="search-input"
//           />
//         </div>

//         <div className="tch-container">
//           {filteredTeachers.length === 0 ? (
//             <p>Преподаватели не найдены.</p>
//           ) : (
//             filteredTeachers.map((teacher) => (
//               <div className="teacher-card" key={teacher.id}>
//                 <img src={teacher.photo || defaultTeacherImg} alt={`${teacher.name} ${teacher.surname}`} />
//                 <h3>{`${teacher.name} ${teacher.surname}`}</h3>
//                 <p><strong>Предмет:</strong> {teacher.subject}</p>
//                 <p><strong>Статус:</strong> {teacher.status}</p>
//                 <div className="comment-icon-and-count">
//                 <FaCommentDots
//                   className="comment-icon"
//                   onClick={() => openCommentModal(teacher.id)}
//                 />
//                 <span className="comment-count">{teacher.commentCount || 0}</span>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </section>

//       {/* Модальное окно комментариев */}
// {commentModal.isOpen && (
//   <div className="comment-modal-overlay">
//     <div className="comment-modal">
//       <div className="modal-header">
//         <h3>Комментарии</h3>
//         <button className="close-modal" onClick={closeCommentModal}>
//           &times;
//         </button>
//       </div>
//       <div className="comments-list">
//         {comments.map((comment) => (
//           <div className="comment" key={comment.id}>
//             <img
//               src={comment.avatarUrl || "./default-avatar.png"}
//               alt={comment.username}
//               className="comment-avatar"
//               onClick={() => goToProfile(comment.userId)}
//               style={{ cursor: "pointer" }}     
//             />
//             <div className="comment-content">
//               <Link to={`/profile/${comment.userId}`} className="comment-username" style={{ cursor: "pointer" }}>
//                 <p>
//                   {comment.username}
//                 </p>
//               </Link>
//               <p className="comment-text">{comment.comment}</p>
//               <span className="comment-timestamp">{comment.timestamp}</span>
//             </div>
//             <div ref={actionMenuRef} className="menu-icon-container">
//   {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
//     <>
//       <GoKebabHorizontal
//         onClick={() => toggleActionMenu(comment.id)}
//         className="action-icon"
//       />
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
//   <input 
//     type="text" 
//     placeholder="Напишите комментарий..."
//     value={newComment} 
//     onChange={(e) => setNewComment(e.target.value)} 
//   />
//   <button onClick={() => handleCommentSubmit(false)}>
//     {editingCommentId ? "Изменить" : "Отправить"}
//   </button>
//   <button onClick={() => handleCommentSubmit(true)}>
//     {editingCommentId ? "Изменить анонимно" : "Отправить анонимно"}
//   </button>
// </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default Teachers;















import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, push, update, remove } from "firebase/database";
import { auth } from "../firebase";
import "../App.css";
import "../teachers.css";
import logoTip from "../basic-logo.png"; 
import defaultTeacherImg from "../teacher.png";
import { FaCommentDots } from "react-icons/fa";
import basiclogo from "../basic-logo.png";
import { FaPlusCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import { GoKebabHorizontal } from "react-icons/go";
import anonymAvatar from '../anonym2.jpg';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDescription, setActiveDescription] = useState(null);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const [commentModal, setCommentModal] = useState({ isOpen: false, teacherId: null });
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null); // Реф для отслеживания кликов за пределами


const navigate = useNavigate();

const goToProfile = (userId) => {
  navigate(`/profile/${userId}`);
};

  useEffect(() => {
    const database = getDatabase();
    const teachersRef = dbRef(database, "teachers");

    // Загрузка преподавателей
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTeachers = Object.keys(data).map((id) => ({ id, ...data[id] }));
      // Для каждого преподавателя загружаем количество комментариев
      loadedTeachers.forEach((teacher) => {
        const commentsRef = dbRef(database, `comments/${teacher.id}`);
        onValue(commentsRef, (commentSnapshot) => {
          const commentsData = commentSnapshot.val();
          teacher.commentCount = commentsData ? Object.keys(commentsData).length : 0;
          setTeachers([...loadedTeachers]); // Обновляем состояние
        });
      });        
        setFilteredTeachers(loadedTeachers);
      } else {
        setTeachers([]);
        setFilteredTeachers([]);
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
            avatarUrl: data.avatarUrl || "./default-image.png",
          });
        }
      });
    }
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredTeachers(teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(query) || teacher.surname.toLowerCase().includes(query)
    ));
  };

  const openCommentModal = (teacherId) => {
    setCommentModal({ isOpen: true, teacherId });

    // Загрузка комментариев для преподавателя
    const database = getDatabase();
    const commentsRef = dbRef(database, `comments/${teacherId}`);
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
    setCommentModal({ isOpen: false, teacherId: null });
    setComments([]);
    setActionMenuId(null);
    setEditingCommentId(null);
    setNewComment("");
  };

  const handleCommentSubmit = (isAnonymous = false) => {
    if (newComment.trim() === "") return;
  
    const database = getDatabase();
    const commentRef = dbRef(database, `comments/${commentModal.teacherId}`);
  
    if (editingCommentId) {
      // Изменение комментария
      update(dbRef(database, `comments/${commentModal.teacherId}/${editingCommentId}`), {
        comment: newComment,
        timestamp: new Date().toLocaleString(),
      });
      setEditingCommentId(null);
    } else {
      // Добавление нового комментария
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
    setActionMenuId(null); // Закрыть меню
  };

  const handleDeleteComment = (commentId) => {
    const database = getDatabase();
    remove(dbRef(database, `comments/${commentModal.teacherId}/${commentId}`));
    setActionMenuId(null); // Закрыть меню
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

  const toggleActionMenu = (commentId) => {
    setActionMenuId((prev) => (prev === commentId ? null : commentId));
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);

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
          setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
        }
      });

    }
  }, []);
  
    const toggleMenu = () => {
      if (isMenuOpen) {
        setTimeout(() => {
          setIsMenuOpen(false);
        }, 0); // Задержка для плавного исчезновения
      } else {
        setIsMenuOpen(true);
      }
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
    }

  return (
    <div className="glav-cotainer" onContextMenu={handleContextMenu}>
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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Преподаватели</ul>
          <ul>
            <li>
            <Link to="/myprofile">
          <img 
            src={userAvatarUrl} 
            alt="User Avatar" 
            className="footer-avatar" 
          />
        </Link>
            </li>
          </ul>
        </nav>

        <div className="header-nav-2">

        <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Преподаватели</ul>

        <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          
          <span className="bm-span"></span>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
        </div>

        <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
        <ul>
           <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
           <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
           <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} style={{color: "red"}} /> Преподаватели</Link></li>
           <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
           <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
           <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
           <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
        </ul>
        </div>

        </div>
      </header>

      <section className="tch-hero">
        <div className="faculty-image">
          <img style={{ height: "240px", marginTop: "58px" }} width="255px" src={logoTip} alt="Фото преподавателей" />
        </div>
        <h1>Преподавательский Состав</h1>
      </section>

      <section className="teachers-section">
        <div className="search-bar">
          <input 
            type="search" 
            placeholder="Поиск преподавателя..." 
            value={searchQuery}
            onChange={handleSearchChange} // Добавляем обработчик изменения
            className="search-input"
          />
        </div>

        <div className="tch-container">
          {filteredTeachers.length === 0 ? (
            <p>Преподаватели не найдены.</p>
          ) : (
            filteredTeachers.map((teacher) => (
              <div className="teacher-card" key={teacher.id}>
                <img src={teacher.photo || defaultTeacherImg} alt={`${teacher.name} ${teacher.surname}`} />
                <h3>{`${teacher.name} ${teacher.surname}`}</h3>
                <p><strong>Предмет:</strong> {teacher.subject}</p>
                <p><strong>Статус:</strong> {teacher.status}</p>
                <div className="comment-icon-and-count">
                <FaCommentDots
                  className="comment-icon"
                  onClick={() => openCommentModal(teacher.id)}
                />
                <span className="comment-count">{teacher.commentCount || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Модальное окно комментариев */}
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
        {comments.map((comment) => (
          <div className="comment" key={comment.id}>
            <img
              src={comment.avatarUrl || "./default-avatar.png"}
              alt={comment.username}
              className="comment-avatar"
              onClick={() => goToProfile(comment.userId)} // Переход по клику на аватар
              style={{ cursor: "pointer" }} // Добавить стиль для указания, что элемент кликабельный      
            />
            <div className="comment-content">
              <Link to={`/profile/${comment.userId}`} className="comment-username" style={{ cursor: "pointer" }}>
                <p>
                  {comment.username}
                </p>
              </Link>
              <p className="comment-text">{comment.comment}</p>
              <span className="comment-timestamp">{comment.timestamp}</span>
            </div>
            <div ref={actionMenuRef} className="menu-icon-container">
  {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
    <>
      <GoKebabHorizontal
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
  <button onClick={() => handleCommentSubmit(false)}>
    {editingCommentId ? "Изменить" : "Отправить"}
  </button>
  <button onClick={() => handleCommentSubmit(true)}>
    {editingCommentId ? "Изменить анонимно" : "Отправить анонимно"}
  </button>
</div>
    </div>
  </div>
)}


      <footer className="footer-desktop">
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" style={{color: "red"}} /></Link>
        <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
        <Link to="/myprofile">
          <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
        </Link>
      </div>
    </div>
  );
};

export default Teachers;