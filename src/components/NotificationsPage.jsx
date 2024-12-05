import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, remove, update } from "firebase/database";
import { auth } from "../firebase";
import defaultAvatar from "../default-image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaArrowLeft } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";
import "../NotificationsPage.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUserId = auth.currentUser?.uid;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = auth.currentUser?.uid; // Текущий пользователь

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const toggleMenuu = () => {
    if (isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 0);
    } else {
      setIsMenuOpen(true);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    const db = getDatabase();
    const notificationsRef = dbRef(db, `notifications/${currentUserId}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const notificationsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        setNotifications(
          notificationsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        );
      } else {
        setNotifications([]); // Если данных нет, очищаем состояние
      }
    });

    return () => unsubscribe(); // Убираем слушатель при размонтировании компонента
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
  
    const db = getDatabase();
    const notificationsRef = dbRef(db, `notifications/${currentUserId}`);
  
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedNotifications = {};
        for (const key in data) {
          updatedNotifications[key] = {
            ...data[key],
            isRead: true,
          };
        }
  
        // Обновляем уведомления в базе данных
        update(notificationsRef, updatedNotifications).catch((error) => {
          console.error("Ошибка при обновлении статуса уведомлений:", error);
        });
      }
    });
  
    // Сбрасываем локальный счетчик непрочитанных уведомлений
    setUnreadCount(0);
  }, [currentUserId]);  

  const handleDeleteNotification = (notificationId) => {
    if (!currentUserId || !notificationId) return;

    const db = getDatabase();
    const notificationRef = dbRef(db, `notifications/${currentUserId}/${notificationId}`);
    remove(notificationRef)
      .then(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      })
      .catch((error) => {
        console.error("Ошибка при удалении уведомления:", error);
      });
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  }

  return (
    <div className="notifications-page" onContextMenu={handleContextMenu}>
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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Уведомления</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              {/* <FaUser className="user-icon"></FaUser> */}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-nav-2">

          <Link className="back-button" style={{marginLeft: "15px"}} onClick={() => navigate(-1)}>
              <FaArrowLeft />
          </Link>

          <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Уведомления</ul>

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

      <main className="notifications-content">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="notification-card">
              <img
                src={notification.avatarUrl || defaultAvatar}
                alt="Sender Avatar"
                className="notification-avatar"
                onClick={() => goToProfile(notification.userId)}
              />
              <div className="notification-info">
                <p className="notification-text">
                  {notification.type === 'comment' ? (
                    <>
                      Пользователь <strong onClick={() => goToProfile(notification.userId)}>{notification.username}</strong> написал под
                      вашим постом комментарий: "{notification.comment}"
                    </>
                  ) : notification.type === 'like' ? (
                    <>
                      Пользователю <strong onClick={() => goToProfile(notification.userId)}>{notification.username}</strong> понравилась ваша публикация
                    </>
                  ) : null}
                </p>
                <p className="notification-time">
                  {notification.timestamp}
                </p>
              </div>
              <button
                className="delete-notification-button"
                onClick={() => handleDeleteNotification(notification.id)}
              >
                ✖
              </button>
            </div>
          ))
        ) : (
          <p className="no-notifications">У вас пока нет уведомлений.</p>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;