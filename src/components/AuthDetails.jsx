import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { ref as databaseRef, onValue, update, get, query, orderByChild, equalTo } from "firebase/database";
import React, { useEffect, useState, useRef } from "react";
import { auth, database, storage } from "../firebase";
import { Link } from "react-router-dom";
import { FaEllipsisV, FaTimes, FaPen, FaArrowLeft } from "react-icons/fa"; // Иконка карандаша
import { color } from "framer-motion";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [showMenu, setShowMenu] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [aboutMe, setAboutMe] = useState("Информация не указана");
  const [newAboutMe, setNewAboutMe] = useState("");
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
  const [notification, setNotification] = useState(""); // Для уведомления
  const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        setEmail(user.email);

        const userRef = databaseRef(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUsername(data.username || "User");
            setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
            setStatus(data.status || "offline");
            setLastActive(data.lastActive || "");
            setAvatarUrl(data.avatarUrl || "./default-image.png");
            setAboutMe(data.aboutMe || "Информация не указана");
          }
        });

        // Устанавливаем статус "online" при входе
        update(userRef, { status: "online" });

        // Отслеживаем активность приложения
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            // Когда вкладка не активна
            update(userRef, { 
              status: "offline", 
              lastActive: new Date().toLocaleString() 
            });
          } else {
            // Когда вкладка активна
            update(userRef, { status: "online" });
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Обновляем статус при закрытии окна
        window.addEventListener('beforeunload', () => {
          update(userRef, { 
            status: "offline", 
            lastActive: new Date().toLocaleString() 
          });
        });
      } else {
        setAuthUser(null);
        setUsername("");
        setEmail("");
        setPhoneNumber("");
        setStatus("offline");
        setLastActive("");
        setAvatarUrl("./default-image.png");
      }
    });

    return () => {
      listen();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


 // Функция для успешных уведомлений
 const showNotification = (message) => {
  setNotificationType("success");
  setNotification(message);
  setTimeout(() => {
    setNotification("");
    setNotificationType("");
  }, 3000);
};

// Функция для ошибочных уведомлений
const showNotificationError = (message) => {
  setNotificationType("error");
  setNotification(message);
  setTimeout(() => {
    setNotification("");
    setNotificationType("");
  }, 3000);
};

const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (file && authUser) {
    try {
      const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
      const snapshot = await uploadBytes(avatarStorageRef, file);
      const downloadURL = await getDownloadURL(avatarStorageRef);
      setAvatarUrl(downloadURL);
      const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
      await update(userDatabaseRef, { avatarUrl: downloadURL });
      setShowMenu(false);
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
    }
  }
};

const deleteAvatar = async () => {
  if (authUser) {
    try {
      const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
      await deleteObject(avatarStorageRef);
      const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
      await update(userDatabaseRef, { avatarUrl: "./default-image.png" });
      setAvatarUrl("./default-image.png");
      setShowMenu(false);
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
    }
  }
};

const handleUsernameChange = async () => {
  const usernameRegex = /^[a-zA-Z0-9._]+$/; // Валидация имени пользователя
  if (authUser && newUsername.trim() !== "" && usernameRegex.test(newUsername)) {
    try {
      // Проверяем, существует ли уже пользователь с таким именем
      const usersRef = query(databaseRef(database, 'users'), orderByChild('username'), equalTo(newUsername));
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        showNotificationError("Пользователь с таким именем уже существует, выберите другое имя.");
        return;
      }

      // Если имя уникально, обновляем
      const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
      await update(userDatabaseRef, { username: newUsername });
      setUsername(newUsername);
      setIsEditingUsername(false);
      showNotification(`Имя изменено на "${newUsername}"`);
    } catch (error) {
      console.error("Ошибка при изменении имени пользователя:", error);
    }
  } else {
    showNotificationError("Имя пользователя может содержать только буквы, цифры, нижнее подчеркивание и точку.");
  }
};

const handleAboutMeChange = async () => {
  if (authUser) {
    const aboutText = newAboutMe.trim() === "" ? "Информация не указана" : newAboutMe;
    try {
      const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
      await update(userDatabaseRef, { aboutMe: aboutText });
      setAboutMe(aboutText);
      setIsEditingAboutMe(false);
      showNotification(`Информация "О себе" обновлена`);
    } catch (error) {
      console.error("Ошибка при изменении информации 'О себе':", error);
    }
  }
};


  const userSignOut = () => {
    const userRef = databaseRef(database, 'users/' + authUser.uid);
    update(userRef, { 
      status: "offline", 
      lastActive: new Date().toLocaleString() 
    }).then(() => {
      signOut(auth).then(() => console.log("Successfully signed out!")).catch((e) => console.log(e));
    });
  };

  const renderStatus = () => {
    if (status === "online") {
      return <span className="status-online">в сети</span>;
    } else {
      return <span className="status-offline">был(а) в сети: {lastActive}</span>;
    }
  };

  return (
    <div className="profile-container">
      {authUser ? (
        <div className="profile-content">
          {notification && (
            <div className={`notification ${notificationType}`}>
              {notification}
            </div>
          )} {/* Уведомление */}

          <Link className="back-button" to="/about">
            <FaArrowLeft />
          </Link>

          <div className="profile-header">
            <div className="avatar-section">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar"
                onClick={() => setIsAvatarModalOpen(true)}
              />
              <label htmlFor="avatarInput" className="avatar-upload-btn">Загрузить фото</label>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="username-section">
              <h2>{username}</h2>
              <p style={{color: "lightgreen"}}>{renderStatus()}</p>
            </div>

            <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </div>

            {showMenu && (
              <div className="menu-dropdown" ref={menuRef}>
                <button onClick={() => document.getElementById('avatarInput').click()}>Добавить фото профиля</button>
                <button onClick={deleteAvatar}>Удалить фото профиля</button>
                <button onClick={() => setIsEditingUsername(true)}>Изменить имя пользователя</button>
              </div>
            )}
          </div>

          {isEditingUsername && (
            <div className="edit-username-section">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Новое имя пользователя"
              />
              <button onClick={handleUsernameChange}>Изменить</button>
              <FaTimes className="close-icon" onClick={() => setIsEditingUsername(false)} /> {/* Кнопка крестика */}
            </div>
          )}

          <div className="profile-info">
            <div className="info-section">
              <h3>Аккаунт</h3>
              <p>{phoneNumber}</p>
            </div>

            <div className="info-section osebe">
             <div>
             <h3>О себе</h3>
             <p>{aboutMe}</p>
             </div>
             <FaPen
               className="edit-icon"
               onClick={() => setIsEditingAboutMe(true)}
               style={{ marginLeft: '10px', cursor: 'pointer' }}
             />   
           </div>

           {isEditingAboutMe && (
             <div className="edit-aboutme-section">
               <div className="ci-txt">
               <textarea
                 type="text"
                 value={newAboutMe}
                 onChange={(e) => setNewAboutMe(e.target.value)}
                 placeholder="Расскажите о себе"
               />
               <FaTimes className="close-icon" onClick={() => setIsEditingAboutMe(false)} /> {/* Кнопка крестика */}
               </div>
               <button onClick={handleAboutMeChange}>Сохранить</button>
             </div>
           )}

            <div className="info-section">
              <h3>Конфиденциальность</h3>
              <p>{email}</p>
            </div>

            <div className="settings">
              <h3>Настройки</h3>
              <ul>
                <li>Конфиденциальность</li>
                <li>Уведомления и звуки</li>
                <li>Пароль</li>
                <li>Язык</li>
              </ul>
            </div>
          </div>

          <button className="signout-btn" onClick={userSignOut}>Выйти из аккаунта</button>

          {isAvatarModalOpen && (
           <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
             <div className="avatar-overlay">
               <img
                 src={avatarUrl}
                 alt="Avatar"
                 className="full-size-avatar"
                 onClick={() => setIsAvatarModalOpen(false)}
               />
             </div>
           </div>
         )}
       </div>
     ) : (
       <div className="signed-out">
         <p>Вы вышли из аккаунта</p>
         <Link className="authoutlink" to="/">Войти в аккаунт</Link>
       </div>
     )}
   </div>
  );
};

export default AuthDetails;