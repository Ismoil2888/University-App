import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import {
  getDatabase,
  ref as databaseRef,
  onValue,
  push,
  set,
  get,
} from "firebase/database";
import "../ChatWithTeacher.css";

const Chat = () => {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUserId = "CURRENT_USER_ID"; // ID текущего пользователя
  const [currentUserData, setCurrentUserData] = useState({});
  const [recipientData, setRecipientData] = useState({});
  const navigate = useNavigate();
  const [recipientId, setRecipientId] = useState("");

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
    
    // Получение данных текущего пользователя
    const currentUserRef = databaseRef(db, `users/${currentUserId}`);
    get(currentUserRef).then((snapshot) => {
      if (snapshot.exists()) {
        setCurrentUserData(snapshot.val());
      }
    });

    // Получение данных участников чата
    onValue(chatRoomRef, (snapshot) => {
      const chatData = snapshot.val();
      if (chatData) {
        const otherParticipantId = Object.keys(chatData.participants).find(
          (id) => id !== currentUserId
        );
        setRecipientId(otherParticipantId);

        // Получаем данные получателя
        const recipientRef = databaseRef(db, `users/${otherParticipantId}`);
        onValue(recipientRef, (snapshot) => {
          setRecipientData(snapshot.val());
        });
      }
    });

    // Получение сообщений с данными отправителя
    onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = await Promise.all(
          Object.entries(data).map(async ([key, message]) => {
            const senderRef = databaseRef(db, `users/${message.senderId}`);
            const senderSnapshot = await get(senderRef);
            const senderData = senderSnapshot.val();
        
            return {
              ...message,
              senderName: senderData?.username || "Неизвестный пользователь",
              senderAvatar: senderData?.avatarUrl || "./default-avatar.png",
            };
          })
        );        
        setMessages(messagesArray);
      }
    });
  }, [chatRoomId, currentUserId]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);

    const messageData = {
      senderId: currentUserId,
      senderName: currentUserData.username || "Вы",
      senderAvatar: currentUserData.avatarUrl || "./default-avatar.png",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Обновляем последнее сообщение в списках чатов обоих пользователей
    const updateChatList = () => {
      const chatUpdates = {};
      chatUpdates[`users/${currentUserId}/chats/${chatRoomId}/lastMessage`] = newMessage;
      chatUpdates[`users/${currentUserId}/chats/${chatRoomId}/timestamp`] = messageData.timestamp;
      chatUpdates[`users/${recipientId}/chats/${chatRoomId}/lastMessage`] = newMessage;
      chatUpdates[`users/${recipientId}/chats/${chatRoomId}/timestamp`] = messageData.timestamp;

      return set(databaseRef(db), chatUpdates);
    };

    // Отправляем сообщение и обновляем список чатов
    push(messagesRef, messageData)
      .then(() => updateChatList())
      .then(() => setNewMessage(""))
      .catch((error) => console.error("Ошибка при отправке сообщения:", error));
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <FaChevronLeft
          style={{ marginLeft: "10px", color: "white", fontSize: "25px" }}
          onClick={() => navigate(-1)}
        />
        <img
          src={recipientData.avatarUrl || "./default-avatar.png"}
          alt={recipientData.username || "Собеседник"}
          className="chat-header-avatar"
          style={{width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover"}}
        />
        <h2>{recipientData.username || "Чат"}</h2>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
         <div
         key={index}
         className={`chat-message ${
           message.senderId === currentUserId
             ? "chat-message-sent"
             : "chat-message-received"
         }`}
       >
         <img
           src={message.senderAvatar || "./default-avatar.png"}
           alt={message.senderName}
           className="chat-message-avatar"
           style={{
             width: "30px",
             height: "30px",
             borderRadius: "50%",
             marginRight: "10px",
           }}
         />
         <div>
           <p className="chat-message-sender">{message.senderName}</p>
           <p className="chat-message-text">{message.text}</p>
           <span className="chat-message-timestamp">
             {new Date(message.timestamp).toLocaleTimeString()}
           </span>
         </div>
       </div>       
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="chat-input-field"
        />
        <button onClick={handleSendMessage} className="chat-send-button">
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;














//new original
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import { FaChevronLeft } from "react-icons/fa";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   push,
//   set,
//   get,
// } from "firebase/database";
// import "../ChatWithTeacher.css";

// const Chat = () => {
//   const { chatRoomId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const currentUserId = "CURRENT_USER_ID"; // ID текущего пользователя
//   const [currentUserData, setCurrentUserData] = useState({});
//   const [recipientData, setRecipientData] = useState({});
//   const navigate = useNavigate();
//   const [recipientId, setRecipientId] = useState("");

//   useEffect(() => {
//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
  
//     // Получение данных участников чата
//     onValue(chatRoomRef, (snapshot) => {
//       const chatData = snapshot.val();
//       if (chatData) {
//         const otherParticipantId = Object.keys(chatData.participants).find(
//           (id) => id !== currentUserId
//         );
//         setRecipientId(otherParticipantId);
  
//         const recipientRef = databaseRef(db, `users/${otherParticipantId}`);
//         onValue(recipientRef, (snapshot) => {
//           setRecipientData(snapshot.val());
//         });
//       }
//     });
  
//     // Получение сообщений
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setMessages(Object.values(data));
//       }
//     });
//   }, [chatRoomId, currentUserId]);  

//   const handleSendMessage = () => {
//     if (newMessage.trim() === "") return;
  
//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
  
//     const messageData = {
//       senderId: currentUserId,
//       text: newMessage,
//       timestamp: new Date().toISOString(),
//     };
  
//     // Обновляем последнее сообщение в списках чатов обоих пользователей
//     const updateChatList = () => {
//       const chatUpdates = {};
//       chatUpdates[`users/${currentUserId}/chats/${chatRoomId}/lastMessage`] = newMessage;
//       chatUpdates[`users/${currentUserId}/chats/${chatRoomId}/timestamp`] = messageData.timestamp;
//       chatUpdates[`users/${recipientId}/chats/${chatRoomId}/lastMessage`] = newMessage;
//       chatUpdates[`users/${recipientId}/chats/${chatRoomId}/timestamp`] = messageData.timestamp;
  
//       return set(databaseRef(db), chatUpdates);
//     };
  
//     // Отправляем сообщение и обновляем список чатов
//     push(messagesRef, messageData)
//       .then(() => updateChatList())
//       .then(() => setNewMessage(""))
//       .catch((error) => console.error("Ошибка при отправке сообщения:", error));
//   };  
  

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//       <FaChevronLeft style={{ marginLeft: "10px", color: "white", fontSize: "25px"}} onClick={() => navigate(-1)} />
//         <h2>{recipientData.username || "Чат"}</h2>
//       </div>

//       <div className="chat-messages">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`chat-message ${
//               message.senderId === currentUserId
//                 ? "chat-message-sent"
//                 : "chat-message-received"
//             }`}
//           >
//             <img
//               src={message.senderAvatar || "./default-avatar.png"}
//               alt={message.senderName}
//               className="chat-message-avatar"
//             />
//             <div>
//               <p className="chat-message-sender">{message.senderName}</p>
//               <p className="chat-message-text">{message.text}</p>
//               <span className="chat-message-timestamp">
//                 {new Date(message.timestamp).toLocaleTimeString()}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Введите сообщение..."
//           className="chat-input-field"
//         />
//         <button onClick={handleSendMessage} className="chat-send-button">
//           Отправить
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;






//original
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   push,
//   set,
//   get,
// } from "firebase/database";
// import "../ChatWithTeacher.css";

// const Chat = () => {
//   const { chatRoomId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const currentUserId = "CURRENT_USER_ID"; // ID текущего пользователя
//   const [currentUserData, setCurrentUserData] = useState({});
//   const [recipientData, setRecipientData] = useState({});

//   const [recipientId, setRecipientId] = useState("");

//   useEffect(() => {
//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
  
//     // Получение данных участников чата
//     onValue(chatRoomRef, (snapshot) => {
//       const chatData = snapshot.val();
//       if (chatData) {
//         const otherParticipantId = Object.keys(chatData.participants).find(
//           (id) => id !== currentUserId
//         );
//         setRecipientId(otherParticipantId);
  
//         const recipientRef = databaseRef(db, `users/${otherParticipantId}`);
//         onValue(recipientRef, (snapshot) => {
//           setRecipientData(snapshot.val());
//         });
//       }
//     });
  
//     // Получение сообщений
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setMessages(Object.values(data));
//       }
//     });
//   }, [chatRoomId, currentUserId]);  

//   const handleSendMessage = () => {
//     if (newMessage.trim() === "") return;
  
//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
  
//     const messageData = {
//       senderId: currentUserId,
//       text: newMessage,
//       timestamp: new Date().toISOString(),
//     };
  
//     // Обновляем последнее сообщение в списках чатов обоих пользователей
//     const updateChatList = () => {
//       const chatUpdates = {};
//       chatUpdates[`users/${currentUserId}/chats/${chatRoomId}/lastMessage`] = newMessage;
//       chatUpdates[`users/${currentUserId}/chats/${chatRoomId}/timestamp`] = messageData.timestamp;
//       chatUpdates[`users/${recipientId}/chats/${chatRoomId}/lastMessage`] = newMessage;
//       chatUpdates[`users/${recipientId}/chats/${chatRoomId}/timestamp`] = messageData.timestamp;
  
//       return set(databaseRef(db), chatUpdates);
//     };
  
//     // Отправляем сообщение и обновляем список чатов
//     push(messagesRef, messageData)
//       .then(() => updateChatList())
//       .then(() => setNewMessage(""))
//       .catch((error) => console.error("Ошибка при отправке сообщения:", error));
//   };  
  

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <h2>{recipientData.username || "Чат"}</h2>
//       </div>

//       <div className="chat-messages">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`chat-message ${
//               message.senderId === currentUserId
//                 ? "chat-message-sent"
//                 : "chat-message-received"
//             }`}
//           >
//             <img
//               src={message.senderAvatar || "./default-avatar.png"}
//               alt={message.senderName}
//               className="chat-message-avatar"
//             />
//             <div>
//               <p className="chat-message-sender">{message.senderName}</p>
//               <p className="chat-message-text">{message.text}</p>
//               <span className="chat-message-timestamp">
//                 {new Date(message.timestamp).toLocaleTimeString()}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Введите сообщение..."
//           className="chat-input-field"
//         />
//         <button onClick={handleSendMessage} className="chat-send-button">
//           Отправить
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;