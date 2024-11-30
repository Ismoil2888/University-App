import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, push, set } from "firebase/database";
import defaultAvatar from "../default-image.png";
import defaultImage from "../Ttulogo.jpg";
import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlusCircle } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

const PostForm = () => {
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: defaultAvatar });
  const [media, setMedia] = useState(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const database = getDatabase();
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
  }, []);

  const handleMediaChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!description && !media) {
      alert("Пожалуйста, добавьте описание или медиафайл!");
      return;
    }
  
    setIsUploading(true);
  
    const db = getDatabase();
    const storage = getStorage();
    const currentUser = auth.currentUser;
  
    if (!currentUser) {
      alert("Вы должны войти в систему, чтобы публиковать посты!");
      setIsUploading(false);
      return;
    }
  
    const postsRef = dbRef(db, "posts");
    let mediaUrl = null;
  
    if (media) {
      const mediaRef = storageRef(storage, `posts/${media.name}-${Date.now()}`);
      await uploadBytes(mediaRef, media);
      mediaUrl = await getDownloadURL(mediaRef);
    } else {
      // Установка изображения по умолчанию
      mediaUrl = defaultImage;
    }
  
    const postData = {
      description,
      mediaUrl,
      createdAt: new Date().toISOString(),
      userName: userDetails.username,
      userAvatar: userDetails.avatarUrl,
      userId: currentUser.uid,
    };
  
    const newPostRef = push(postsRef);
    await set(newPostRef, postData);
  
    setIsUploading(false);
    setMedia(null);
    setDescription("");
    navigate("/home");
  };  

  const toggleMenuu = () => {
    if (isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 0); // Задержка для плавного исчезновения
    } else {
      setIsMenuOpen(true);
    }
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

  return (
    <div className="post-container">
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

        <FaChevronLeft style={{ marginLeft: "10px", color: "white", fontSize: "25px"}} onClick={() => navigate(-1)} />

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

      <div className="postform-header">
      <div>
        <FaChevronLeft style={{position: "absolute", left: "0", top: "0", color: "white", fontSize: "25px"}} onClick={() => navigate(-1)} />
      </div>
      <div style={{marginTop: "70px"}} className="post-author">
      <img src={userDetails.avatarUrl} alt="User Avatar" style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "50%"  }} />
      <span style={{color: "#e4dcdc", fontWeight: "bolder", marginLeft: "10px"}}>{userDetails.username}</span>
      </div>
      </div>
      <div className="post-form-container">
        <form onSubmit={handlePostSubmit} className="post-form">
          <h2>Создать пост</h2>
          <div className="form-group">
            <label htmlFor="media">Медиа (изображение или видео):</label>
            <input type="file" id="media" accept="image/*,video/*" onChange={handleMediaChange} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Описание:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание поста"
              rows="4"
            />
          </div>
          <button type="submit" disabled={isUploading} className="submit-btn">
            {isUploading ? "Публикация..." : "Опубликовать"}
          </button>
        </form>
      </div>

      <footer className="footer-desktop">
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
        <Link to="/post"><FaPlusCircle className="footer-icon  active-icon" style={{}} /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
        <Link to="/myprofile">
          <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
        </Link>
      </div>
    </div>
  );
};

export default PostForm;








// import React, { useState } from "react";
// import { getDatabase, ref, push, set } from "firebase/database";
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getAuth } from "firebase/auth"; // Импорт Firebase Auth
// import { useNavigate } from "react-router-dom";
// import "../PostForm.css";

// const PostForm = () => {
//   const [media, setMedia] = useState(null);
//   const [description, setDescription] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const navigate = useNavigate();

//   const handleMediaChange = (e) => {
//     setMedia(e.target.files[0]);
//   };

//   const handlePostSubmit = async (e) => {
//     e.preventDefault();
//     if (!description && !media) {
//       alert("Пожалуйста, добавьте описание или медиафайл!");
//       return;
//     }

//     setIsUploading(true);

//     const db = getDatabase();
//     const storage = getStorage();
//     const auth = getAuth(); // Инициализация Firebase Auth
//     const currentUser = auth.currentUser; // Получение текущего пользователя

//     if (!currentUser) {
//       alert("Вы должны войти в систему, чтобы публиковать посты!");
//       setIsUploading(false);
//       return;
//     }

//     const postsRef = ref(db, "posts");

//     let mediaUrl = null;

//     if (media) {
//       const mediaRef = storageRef(storage, `posts/${media.name}-${Date.now()}`);
//       await uploadBytes(mediaRef, media);
//       mediaUrl = await getDownloadURL(mediaRef);
//     }

//     const postData = {
//       description,
//       mediaUrl,
//       createdAt: new Date().toISOString(),
//       userName: currentUser.displayName || "Аноним", // Имя пользователя
//       userAvatar: currentUser.photoURL || null, // URL аватара пользователя
//       userId: currentUser.uid, // ID пользователя
//     };

//     const newPostRef = push(postsRef);
//     await set(newPostRef, postData);

//     setIsUploading(false);
//     setMedia(null);
//     setDescription("");
//     // navigate("/home");
//   };

//   return (
//     <div className="post-form-container">
//       <form onSubmit={handlePostSubmit} className="post-form">
//         <h2>Создать пост</h2>
//         <div className="form-group">
//           <label htmlFor="media">
//             Медиа (изображение или видео):
//           </label>
//           <input type="file" id="media" accept="image/*,video/*" onChange={handleMediaChange} />
//         </div>
//         <div className="form-group">
//           <label htmlFor="description">Описание:</label>
//           <textarea
//             id="description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Введите описание поста"
//             rows="4"
//           />
//         </div>
//         <button type="submit" disabled={isUploading} className="submit-btn">
//           {isUploading ? "Публикация..." : "Опубликовать"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PostForm;










// import React, { useState } from "react";
// import { getDatabase, ref, push, set } from "firebase/database";
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import { useNavigate } from "react-router-dom";
// import "../PostForm.css"; // Новый CSS файл для стилей

// const PostForm = () => {
//   const [media, setMedia] = useState(null);
//   const [description, setDescription] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const navigate = useNavigate();

//   const handleMediaChange = (e) => {
//     setMedia(e.target.files[0]);
//   };

//   const handlePostSubmit = async (e) => {
//     e.preventDefault();
//     if (!description && !media) {
//       alert("Пожалуйста, добавьте описание или медиафайл!");
//       return;
//     }

//     setIsUploading(true);

//     const db = getDatabase();
//     const storage = getStorage();
//     const postsRef = ref(db, "posts");

//     let mediaUrl = null;

//     if (media) {
//       const mediaRef = storageRef(storage, `posts/${media.name}-${Date.now()}`);
//       await uploadBytes(mediaRef, media);
//       mediaUrl = await getDownloadURL(mediaRef);
//     }

//     const postData = {
//       description,
//       mediaUrl,
//       createdAt: new Date().toISOString(),
//     };

//     const newPostRef = push(postsRef);
//     await set(newPostRef, postData);

//     setIsUploading(false);
//     setMedia(null);
//     setDescription("");
//     // navigate("/home");
//   };

//   return (
//     <div className="post-form-container">
//       <form onSubmit={handlePostSubmit} className="post-form">
//         <h2>Создать пост</h2>
//         <div className="form-group">
//           <label htmlFor="media">
//             Медиа (изображение или видео):
//           </label>
//           <input type="file" id="media" accept="image/*,video/*" onChange={handleMediaChange} />
//         </div>
//         <div className="form-group">
//           <label htmlFor="description">Описание:</label>
//           <textarea
//             id="description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Введите описание поста"
//             rows="4"
//           />
//         </div>
//         <button type="submit" disabled={isUploading} className="submit-btn">
//           {isUploading ? "Публикация..." : "Опубликовать"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PostForm;












// import React, { useState } from "react";
// import { getDatabase, ref, push, set } from "firebase/database";
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import { useNavigate } from "react-router-dom";

// const PostForm = () => {
//   const [media, setMedia] = useState(null);
//   const [description, setDescription] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const navigate = useNavigate();

//   const handleMediaChange = (e) => {
//     setMedia(e.target.files[0]);
//   };

//   const handlePostSubmit = async (e) => {
//     e.preventDefault();
//     if (!description && !media) {
//       alert("Пожалуйста, добавьте описание или медиафайл!");
//       return;
//     }

//     setIsUploading(true);

//     const db = getDatabase();
//     const storage = getStorage();
//     const postsRef = ref(db, "posts");

//     let mediaUrl = null;

//     // Загрузка файла в Firebase Storage, если он есть
//     if (media) {
//       const mediaRef = storageRef(storage, `posts/${media.name}-${Date.now()}`);
//       await uploadBytes(mediaRef, media);
//       mediaUrl = await getDownloadURL(mediaRef);
//     }

//     // Сохранение поста в Firebase Realtime Database
//     const postData = {
//       description,
//       mediaUrl,
//       createdAt: new Date().toISOString(),
//     };

//     const newPostRef = push(postsRef);
//     await set(newPostRef, postData);

//     setIsUploading(false);

//     // Очистить форму
//     setMedia(null);
//     setDescription("");

//     // Перейти на главную страницу
//     navigate("/home");
//   };

//   return (
//     <div className="create-post-container">
//       <form onSubmit={handlePostSubmit} className="create-post-form">
//         <h2>Создать пост</h2>
//         <div>
//           <label>
//             Добавить изображение или видео:
//             <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
//           </label>
//         </div>
//         <div>
//           <label>
//             Описание:
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Введите описание поста"
//               rows="4"
//             />
//           </label>
//         </div>
//         <button type="submit" disabled={isUploading}>
//           {isUploading ? "Публикация..." : "Опубликовать"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PostForm;