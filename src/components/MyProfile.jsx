import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as databaseRef, onValue, update, query, orderByChild, equalTo } from "firebase/database";
import React, { useEffect, useState, useRef } from "react";
import { auth, database } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FaEllipsisV, FaArrowLeft, FaLock, FaRegAddressBook, FaUser } from "react-icons/fa";
import { FcAbout } from "react-icons/fc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import { RiSettingsLine } from "react-icons/ri";
import "../MyProfile.css";
import "../App.css";

const MyProfile = () => {
  const [authUser, setAuthUser] = useState(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [showMenu, setShowMenu] = useState(false);
  const [aboutMe, setAboutMe] = useState("Информация не указана");
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
  const menuRef = useRef(null);
  const [userUid, setUserUid] = useState(null);
  const navigate = useNavigate();

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setShowMenu(false);
    }
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

      } else {
        navigate("/"); // Перенаправляем на страницу входа, если пользователь не аутентифицирован
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);

        const userRef = databaseRef(database, "users/" + user.uid);
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

        const requestRef = query(
          databaseRef(database, "requests"),
          orderByChild("email"),
          equalTo(user.email)
        );
        onValue(requestRef, (snapshot) => {
          if (snapshot.exists()) {
            const requestData = Object.values(snapshot.val())[0];
            setIdentificationStatus(
              requestData.status === "accepted" ? "идентифицирован" : "не идентифицирован"
            );
          } else {
            setIdentificationStatus("не идентифицирован");
          }
        });

        update(userRef, { status: "online" });

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            update(userRef, {
              status: "offline",
              lastActive: new Date().toLocaleString(),
            });
          } else {
            update(userRef, { status: "online" });
          }
        });

        window.addEventListener("beforeunload", () => {
          update(userRef, {
            status: "offline",
            lastActive: new Date().toLocaleString(),
          });
        });
      } else {
        setAuthUser(null);
        setUsername("");
        setPhoneNumber("");
        setStatus("offline");
        setAvatarUrl("./default-image.png");
      }
    });

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

  const renderStatus = () => {
    if (status === "online") {
      return <span className="status-online">в сети</span>;
    } else {
      return <span className="status-offline">был(а) в сети: {lastActive}</span>;
    }
  };

  return (
    <div className="my-profile-container" onContextMenu={handleContextMenu}>

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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Профиль</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
          </ul>
        </nav>

<div className="header-nav-2">

       <Link to="/authdetails">
        <RiSettingsLine style={{color: "green", fontSize: "25px", marginLeft: "15px"}} />
       </Link>

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Профиль</ul>

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

      </div>
      </header>

      {authUser ? (
        <div className="my-profile-content">
          {notification && (
            <div className={`notification ${notificationType}`}>{notification}</div>
          )}

          <div className="my-profile-header">
            <Link className="back-button" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </Link>

            <div className="avatar-section">
              <img 
                src={avatarUrl} 
                alt="Avatar" className="avatar" 
                onClick={() => setIsAvatarModalOpen(true)}
              />
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

            <div className="username-section">
              <h2>{username}</h2>
              <p style={{ color: "lightgreen" }}>{renderStatus()}</p>
            </div>

            <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </div>

            {showMenu && (
              <div className="menu-dropdown" ref={menuRef}>
                <Link to="/authdetails">
                  <button>Редактировать профиль</button>
                </Link>
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="info-section account">
              <div>
                <h3>Номер телефона</h3>
                <p>{phoneNumber}</p>
              </div>
              <FaRegAddressBook 
              style={{ fontSize: "22px" }} 
              />
            </div>

            <div className="info-section osebe">
              <div>
                <h3>О себе</h3>
                <p>{aboutMe}</p>
              </div>
              <FcAbout 
              className="edit-icon-auth" 
              style={{ fontSize: "25px", cursor: "pointer" }} 
              />
            </div>

            <div className="info-section">
              <div className="ident-block-basic">
                <div className="ident-block1">
                  <h3>Идентификация</h3>
                  <p>{identificationStatus}</p>
                </div>
                <div className="ident-block2">
                  <FaLock
                    style={{
                      color: identificationStatus === "идентифицирован" ? "#0AFFFF" : "red",
                      fontSize: "20px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="footer-nav">
            <Link to="/home">
              <FontAwesomeIcon icon={faHome} className="footer-icon" />
            </Link>
            <Link to="/searchpage">
              <FontAwesomeIcon icon={faSearch} className="footer-icon" />
            </Link>
            <Link to="/library">
              <FontAwesomeIcon icon={faBook} className="footer-icon" />
            </Link>
            <Link to="/myprofile">
              <img
                src={userAvatarUrl}
                alt="User Avatar"
                className="footer-avatar"
              />
            </Link>
          </div>
        </div>
      ) : (
        <h2 className="signed-out-h2" data-text="T I K">
          T I K
        </h2>
      )}
    </div>
  );
};

export default MyProfile;








// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { getDatabase, ref as databaseRef, onValue, query, orderByChild, equalTo } from "firebase/database";
// import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// // import "../UserProfile.css";

// const MyProfile = () => {
//   const { userId } = useParams();
//   const [userData, setUserData] = useState(null);
//   const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [showMenu, setShowMenu] = useState(false);
//   const menuRef = useRef(null);
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


 
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);


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

//   return (
//     <div className="up-profile-container">
//       <div className="up-profile-header">
//         <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
//           <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px"}}>
//         <img
//           src={userData.avatarUrl || "./default-image.png"}
//           alt={userData.username}
//           className="up-user-avatar"
//         />
//         <div>
//         <h2 className="username">{userData.username}</h2>
//         {renderStatus()}
//         </div>
//         </div>
//         <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
//               <FaEllipsisV />
//         </div>
//      </div>

//       {showMenu && (
//               <div className="menu-dropdown" ref={menuRef}>
//                 <button>Добавить фото профиля</button>
//               </div>
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

// export default MyProfile;