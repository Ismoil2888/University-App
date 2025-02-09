import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase";
import {
  getDatabase,
  ref as databaseRef,
  onValue,
  get,
  set,
  push
} from "firebase/database";
import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../UserProfile.css";
import { FiBookmark, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const navigate = useNavigate();
   const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(() => {
      // Восстанавливаем состояние из localStorage при инициализации
      const savedState = localStorage.getItem('isMenuOpen');
      return savedState ? JSON.parse(savedState) : true;
    });
  
    // Сохраняем состояние в localStorage при изменении
    useEffect(() => {
      localStorage.setItem('isMenuOpen', JSON.stringify(isMenuOpen));
    }, [isMenuOpen]);
  
    // Обработчик изменения размера окна
    useEffect(() => {
      const checkMobile = () => {
        const mobile = window.innerWidth < 700;
        setIsMobile(mobile);
        if (mobile) {
          setIsMenuOpen(false);
        } else {
          // Восстанавливаем состояние только для десктопа
          const savedState = localStorage.getItem('isMenuOpen');
          setIsMenuOpen(savedState ? JSON.parse(savedState) : true);
        }
      };
  
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
  
    // Модифицированная функция переключения меню
    const toggleMenuDesktop = () => {
      setIsMenuOpen(prev => {
        const newState = !prev;
        localStorage.setItem('isMenuOpen', JSON.stringify(newState));
        return newState;
      });
    };

  useEffect(() => {
    const db = getDatabase();

    // Получаем данные пользователя
    const userRef = databaseRef(db, `users/${userId}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData(data);
        setStatus(data.status || "offline");
        setLastActive(data.lastActive || "");
        setAvatarUrl(data.avatarUrl || "./default-image.png");
      }
    });
  }, [userId]);

  const renderStatus = () => {
    return status === "online" ? (
      <span className="up-status-online">в сети</span>
    ) : (
      <span className="up-status-offline">был(а) в сети: {lastActive}</span>
    );
  };

  const handleCreateChat = () => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    const chatRoomId = generateUniqueChatId(currentUserId, userId); // userId — ID собеседника
  
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
    const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
    const recipientChatRef = databaseRef(db, `users/${userId}/chats/${chatRoomId}`);
  
    get(databaseRef(db, `users/${currentUserId}`)).then((snapshot) => {
      const currentUserData = snapshot.val();
  
      if (!currentUserData) {
        console.error("Не удалось загрузить данные текущего пользователя");
        return;
      }
  
      get(chatRoomRef).then((snapshot) => {
        if (snapshot.exists()) {
          // Если чат уже существует, просто переходим в него
          navigate(`/chat/${chatRoomId}`);
        } else {
          // Создаем новый чат
          const chatRoomData = {
            participants: {
              [currentUserId]: true,
              [userId]: true,
            },
            createdAt: new Date().toISOString(),
          };
  
          const currentUserChatData = {
            chatRoomId,
            recipientId: userId,
            recipientName: userData.username, // Имя получателя
            recipientAvatar: userData.avatarUrl || "./default-image.png",
            lastMessage: "",
            timestamp: new Date().toISOString(),
          };
  
          const recipientChatData = {
            chatRoomId,
            recipientId: currentUserId,
            recipientName: currentUserData.username, // Имя текущего пользователя
            recipientAvatar: currentUserData.avatarUrl || "./default-image.png",
            lastMessage: "",
            timestamp: new Date().toISOString(),
          };
  
          Promise.all([
            set(chatRoomRef, chatRoomData),
            set(currentUserChatRef, currentUserChatData),
            set(recipientChatRef, recipientChatData),
          ])
            .then(() => navigate(`/chat/${chatRoomId}`))
            .catch((error) => console.error("Ошибка при создании чата:", error));
        }
      });
    });
  };
  
  // Генерация уникального ID чата
  const generateUniqueChatId = (id1, id2) => {
    const sortedIds = [id1, id2].sort(); // Сортировка ID для уникальности
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };  

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="glava">
            <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <img style={{ width: "50px", height: "45px" }} src={ttulogo} alt="" />
          {isMenuOpen ? (
            <>
              <h2>TTU</h2>
              <FiChevronLeft
                className="toggle-menu"
                onClick={toggleMenuDesktop}
              />
            </>
          ) : (
            <FiChevronRight
              className="toggle-menu"
              onClick={toggleMenuDesktop}
            />
          )}
        </div>

        <nav className="menu-items">
          <Link to="/" className="menu-item">
            <FiBookmark className="menu-icon" />
            {isMenuOpen && <span>Новости</span>}
          </Link>
          <Link to="/searchpage" className="menu-item">
            <FiSearch className="menu-icon" />
            {isMenuOpen && <span>Поиск</span>}
          </Link>
          <Link to="/teachers" className="menu-item">
            <FiUserCheck className="menu-icon" />
            {isMenuOpen && <span>Преподаватели</span>}
          </Link>
          <Link to="/library" className="menu-item">
            <FiBookOpen className="menu-icon" style={{ borderBottom: "1px solid rgb(200, 255, 0)", borderRadius: "15px", padding: "5px" }} />
            {isMenuOpen && <span>Библиотека</span>}
          </Link>
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" />
            {isMenuOpen && <span>Профиль</span>}
          </Link>
          <Link to="/chats" className="menu-item">
            <FiMessageSquare className="menu-icon" />
            {isMenuOpen && <span>Сообщения</span>}
          </Link>
          <Link to="/notifications" className="menu-item">
            <FiBell className="menu-icon" />
            {isMenuOpen && <span>Уведомления</span>}
          </Link>
          <Link to="/authdetails" className="menu-item">
            <FiSettings className="menu-icon" />
            {isMenuOpen && <span>Настройки</span>}
          </Link>
        </nav>

        <div className="logo-and-tik">
          <img
            src={basiclogo}
            alt="logo"
            className="tiklogo"
          />
          {isMenuOpen && (
            <span style={{ fontSize: "35px", fontWeight: "bold", color: "#9daddf" }}>TIK</span>
          )}
        </div>
      </div>
    <div className="up-profile-container">
      <div className="up-profile-header">
        <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px" }}>
          <img
            src={userData.avatarUrl || "./default-image.png"}
            alt={userData.username}
            className="up-user-avatar skeleton-media-avatars"
            onClick={() => setIsAvatarModalOpen(true)}
          />
          <div>
            <h2 className="username">{userData.username}</h2>
            {renderStatus()}
          </div>
        </div>
        <FaEllipsisV className="up-menu-icon" />
      </div>

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

      <div className="up-info-card">
        <div className="up-info-title">
          <FaPhone className="up-info-icon" />
          Номер телефона
        </div>
        <div className="up-info-content">{userData.phoneNumber || "Не указан"}</div>
      </div>

      <div className="up-info-card">
        <div className="up-info-title">
          <FaUserEdit className="up-info-icon" />
          О себе
        </div>
        <div className="info-content">{userData.aboutMe || "Нет информации"}</div>
      </div>

      <div className="up-info-card">
        <div className="up-info-title">
          <FaLock
            className={`up-info-icon ${
              identificationStatus === "идентифицирован" ? "up-icon-verified" : "up-icon-unverified"
            }`}
          />
          Идентификация
        </div>
        <div
          className={`up-info-content ${
            identificationStatus === "идентифицирован" ? "up-status-verified" : "up-status-unverified"
          }`}
        >
          {identificationStatus}
        </div>
      </div>

      <button className="up-chat-button" onClick={handleCreateChat}>
        Написать
      </button>
      
    </div>
    </div>
  );
};

export default UserProfile;










//new original
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { auth } from "../firebase";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   get,
//   set,
//   push
// } from "firebase/database";
// import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import "../UserProfile.css";

// const UserProfile = () => {
//   const { userId } = useParams();
//   const [userData, setUserData] = useState(null);
//   const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const db = getDatabase();

//     // Получаем данные пользователя
//     const userRef = databaseRef(db, `users/${userId}`);
//     onValue(userRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setUserData(data);
//         setStatus(data.status || "offline");
//         setLastActive(data.lastActive || "");
//         setAvatarUrl(data.avatarUrl || "./default-image.png");
//       }
//     });
//   }, [userId]);

//   const renderStatus = () => {
//     return status === "online" ? (
//       <span className="up-status-online">в сети</span>
//     ) : (
//       <span className="up-status-offline">был(а) в сети: {lastActive}</span>
//     );
//   };
  
//   const handleCreateChat = () => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid; // ID текущего пользователя
//     const uniqueChatId = generateUniqueChatId(currentUserId, userId); // Генерация уникального ID чата
  
//     const chatRoomRef = databaseRef(db, `chatRooms/${uniqueChatId}`);
//     const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${uniqueChatId}`);
//     const recipientChatRef = databaseRef(db, `users/${userId}/chats/${uniqueChatId}`);
  
//     // Проверяем, существует ли уже комната
//     get(chatRoomRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         // Если чат уже существует, перенаправляем
//         navigate(`/chat/${uniqueChatId}`);
//       } else {
//         // Если чата нет, создаем его
//         const chatRoomData = {
//           participants: {
//             [currentUserId]: true,
//             [userId]: true,
//           },
//           createdAt: new Date().toISOString(),
//         };
  
//         const currentUserChatData = {
//           chatRoomId: uniqueChatId,
//           recipientId: userId,
//           recipientName: userData.username,
//           recipientAvatar: userData.avatarUrl || "./default-image.png",
//           lastMessage: "",
//           timestamp: new Date().toISOString(),
//         };
  
//         const recipientChatData = {
//           chatRoomId: uniqueChatId,
//           recipientId: currentUserId,
//           recipientName: auth.currentUser.displayName,
//           recipientAvatar: auth.currentUser.photoURL,
//           lastMessage: "",
//           timestamp: new Date().toISOString(),
//         };
  
//         Promise.all([
//           set(chatRoomRef, chatRoomData),
//           set(currentUserChatRef, currentUserChatData),
//           set(recipientChatRef, recipientChatData),
//         ])
//           .then(() => {
//             navigate(`/chat/${uniqueChatId}`);
//           })
//           .catch((error) => console.error("Ошибка при создании чата:", error));
//       }
//     });
//   };
  
//   // Генерация уникального ID чата
//   const generateUniqueChatId = (id1, id2) => {
//     const sortedIds = [id1, id2].sort(); // Сортировка ID для уникальности
//     return `${sortedIds[0]}_${sortedIds[1]}`;
//   };  

//   if (!userData) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div className="up-profile-container">
//       <div className="up-profile-header">
//         <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px" }}>
//           <img
//             src={userData.avatarUrl || "./default-image.png"}
//             alt={userData.username}
//             className="up-user-avatar"
//             onClick={() => setIsAvatarModalOpen(true)}
//           />
//           <div>
//             <h2 className="username">{userData.username}</h2>
//             {renderStatus()}
//           </div>
//         </div>
//         <FaEllipsisV className="up-menu-icon" />
//       </div>

//       {isAvatarModalOpen && (
//         <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
//           <div className="avatar-overlay">
//             <img
//               src={avatarUrl}
//               alt="Avatar"
//               className="full-size-avatar"
//               onClick={() => setIsAvatarModalOpen(false)}
//             />
//           </div>
//         </div>
//       )}

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaPhone className="up-info-icon" />
//           Номер телефона
//         </div>
//         <div className="up-info-content">{userData.phoneNumber || "Не указан"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaUserEdit className="up-info-icon" />
//           О себе
//         </div>
//         <div className="info-content">{userData.aboutMe || "Нет информации"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaLock
//             className={`up-info-icon ${
//               identificationStatus === "идентифицирован" ? "up-icon-verified" : "up-icon-unverified"
//             }`}
//           />
//           Идентификация
//         </div>
//         <div
//           className={`up-info-content ${
//             identificationStatus === "идентифицирован" ? "up-status-verified" : "up-status-unverified"
//           }`}
//         >
//           {identificationStatus}
//         </div>
//       </div>

//       <button className="up-chat-button" onClick={handleCreateChat}>
//         Написать
//       </button>

      
//     </div>
//   );
// };

// export default UserProfile;

















// оригинал
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { getDatabase, ref as databaseRef, onValue, query, orderByChild, equalTo } from "firebase/database";
// import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import "../UserProfile.css";

// const UserProfile = () => {
//   const { userId } = useParams();
//   const [userData, setUserData] = useState(null);
//   const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const db = getDatabase();

//     // Получаем данные пользователя
//     const userRef = databaseRef(db, `users/${userId}`);
//     onValue(userRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setUserData(data);
//         setStatus(data.status || "offline");
//         setLastActive(data.lastActive || "");
//         setAvatarUrl(data.avatarUrl || "./default-image.png");
//       }
//     });

//     // Получаем статус идентификации пользователя
//     const requestRef = query(
//       databaseRef(db, "requests"),
//       orderByChild("email"),
//       equalTo(userData?.email || "")
//     );
//     onValue(requestRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const requestData = Object.values(snapshot.val())[0];
//         setIdentificationStatus(
//           requestData.status === "accepted" ? "идентифицирован" : "не идентифицирован"
//         );
//       } else {
//         setIdentificationStatus("не идентифицирован");
//       }
//     });
//   }, [userId, userData?.email]);

//   if (!userData) {
//     return <p>Loading...</p>;
//   }

//   const renderStatus = () => {
//     return status === "online" ? (
//       <span className="up-status-online">в сети</span>
//     ) : (
//       <span className="up-status-offline">был(а) в сети: {lastActive}</span>
//     );
//   };

//   const handleContextMenu = (event) => {
//     event.preventDefault();
//   }

//   return (
//     <div className="up-profile-container" onContextMenu={handleContextMenu}>
//       <div className="up-profile-header">
//         <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
//           <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px"}}>
//         <img
//           src={userData.avatarUrl || "./default-image.png"}
//           alt={userData.username}
//           className="up-user-avatar"
//           onClick={() => setIsAvatarModalOpen(true)}
//         />
//         <div>
//         <h2 className="username">{userData.username}</h2>
//         {renderStatus()}
//         </div>
//         </div>
//         <FaEllipsisV className="up-menu-icon" />
//       </div>

//       {isAvatarModalOpen && (
//            <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
//              <div className="avatar-overlay">
//                <img
//                  src={avatarUrl}
//                  alt="Avatar"
//                  className="full-size-avatar"
//                  onClick={() => setIsAvatarModalOpen(false)}
//                />
//              </div>
//            </div>
//          )}

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaPhone className="up-info-icon" />
//           Номер телефона
//         </div>
//         <div className="up-info-content">{userData.phoneNumber || "Не указан"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaUserEdit className="up-info-icon" />
//           О себе
//         </div>
//         <div className="info-content">{userData.aboutMe || "Нет информации"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaLock className={`up-info-icon ${identificationStatus === "идентифицирован" ? "up-icon-verified" : "up-icon-unverified"}`} />
//           Идентификация
//         </div>
//         <div className={`up-info-content ${identificationStatus === "идентифицирован" ? "up-status-verified" : "up-status-unverified"}`}>
//           {identificationStatus}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;