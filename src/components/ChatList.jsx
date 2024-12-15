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
  push
} from "firebase/database";
import "../ChatWithTeacher.css";

const ChatList = () => {
  const [chatList, setChatList] = useState([]);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // Текущий пользователь
  const navigate = useNavigate();

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

  const handleCreateChat = (recipientId, recipientName, recipientAvatar) => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    const chatRoomId = generateUniqueChatId(currentUserId, recipientId);
  
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
  
    get(databaseRef(db, `users/${currentUserId}`)).then((snapshot) => {
      const currentUserData = snapshot.val();
  
      if (!currentUserData) {
        console.error("Не удалось загрузить данные текущего пользователя");
        return;
      }
  
      onValue(chatRoomRef, (snapshot) => {
        if (!snapshot.exists()) {
          const chatRoomData = {
            participants: {
              [currentUserId]: true,
              [recipientId]: true,
            },
            createdAt: new Date().toISOString(),
          };
  
          const currentUserChatData = {
            chatRoomId,
            recipientId,
            recipientName,
            recipientAvatar,
            lastMessage: "",
            timestamp: new Date().toISOString(),
          };
  
          const recipientChatData = {
            chatRoomId,
            recipientId: currentUserId,
            recipientName: currentUserData.username,
            recipientAvatar: currentUserData.avatarUrl || "./default-image.png",
            lastMessage: "",
            timestamp: new Date().toISOString(),
          };
  
          Promise.all([
            set(chatRoomRef, chatRoomData),
            set(databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`), currentUserChatData),
            set(databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`), recipientChatData),
          ]).then(() => navigate(`/chat/${chatRoomId}`));
        }
      }, { onlyOnce: true });
    });
  };  

  return (
    <div className="chat-list-container">
      <div className="chat-list-head">
              <FaChevronLeft style={{ color: "white", fontSize: "25px"}} onClick={() => navigate(-1)} />
              <h2 style={{ marginRight: "160px" }}>Мои чаты</h2>
      </div>
      <ul className="chat-list">
        {chatList.map((chat, index) => (
          <li key={index} className="chat-list-item">
            <Link to={`/chat/${chat.chatRoomId}`} className="chat-link">
              <img
                src={chat.recipientAvatar || "./default-avatar.png"}
                alt={chat.recipientName}
                className="chat-avatar"
              />
              <div className="chat-info">
                <h3 className="chat-name">{chat.recipientName}</h3>
                <p className="chat-last-message">{chat.lastMessage || "Откройте чат"}</p>
              </div>
              <span className="chat-timestamp">
                {new Date(chat.timestamp).toLocaleTimeString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;















//new original
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaChevronLeft } from "react-icons/fa";
// import { getAuth } from "firebase/auth";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   set,
//   push
// } from "firebase/database";
// import "../ChatWithTeacher.css";

// const ChatList = () => {
//   const [chatList, setChatList] = useState([]);
//   const auth = getAuth();
//   const currentUserId = auth.currentUser?.uid; // Текущий пользователь
//   const navigate = useNavigate();

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
//     const chatRoomId = `${currentUserId}_${recipientId}`;
  
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
  
//     onValue(chatRoomRef, (snapshot) => {
//       if (!snapshot.exists()) {
//         const chatRoomData = {
//           participants: {
//             [currentUserId]: true,
//             [recipientId]: true,
//           },
//           createdAt: new Date().toISOString(),
//         };
  
//         const currentUserChatData = {
//           chatRoomId,
//           recipientId,
//           recipientName,
//           recipientAvatar,
//           lastMessage: "",
//           timestamp: new Date().toISOString(),
//         };
  
//         const recipientChatData = {
//           chatRoomId,
//           recipientId: currentUserId,
//           recipientName: auth.currentUser.displayName, // Имя текущего пользователя
//           recipientAvatar: auth.currentUser.photoURL, // Аватар текущего пользователя
//           lastMessage: "",
//           timestamp: new Date().toISOString(),
//         };
  
//         // Обновляем данные для обоих участников
//         Promise.all([
//           set(chatRoomRef, chatRoomData),
//           set(databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`), currentUserChatData),
//           set(databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`), recipientChatData),
//         ]).then(() => navigate(`/chat/${chatRoomId}`));
//       }
//     }, { onlyOnce: true });
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
//               <img
//                 src={chat.recipientAvatar || "./default-avatar.png"}
//                 alt={chat.recipientName}
//                 className="chat-avatar"
//               />
//               <div className="chat-info">
//                 <h3 className="chat-name">{chat.recipientName}</h3>
//                 <p className="chat-last-message">{chat.lastMessage || "Нет сообщений"}</p>
//               </div>
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








//original
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { getAuth } from "firebase/auth";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   set,
//   push
// } from "firebase/database";
// import "../ChatWithTeacher.css";

// const ChatList = () => {
//   const [chatList, setChatList] = useState([]);
//   const auth = getAuth();
//   const currentUserId = auth.currentUser?.uid; // Текущий пользователь
//   const navigate = useNavigate();

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
//     const chatRoomId = `${currentUserId}_${recipientId}`;
  
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
  
//     onValue(chatRoomRef, (snapshot) => {
//       if (!snapshot.exists()) {
//         const chatRoomData = {
//           participants: {
//             [currentUserId]: true,
//             [recipientId]: true,
//           },
//           createdAt: new Date().toISOString(),
//         };
  
//         const currentUserChatData = {
//           chatRoomId,
//           recipientId,
//           recipientName,
//           recipientAvatar,
//           lastMessage: "",
//           timestamp: new Date().toISOString(),
//         };
  
//         const recipientChatData = {
//           chatRoomId,
//           recipientId: currentUserId,
//           recipientName: auth.currentUser.displayName, // Имя текущего пользователя
//           recipientAvatar: auth.currentUser.photoURL, // Аватар текущего пользователя
//           lastMessage: "",
//           timestamp: new Date().toISOString(),
//         };
  
//         // Обновляем данные для обоих участников
//         Promise.all([
//           set(chatRoomRef, chatRoomData),
//           set(databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`), currentUserChatData),
//           set(databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`), recipientChatData),
//         ]).then(() => navigate(`/chat/${chatRoomId}`));
//       }
//     }, { onlyOnce: true });
//   };  

//   return (
//     <div className="chat-list-container">
//       <h2>Мои чаты</h2>
//       <ul className="chat-list">
//         {chatList.map((chat, index) => (
//           <li key={index} className="chat-list-item">
//             <Link to={`/chat/${chat.chatRoomId}`} className="chat-link">
//               <img
//                 src={chat.recipientAvatar || "./default-avatar.png"}
//                 alt={chat.recipientName}
//                 className="chat-avatar"
//               />
//               <div className="chat-info">
//                 <h3 className="chat-name">{chat.recipientName}</h3>
//                 <p className="chat-last-message">{chat.lastMessage || "Нет сообщений"}</p>
//               </div>
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