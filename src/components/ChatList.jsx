import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref as databaseRef,
  onValue,
  set,
  get,
  push,
  remove,
} from "firebase/database";
import "../ChatWithTeacher.css";

const ChatList = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteForBoth, setDeleteForBoth] = useState(false);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // Текущий пользователь
  const navigate = useNavigate();
    const [notification, setNotification] = useState(""); // Для уведомления
    const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
  
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

  const generateUniqueChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_");
  };

  useEffect(() => {
    if (!currentUserId) return;
    const db = getDatabase();
    const userChatsRef = databaseRef(db, `users/${currentUserId}/chats`);

    onValue(userChatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedChats = Object.keys(data).map((chatRoomId) => ({
          chatRoomId,
          ...data[chatRoomId],
        }));
        setChatList(loadedChats);
      } else {
        setChatList([]);
      }
    });
  }, [currentUserId]);

  const handleClearHistory = (chatRoomId) => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
    remove(messagesRef)
      .then(() => {
        showNotification("История чата очищена");
      })
      .catch((error) => console.error("Ошибка при очистке истории:", error));
  };

  const handleDeleteChat = (chatRoomId, deleteForBoth) => {
    const db = getDatabase();
    const userChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

    remove(userChatRef)
      .then(() => {
        if (deleteForBoth) {
          const recipientId = chatList.find(chat => chat.chatRoomId === chatRoomId)?.recipientId;
          if (recipientId) {
            const recipientChatRef = databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`);
            remove(recipientChatRef);
          }
        }
        // Удаляем саму комнату чата
        remove(chatRoomRef)
          .then(() => {
            setShowDeleteModal(false);
            showNotification("Чат удален");
          })
          .catch((error) => console.error("Ошибка при удалении комнаты чата:", error));
      })
      .catch((error) => console.error("Ошибка при удалении чата:", error));
  };

  return (
    <div className="chat-list-container">
          {notification && (
            <div className={`notification ${notificationType}`}>
        {notification}
            </div>
          )} {/* Уведомление */}
      <div className="chat-list-head">
        <FaChevronLeft style={{ color: "white", fontSize: "25px" }} onClick={() => navigate(-1)} />
        <h2 style={{ marginRight: "160px" }}>Мои чаты</h2>
      </div>
      <ul className="chat-list">
        {chatList.map((chat, index) => (
          <li key={index} className="chat-list-item" onContextMenu={(e) => {
            e.preventDefault();
            setSelectedChatId(chat.chatRoomId);
          }}>
            <Link to={`/chat/${chat.chatRoomId}`} className="chat-link">
              <div className="chat-list-avatar-info">
                <img
                  src={chat.recipientAvatar || "./default-avatar.png"}
                  alt={chat.recipientName}
                  className="chat-avatar"
                />
                <div className="chat-info">
                  <h3 className="chat-name">{chat.recipientName}</h3>
                  <p className="chat-last-message">{chat.lastMessage || "Откройте чат"}</p>
                </div>
              </div>
              <span className="chat-timestamp">
                {new Date(chat.timestamp).toLocaleTimeString()}
              </span>
            </Link>
            {selectedChatId && (
  <div className="actions-modal">
    <div className="actions-modal-content">
      <button 
        className="modal-close-button"
        onClick={() => setSelectedChatId(null)}
      >
        &times;
      </button>
      <button 
        className="action-button"
        onClick={() => handleClearHistory(selectedChatId)}
      >
        Очистить историю
      </button>
      <button 
        className="action-button delete-button"
        onClick={() => setShowDeleteModal(true)}
      >
        Удалить чат
      </button>
    </div>
  </div>
)}
          </li>
        ))}
      </ul>

      {showDeleteModal && (
  <div className="delete-modal">
    <div className="delete-modal-content">
      <button 
        className="modal-close-button"
        onClick={() => setShowDeleteModal(false)}
      >
        &times;
      </button>
      <h3 className="modal-title">
        Удалить чат с {chatList.find(chat => chat.chatRoomId === selectedChatId)?.recipientName}?
      </h3>
      <p className="modal-subtitle">Это действие нельзя будет отменить</p>
      
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={deleteForBoth}
          onChange={(e) => setDeleteForBoth(e.target.checked)}
        />
        <span className="checkmark"></span>
        Также удалить для {chatList.find(chat => chat.chatRoomId === selectedChatId)?.recipientName}
      </label>

      <div className="modal-actions">
        <button 
          className="modal-button cancel-button"
          onClick={() => setShowDeleteModal(false)}
        >
          Отмена
        </button>
        <button 
          className="modal-button confirm-button"
          onClick={() => handleDeleteChat(selectedChatId, deleteForBoth)}
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ChatList;








// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaChevronLeft } from "react-icons/fa";
// import { getAuth } from "firebase/auth";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   set,
//   get,
//   push
// } from "firebase/database";
// import "../ChatWithTeacher.css";

// const ChatList = () => {
//   const [chatList, setChatList] = useState([]);
//   const auth = getAuth();
//   const currentUserId = auth.currentUser?.uid; // Текущий пользователь
//   const navigate = useNavigate();

//   const generateUniqueChatId = (userId1, userId2) => {
//     return [userId1, userId2].sort().join("_");
//   };

//   useEffect(() => {
//     if (!currentUserId) return;
//     const db = getDatabase();
//     const userChatsRef = databaseRef(db, `users/${currentUserId}/chats`);

//     onValue(userChatsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedChats = Object.keys(data).map((chatRoomId) => ({
//           chatRoomId,
//           ...data[chatRoomId],
//         }));
//         setChatList(loadedChats);
//       } else {
//         setChatList([]);
//       }
//     });
//   }, [currentUserId]);

//   const handleCreateChat = (recipientId, recipientName, recipientAvatar) => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid;
//     const chatRoomId = generateUniqueChatId(currentUserId, recipientId);
  
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
  
//     get(databaseRef(db, `users/${currentUserId}`)).then((snapshot) => {
//       const currentUserData = snapshot.val();
  
//       if (!currentUserData) {
//         console.error("Не удалось загрузить данные текущего пользователя");
//         return;
//       }
  
//       onValue(chatRoomRef, (snapshot) => {
//         if (!snapshot.exists()) {
//           const chatRoomData = {
//             participants: {
//               [currentUserId]: true,
//               [recipientId]: true,
//             },
//             createdAt: new Date().toISOString(),
//           };
  
//           const currentUserChatData = {
//             chatRoomId,
//             recipientId,
//             recipientName,
//             recipientAvatar,
//             lastMessage: "",
//             timestamp: new Date().toISOString(),
//           };
  
//           const recipientChatData = {
//             chatRoomId,
//             recipientId: currentUserId,
//             recipientName: currentUserData.username,
//             recipientAvatar: currentUserData.avatarUrl || "./default-image.png",
//             lastMessage: "",
//             timestamp: new Date().toISOString(),
//           };
  
//           Promise.all([
//             set(chatRoomRef, chatRoomData),
//             set(databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`), currentUserChatData),
//             set(databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`), recipientChatData),
//           ]).then(() => navigate(`/chat/${chatRoomId}`));
//         }
//       }, { onlyOnce: true });
//     });
//   };  

//   return (
//     <div className="chat-list-container">
//       <div className="chat-list-head">
//               <FaChevronLeft style={{ color: "white", fontSize: "25px"}} onClick={() => navigate(-1)} />
//               <h2 style={{ marginRight: "160px" }}>Мои чаты</h2>
//       </div>
//       <ul className="chat-list">
//         {chatList.map((chat, index) => (
//           <li key={index} className="chat-list-item">
//             <Link to={`/chat/${chat.chatRoomId}`} className="chat-link">
//             <div className="chat-list-avatar-info">
//             <img
//                 src={chat.recipientAvatar || "./default-avatar.png"}
//                 alt={chat.recipientName}
//                 className="chat-avatar"
//               />
//               <div className="chat-info">
//                 <h3 className="chat-name">{chat.recipientName}</h3>
//                 <p className="chat-last-message">{chat.lastMessage || "Откройте чат"}</p>
//               </div>
//             </div>
//               <span className="chat-timestamp">
//                 {new Date(chat.timestamp).toLocaleTimeString()}
//               </span>
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ChatList;