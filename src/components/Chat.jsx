// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import { FaChevronLeft, FaEllipsisV, FaEdit, FaTrash, FaReply, FaCopy } from "react-icons/fa";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   push,
//   set,
//   get,
//   remove,
//   update,
// } from "firebase/database";
// import { auth } from "../firebase";
// import "../ChatWithTeacher.css";

// const Chat = () => {
//   const { chatRoomId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [currentUserData, setCurrentUserData] = useState({});
//   const [recipientData, setRecipientData] = useState({});
//   const navigate = useNavigate();
//   const [recipientId, setRecipientId] = useState("");
//   const [selectedMessageId, setSelectedMessageId] = useState(null);
//   const [editingMessageId, setEditingMessageId] = useState(null);
//   const [editMessageText, setEditMessageText] = useState("");
//   const currentUserId = auth.currentUser?.uid;
//   const [recipientStatus, setRecipientStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const messagesEndRef = useRef(null);
//   const actionsRef = useRef(null);
//   const [showChatActions, setShowChatActions] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
//   const [deleteForBoth, setDeleteForBoth] = useState(false);
//   const actionsModalRef = useRef(null);
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [notification, setNotification] = useState(""); // Для уведомления
//   const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
//   const [messageToDelete, setMessageToDelete] = useState(null);

//   // Функция для успешных уведомлений
//   const showNotification = (message) => {
//     setNotificationType("success");
//     setNotification(message);
//     setTimeout(() => {
//       setNotification("");
//       setNotificationType("");
//     }, 3000);
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

//     // 1. Загрузка данных текущего пользователя
//     const loadCurrentUser = async () => {
//       const snapshot = await get(databaseRef(db, `users/${currentUserId}`));
//       if (snapshot.exists()) setCurrentUserData(snapshot.val());
//     };

//     // 2. Подписка на изменения чат-комнаты
//     const unsubscribeChatRoom = onValue(chatRoomRef, (snapshot) => {
//       const chatData = snapshot.val();
//       if (chatData?.participants) {
//         // Находим ID собеседника
//         const otherParticipantId = Object.keys(chatData.participants)
//           .find(id => id !== currentUserId);

//         if (otherParticipantId) {
//           setRecipientId(otherParticipantId);

//           // 3. Подписка на данные собеседника
//           const recipientRef = databaseRef(db, `users/${otherParticipantId}`);
//           const unsubscribeRecipient = onValue(recipientRef, (snapshot) => {
//             const data = snapshot.val();
//             if (data) {
//               setRecipientData(data);
//               setRecipientStatus(data.status || "offline");
//               setLastActive(data.lastActive || "");
//             }
//           });

//           return () => unsubscribeRecipient(); // Отписка при изменении собеседника
//         }
//       }
//     });

//     // 4. Первая подписка на сообщения (загрузка и рендеринг)
//     const unsubscribeMessages1 = onValue(messagesRef, async (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const messagesArray = await Promise.all(
//           Object.entries(data).map(async ([key, message]) => {
//             const senderSnapshot = await get(databaseRef(db, `users/${message.senderId}`));
//             return {
//               id: key,
//               ...message,
//               senderName: senderSnapshot.val()?.username || "Неизвестный",
//               senderAvatar: senderSnapshot.val()?.avatarUrl || "./default-image.png",
//             };
//           })
//         );
//         // Добавьте сортировку
//         messagesArray.sort((a, b) =>
//           new Date(a.timestamp) - new Date(b.timestamp)
//         );
//         setMessages(messagesArray);
//         setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
//       }
//     });

//     // 5. Вторая подписка на сообщения (обновление статуса просмотра)
//     const unsubscribeMessages2 = onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const updates = {};
//         Object.entries(data).forEach(([key, message]) => {
//           if (
//             message.senderId !== currentUserId &&
//             !message.seenBy?.includes(currentUserId)
//           ) {
//             updates[`${key}/seenBy`] = [...(message.seenBy || []), currentUserId];
//           }
//         });

//         if (Object.keys(updates).length > 0) {
//           update(messagesRef, updates);
//         }
//       }
//     });

//     // Инициализация
//     loadCurrentUser();

//     // Cleanup-функция при размонтировании
//     return () => {
//       unsubscribeChatRoom();
//       unsubscribeMessages1();
//       unsubscribeMessages2();
//     };
//   }, [chatRoomId, currentUserId]);

//   useEffect(() => {
//     if (!currentUserId) return;

//     const db = getDatabase();
//     const userStatusRef = databaseRef(db, `users/${currentUserId}/status`);
//     const lastActiveRef = databaseRef(db, `users/${currentUserId}/lastActive`);

//     set(userStatusRef, "online");

//     const handleConnectionChange = (isOnline) => {
//       set(userStatusRef, isOnline ? "online" : "offline");
//       set(lastActiveRef, new Date().toISOString());
//     };

//     const handleVisibilityChange = () => {
//       handleConnectionChange(document.visibilityState === "visible");
//     };

//     const handleBeforeUnload = () => handleConnectionChange(false);

//     // Слушатели событий
//     window.addEventListener("beforeunload", () => handleBeforeUnload);
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     return () => {
//       window.removeEventListener("beforeunload", () => handleBeforeUnload);
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       handleConnectionChange(false);
//     };
//   }, [currentUserId]);

//   // Рендер статуса
//   const renderStatus = () => {
//     if (recipientStatus === "online") {
//       return <span className="status-online">в сети</span>;
//     }

//     if (lastActive && !isNaN(new Date(lastActive))) {
//       const lastActiveTime = new Date(lastActive).toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//       return <span className="status-offline">был(а) в сети: {lastActiveTime}</span>;
//     }

//     return <span className="status-offline">не в сети</span>;
//   };

//   const handleMessageClick = (message, event) => {
//     if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON") return;

//     // Закрываем меню при клике на то же сообщение
//     if (selectedMessageId === message.id) {
//       setSelectedMessageId(null);
//       return;
//     }

//     // Открываем меню для нового сообщения
//     setSelectedMessageId(message.id);
//   };


//   // Удаление сообщения
//   const handleDeleteMessage = (messageId) => {
//     const db = getDatabase();
//     const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${messageId}`);
//     remove(messageRef)
//       .then(() => {
//         setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
//         setSelectedMessageId(null); // Закрываем меню действий
//       })
//       .catch((error) => console.error("Ошибка при удалении сообщения:", error));
//   };

//   // Редактирование сообщения
//   const handleEditMessage = (messageId, currentText) => {
//     setEditingMessageId(messageId);
//     setEditMessageText(currentText);
//     setSelectedMessageId(null); // Закрываем меню действий
//   };

//   const handleSaveEditedMessage = () => {
//     if (editMessageText.trim() === "") return;

//     const db = getDatabase();
//     const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${editingMessageId}`);

//     const updatedMessage = {
//       text: editMessageText,
//       editedAt: new Date().toISOString(),
//     };

//     update(messageRef, updatedMessage)
//       .then(() => {
//         setMessages((prevMessages) =>
//           prevMessages.map((msg) =>
//             msg.id === editingMessageId
//               ? { ...msg, text: editMessageText, editedAt: updatedMessage.editedAt }
//               : msg
//           )
//         );
//         setEditingMessageId(null);
//         setEditMessageText("");
//       })
//       .catch((error) => console.error("Ошибка при редактировании сообщения:", error));
//   };

//   const handleCopyMessage = (text) => {
//     navigator.clipboard.writeText(text)
//       .then(() => {
//         showNotification("Текст скопирован в буфер обмена");
//         console.log('Текст скопирован в буфер обмена');
//       })
//       .catch((err) => {
//         console.error('Ошибка при копировании текста:', err);
//       });
//   };

//   const handleSendMessage = () => {
//     if (newMessage.trim() === "") return;

//     const messageData = {
//       senderId: currentUserId,
//       senderName: currentUserData.username || "Вы",
//       senderAvatar: currentUserData.avatarUrl || "./default-image.png",
//       text: newMessage,
//       timestamp: new Date().toISOString(),
//       seenBy: [], // Изначально сообщение не просмотрено
//       replyTo: replyingTo ? {
//         id: replyingTo.id,
//         text: replyingTo.text,
//         senderName: replyingTo.senderName
//       } : null
//     };

//     // Оптимистичное добавление сообщения в локальный стейт
//     setMessages((prevMessages) => [...prevMessages, messageData]);
//     setNewMessage(""); // Сразу очищаем поле ввода

//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);

//     push(messagesRef, messageData)
//       .catch((error) => {
//         console.error("Ошибка при отправке сообщения:", error);
//         setMessages((prevMessages) =>
//           prevMessages.filter((msg) => msg.timestamp !== messageData.timestamp)
//         );
//       });

//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 0);
//   };

//   const handleClearHistory = () => {
//     const db = getDatabase();
//     const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
//     remove(messagesRef)
//       .then(() => {
//         setShowChatActions(false);
//         navigate(-1);
//       })
//       .catch((error) => console.error("Ошибка при очистке истории:", error));
//   };

//   const handleDeleteChat = () => {
//     const db = getDatabase();
//     const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

//     remove(currentUserChatRef)
//       .then(() => {
//         if (deleteForBoth && recipientId) {
//           const recipientChatRef = databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`);
//           remove(recipientChatRef);
//         }
//         remove(chatRoomRef)
//           .then(() => {
//             setShowDeleteModal(false);
//             navigate(-1); // Возвращаемся назад после удаления
//           });
//       })
//       .catch((error) => console.error("Ошибка при удалении чата:", error));
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (actionsRef.current && !actionsRef.current.contains(event.target)) {
//         setSelectedMessageId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="chat-container">
//       {notification && (
//         <div className={`notification ${notificationType}`}>
//           {notification}
//         </div>
//       )} {/* Уведомление */}
//       <div className="chat-header">
//         <FaChevronLeft
//           style={{ marginLeft: "10px", color: "white", fontSize: "25px" }}
//           onClick={() => navigate(-1)}
//         />
//         <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
//           <img
//             src={recipientData.avatarUrl || "./default-image.png"}
//             alt={recipientData.username || "Профиль"}
//             className="chat-header-avatar"
//             style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }}
//           />
//           <div className="chat-header-info">
//             <h2>{recipientData.username || "Чат"}</h2>
//             {renderStatus()}
//           </div>
//         </div>

//         {/* Добавляем иконку меню */}
//         <FaEllipsisV
//           style={{ marginRight: "10px", cursor: "pointer", color: "white", fontSize: "25px" }}
//           onClick={() => setShowChatActions(!showChatActions)}
//         />

//         {/* Модальное окно действий */}
//         {showChatActions && (
//           <div className="actions-modal" onClick={() => setShowChatActions(false)}>
//             <div className="actions-modal-content" onClick={(e) => e.stopPropagation()}>
//               <button
//                 className="modal-close-button"
//                 onClick={() => setShowChatActions(false)}
//                 style={{
//                   position: "absolute",
//                   top: "5px",
//                   right: "5px",
//                   background: "none",
//                   border: "none",
//                   fontSize: "20px",
//                   cursor: "pointer",
//                 }}
//               >
//                 &times;
//               </button>
//               <button className="action-button" onClick={handleClearHistory}>
//                 Очистить историю
//               </button>
//               <button
//                 className="action-button delete-button"
//                 onClick={() => {
//                   setShowChatActions(false);
//                   setShowDeleteModal(true);
//                 }}
//               >
//                 Удалить чат
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Модальное окно подтверждения удаления */}
//       {showDeleteModal && (
//         <div className="delete-modal">
//           <div className="delete-modal-content">
//             <button
//               className="modal-close-button"
//               onClick={() => setShowDeleteModal(false)}
//             >
//               &times;
//             </button>
//             <h3 className="modal-title">
//               Удалить чат с {recipientData.username}?
//             </h3>
//             <p className="modal-subtitle">Это действие нельзя будет отменить</p>

//             <label className="checkbox-container">
//               <input
//                 type="checkbox"
//                 checked={deleteForBoth}
//                 onChange={(e) => setDeleteForBoth(e.target.checked)}
//               />
//               <span className="checkmark"></span>
//               Также удалить для {recipientData.username}
//             </label>

//             <div className="modal-actions">
//               <button
//                 className="modal-button cancel-button"
//                 onClick={() => setShowDeleteModal(false)}
//               >
//                 Отмена
//               </button>
//               <button
//                 className="modal-button confirm-button"
//                 onClick={handleDeleteChat}
//               >
//                 Удалить
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="chat-messages">
//         {messages.map((message, index) => {
//           const currentDate = new Date(message.timestamp);
//           const prevMessage = messages[index - 1];
//           const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;
//           const showDate = !prevDate || currentDate.toDateString() !== prevDate.toDateString();

//           return (
//             <React.Fragment key={message.id}>
//               {showDate && (
//                 <div className="chat-date-divider">
//                   {currentDate.toLocaleDateString('ru-RU', {
//                     day: 'numeric',
//                     month: 'long'
//                   })}
//                 </div>
//               )}
//               <div
//                 className={`chat-message ${message.senderId === currentUserId
//                   ? "chat-message-sent"
//                   : "chat-message-received"
//                   }`}
//                 onClick={(e) => handleMessageClick(message, e)}
//               >
//                 <img
//                   src={message.senderAvatar || "./default-image.png"}
//                   alt={message.senderName}
//                   className="chat-message-avatar"
//                   style={{
//                     width: "30px",
//                     height: "30px",
//                     borderRadius: "50%",
//                     marginRight: "10px",
//                   }}
//                 />
//                 <div>
//                   <p className="chat-message-sender">{message.senderName}</p>
//                   {message.replyTo && (
//                     <div className="message-reply">
//                       <span>{message.replyTo.senderName}</span>
//                       <p>{message.replyTo.text}</p>
//                     </div>
//                   )}
//                   {editingMessageId === message.id ? (
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                       <button
//                         onClick={() => setEditingMessageId(null)}
//                         className="chat-cancel-edit-button"
//                         style={{
//                           background: "none",
//                           border: "none",
//                           color: "red",
//                           fontSize: "16px",
//                           marginRight: "18px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         ✖
//                       </button>
//                       <input
//                         type="text"
//                         value={editMessageText}
//                         onChange={(e) => setEditMessageText(e.target.value)}
//                         className="chat-edit-input"
//                       />
//                     </div>
//                   ) : (
//                     <p className="chat-message-text">{message.text}</p>
//                   )}
//                   <span className="chat-message-timestamp">
//                     доставлено: {new Date(message.timestamp).toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                     {message.editedAt && (
//                       <span className="chat-message-edited">
//                         (изменено: {new Date(message.editedAt).toLocaleTimeString([], {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })})
//                       </span>
//                     )}
//                     {message.senderId === currentUserId && message.seenBy?.includes(recipientId) && (
//                       <span className="chat-message-seen">просмотрено</span>
//                     )}
//                   </span>
//                 </div>
//                 {selectedMessageId === message.id && (
//   <div 
//     className="chat-message-actions" 
//     ref={actionsRef}
//     onClick={(e) => {
//       e.stopPropagation();
//       if (e.target.tagName === 'BUTTON') {
//         setSelectedMessageId(null);
//       }
//     }}
//   >
//     {message.senderId === currentUserId ? (
//       <>
//         <button onClick={() => setReplyingTo(message)}>
//           <FaReply /> Ответить
//         </button>
//         <button onClick={() => handleCopyMessage(message.text)}>
//           <FaCopy /> Копировать
//         </button>
//         <button onClick={() => handleEditMessage(message.id, message.text)}>
//           <FaEdit /> Редактировать
//         </button>
//         <button onClick={() => {
//           setMessageToDelete(message.id);
//           setShowDeleteMessageModal(true);
//         }}>
//           <FaTrash /> Удалить
//         </button>
//       </>
//     ) : (
//       <>
//         <button onClick={() => setReplyingTo(message)}>
//           <FaReply /> Ответить
//         </button>
//         <button onClick={() => handleCopyMessage(message.text)}>
//           <FaCopy /> Копировать
//         </button>
//         <button onClick={() => {
//           setMessageToDelete(message.id);
//           setShowDeleteMessageModal(true);
//         }}>
//           <FaTrash /> Удалить
//         </button>
//       </>
//     )}
//   </div>
// )}

// {showDeleteMessageModal && (
//   <div className="delete-message-modal" onClick={() => setShowDeleteMessageModal(false)}>
//     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//       <h3>Вы уверены, что хотите удалить сообщение?</h3>
//       <div className="modal-buttons">
//         <button 
//           className="cancel-message-button"
//           onClick={() => setShowDeleteMessageModal(false)}
//         >
//           Отмена
//         </button>
//         <button 
//           className="delete-message-button"
//           onClick={() => {
//             if (messageToDelete) {
//               handleDeleteMessage(messageToDelete);
//             }
//             setShowDeleteMessageModal(false);
//           }}
//         >
//           Удалить
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//               </div>
//             </React.Fragment>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="chat-input">
//         {replyingTo && (
//           <div className="reply-preview">
//             <div className="reply-line"></div>
//             <div className="reply-content">
//               <span>{replyingTo.senderName}</span>
//               <p>{replyingTo.text}</p>
//               <button onClick={() => setReplyingTo(null)}>×</button>
//             </div>
//           </div>
//         )}

//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Введите сообщение..."
//           className="chat-input-field"
//         />
//         {editingMessageId ? (
//           <button onClick={handleSaveEditedMessage} className="chat-send-button">
//             Изменить
//           </button>
//         ) : (
//           <button
//             onClick={() => {
//               if (replyingTo) {
//                 // Отправка сообщения с прикрепленным ответом
//                 handleSendMessage();
//                 setReplyingTo(null);
//               } else {
//                 handleSendMessage();
//               }
//             }}
//             className="chat-send-button"
//           >
//             {replyingTo ? "Ответить" : "Отправить"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;










import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaEllipsisV, FaEdit, FaTrash, FaReply, FaCopy } from "react-icons/fa";
import {
  getDatabase,
  ref as databaseRef,
  onValue,
  push,
  set,
  get,
  remove,
  update,
} from "firebase/database";
import { auth } from "../firebase";
import "../ChatWithTeacher.css";
import CryptoJS from 'crypto-js';
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";

const Chat = () => {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserData, setCurrentUserData] = useState({});
  const [recipientData, setRecipientData] = useState({});
  const navigate = useNavigate();
  const [recipientId, setRecipientId] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const currentUserId = auth.currentUser?.uid;
  const [recipientStatus, setRecipientStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const messagesEndRef = useRef(null);
  const actionsRef = useRef(null);
  const [showChatActions, setShowChatActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
  const [deleteForBoth, setDeleteForBoth] = useState(false);
  const actionsModalRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [notification, setNotification] = useState(""); // Для уведомления
  const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
  const [messageToDelete, setMessageToDelete] = useState(null);
  const EMOJI_LIST = ['👍', '👎', '😄', '😡', '❤️', '🎉', '😢', '👀', '🔥', '🤔'];
  const QUICK_EMOJIS = ['👍', '❤️', '😄', '😡', '🎉'];
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [selectedEmojiMessageId, setSelectedEmojiMessageId] = useState(null);
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
  const toggleMenu = () => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      localStorage.setItem('isMenuOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const mainContentStyle = {
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "360px" : "110px"),
    transition: "margin 0.3s ease",
  };

  const currentUserHeader = {
    marginRight: isMenuOpen ? "400px" : "80px",
    marginBottom: isMenuOpen ? "11px" : "0px",
    transition: "margin 0.3s ease",
  };

  const HeaderDesktop = {
    margin: isMenuOpen ? "12px" : "0 20px",
    transition: "margin 0.3s ease",
  };

  const goToProfile = (recipientId) => {
    navigate(`/profile/${recipientId}`);
  };
  const SECRET_KEY = process.env.REACT_APP_CHAT_SECRET;

  const handleAddReaction = async (messageId, emoji) => {
    const db = getDatabase();
    const message = messages.find(m => m.id === messageId);

    // Проверка максимального количества реакций
    const userReactionsCount = Object.values(message?.reactions || {})
      .flat()
      .filter(r => r.userId === currentUserId).length;

    if (userReactionsCount >= 3 && !message.reactions?.[emoji]?.some(r => r.userId === currentUserId)) {
      showNotificationError("Максимум 3 реакции на сообщение");
      return;
    }

    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${messageId}/reactions/${emoji}`);
    const snapshot = await get(messageRef);
    const currentReactions = snapshot.val() || [];

    const userReactionIndex = currentReactions.findIndex(r => r.userId === currentUserId);

    if (userReactionIndex > -1) {
      // Удаляем реакцию
      const updatedReactions = currentReactions.filter(r => r.userId !== currentUserId);
      await set(messageRef, updatedReactions);
    } else {
      // Добавляем новую реакцию
      const newReaction = {
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        emoji
      };
      await set(messageRef, [...currentReactions, newReaction]);
    }

    // УБИРАЕМ РУЧНОЕ ОБНОВЛЕНИЕ СОСТОЯНИЯ
    setSelectedMessageId(null);
  };

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

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

    // 1. Загрузка данных текущего пользователя
    const loadCurrentUser = async () => {
      const snapshot = await get(databaseRef(db, `users/${currentUserId}`));
      if (snapshot.exists()) setCurrentUserData(snapshot.val());
    };

    // 2. Подписка на изменения чат-комнаты
    const unsubscribeChatRoom = onValue(chatRoomRef, (snapshot) => {
      const chatData = snapshot.val();
      if (chatData?.participants) {
        // Находим ID собеседника
        const otherParticipantId = Object.keys(chatData.participants)
          .find(id => id !== currentUserId);

        if (otherParticipantId) {
          setRecipientId(otherParticipantId);

          // 3. Подписка на данные собеседника
          const recipientRef = databaseRef(db, `users/${otherParticipantId}`);
          const unsubscribeRecipient = onValue(recipientRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setRecipientData(data);
              setRecipientStatus(data.status || "offline");
              setLastActive(data.lastActive || "");
            }
          });

          return () => unsubscribeRecipient(); // Отписка при изменении собеседника
        }
      }
    });

    const unsubscribeMessages = onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Обновление статуса просмотра (функция из unsubscribeMessages2)
        const updates = {};
        Object.entries(data).forEach(([key, message]) => {
          if (
            message.senderId !== currentUserId &&
            !message.seenBy?.includes(currentUserId)
          ) {
            updates[`${key}/seenBy`] = [...(message.seenBy || []), currentUserId];
          }
        });

        // Применяем обновления статуса просмотра
        if (Object.keys(updates).length > 0) {
          update(messagesRef, updates);
        }

        // Загрузка и обработка сообщений (функция из unsubscribeMessages1)
        const messagesArray = await Promise.all(
          Object.entries(data).map(async ([key, message]) => {
            const senderSnapshot = await get(databaseRef(db, `users/${message.senderId}`));

            // Обработка реакций
            const reactions = message.reactions ?
              Object.entries(message.reactions).reduce((acc, [emoji, reactions]) => {
                acc[emoji] = Array.isArray(reactions) ? reactions : [];
                return acc;
              }, {}) : {};

            return {
              id: key,
              ...message,
              text: decryptMessage(message.text),
              senderName: senderSnapshot.val()?.username || "Неизвестный",
              senderAvatar: senderSnapshot.val()?.avatarUrl || "./default-image.png",
              replyTo: message.replyTo ? {
                ...message.replyTo,
                text: decryptMessage(message.replyTo.text)
              } : null,
              reactions // Добавляем реакции
            };
          })
        );

        // Сортировка и обновление состояния
        messagesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(messagesArray);
      }
    });

    return () => unsubscribeMessages();

  }, [chatRoomId, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const db = getDatabase();
    const userStatusRef = databaseRef(db, `users/${currentUserId}/status`);
    const lastActiveRef = databaseRef(db, `users/${currentUserId}/lastActive`);

    set(userStatusRef, "online");

    const handleConnectionChange = (isOnline) => {
      set(userStatusRef, isOnline ? "online" : "offline");
      set(lastActiveRef, new Date().toISOString());
    };

    const handleVisibilityChange = () => {
      handleConnectionChange(document.visibilityState === "visible");
    };

    const handleBeforeUnload = () => handleConnectionChange(false);

    // Слушатели событий
    window.addEventListener("beforeunload", () => handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", () => handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      handleConnectionChange(false);
    };
  }, [currentUserId]);

  // Рендер статуса
  const renderStatus = () => {
    if (recipientStatus === "online") {
      return <span className="status-online">в сети</span>;
    }

    if (lastActive && !isNaN(new Date(lastActive))) {
      const lastActiveTime = new Date(lastActive).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      return <span className="status-offline">был(а) в сети: {lastActiveTime}</span>;
    }

    return <span className="status-offline">не в сети</span>;
  };

  const handleMessageClick = (message, event) => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON") return;

    // Закрываем меню при клике на то же сообщение
    if (selectedMessageId === message.id) {
      setSelectedMessageId(null);
      return;
    }

    // Открываем меню для нового сообщения
    setSelectedMessageId(message.id);
  };


  // Удаление сообщения
  const handleDeleteMessage = (messageId) => {
    const db = getDatabase();
    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${messageId}`);
    remove(messageRef)
      .then(() => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
        setSelectedMessageId(null); // Закрываем меню действий
      })
      .catch((error) => console.error("Ошибка при удалении сообщения:", error));
  };

  // Редактирование сообщения
  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditMessageText(currentText);
    setSelectedMessageId(null); // Закрываем меню действий
  };

  const handleSaveEditedMessage = () => {
    if (editMessageText.trim() === "") return;

    const encryptedText = encryptMessage(editMessageText);
    const updatedMessage = {
      text: encryptedText,
      editedAt: new Date().toISOString()
    };

    const db = getDatabase();
    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${editingMessageId}`);

    update(messageRef, updatedMessage)
      .then(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === editingMessageId ? {
              ...msg,
              text: editMessageText,
              editedAt: updatedMessage.editedAt
            } : msg
          )
        );
        setEditingMessageId(null);
        setEditMessageText("");
      });
  };

  // Обновляем функцию копирования сообщения
  const handleCopyMessage = (ciphertext) => {
    const decryptedText = decryptMessage(ciphertext);
    navigator.clipboard.writeText(decryptedText)
      .then(() => {
        showNotification("Текст скопирован в буфер обмена");
      })
      .catch((err) => {
        console.error('Ошибка при копировании текста:', err);
      });
  };

  const hashMessage = (text) => {
    return CryptoJS.HmacSHA256(text, SECRET_KEY).toString();
  };

  // Модифицируем функцию отправки сообщения
  const encryptMessage = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  };

  const decryptMessage = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return "Не удалось расшифровать сообщение";
    }
  };

  // Обновляем функцию отправки сообщений
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // Шифруем сообщение
    const encryptedText = encryptMessage(newMessage);
    const encryptedReply = replyingTo ? {
      ...replyingTo,
      text: encryptMessage(replyingTo.text)
    } : null;

    const messageData = {
      senderId: currentUserId,
      senderName: currentUserData.username || "Вы",
      senderAvatar: currentUserData.avatarUrl || "./default-image.png",
      text: encryptedText,
      timestamp: new Date().toISOString(),
      seenBy: [],
      replyTo: encryptedReply
    };

    // Оптимистичное добавление расшифрованного сообщения
    setMessages((prevMessages) => [...prevMessages, {
      ...messageData,
      text: newMessage,
      replyTo: replyingTo
    }]);

    setNewMessage("");

    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);

    push(messagesRef, messageData)
      .catch((error) => {
        console.error("Ошибка при отправке сообщения:", error);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.timestamp !== messageData.timestamp)
        );
      });

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleClearHistory = () => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
    remove(messagesRef)
      .then(() => {
        setShowChatActions(false);
        navigate(-1);
      })
      .catch((error) => console.error("Ошибка при очистке истории:", error));
  };

  const handleDeleteChat = () => {
    const db = getDatabase();
    const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

    remove(currentUserChatRef)
      .then(() => {
        if (deleteForBoth && recipientId) {
          const recipientChatRef = databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`);
          remove(recipientChatRef);
        }
        remove(chatRoomRef)
          .then(() => {
            setShowDeleteModal(false);
            navigate(-1); // Возвращаемся назад после удаления
          });
      })
      .catch((error) => console.error("Ошибка при удалении чата:", error));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setSelectedMessageId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
                onClick={toggleMenu}
              />
            </>
          ) : (
            <FiChevronRight
              className="toggle-menu"
              onClick={toggleMenu}
            />
          )}
        </div>

        <nav className="menu-items">
          <Link to="/" className="menu-item">
            <FiHome className="menu-icon" />
            {isMenuOpen && <span>Главная</span>}
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
            <FiBookOpen className="menu-icon" />
            {isMenuOpen && <span>Библиотека</span>}
          </Link>
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" />
            {isMenuOpen && <span>Профиль</span>}
          </Link>
          <Link to="/chats" className="menu-item">
            <FiMessageSquare className="menu-icon" style={{ borderBottom: "1px solid rgb(200, 255, 0)", borderRadius: "15px", padding: "5px" }} />
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
      <div className="chat-container" style={mainContentStyle}>
        {notification && (
          <div className={`notification ${notificationType}`}>
            {notification}
          </div>
        )} {/* Уведомление */}
        <div className="chat-header">
          <FaChevronLeft
            style={{ marginLeft: "10px", color: "white", fontSize: "25px" }}
            onClick={() => navigate(-1)}
          />
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }} onClick={() => goToProfile(recipientId)}>
            <img
              src={recipientData.avatarUrl || "./default-image.png"}
              alt={recipientData.username || "Профиль"}
              className="chat-header-avatar"
              style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }}
            />
            <div className="chat-header-info">
              <h2>{recipientData.username || "Чат"}</h2>
              {renderStatus()}
            </div>
          </div>

          {/* Добавляем иконку меню */}
          <FaEllipsisV
            style={{ marginRight: "10px", cursor: "pointer", color: "white", fontSize: "25px" }}
            onClick={() => setShowChatActions(!showChatActions)}
          />

          {/* Модальное окно действий */}
          {showChatActions && (
            <div className="actions-modal" onClick={() => setShowChatActions(false)}>
              <div className="actions-modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  className="modal-close-button"
                  onClick={() => setShowChatActions(false)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>
                <button className="action-button" onClick={handleClearHistory}>
                  Очистить историю
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => {
                    setShowChatActions(false);
                    setShowDeleteModal(true);
                  }}
                >
                  Удалить чат
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Модальное окно подтверждения удаления */}
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
                Удалить чат с {recipientData.username}?
              </h3>
              <p className="modal-subtitle">Это действие нельзя будет отменить</p>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={deleteForBoth}
                  onChange={(e) => setDeleteForBoth(e.target.checked)}
                />
                <span className="checkmark"></span>
                Также удалить для {recipientData.username}
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
                  onClick={handleDeleteChat}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.map((message, index) => {
            const currentDate = new Date(message.timestamp);
            const prevMessage = messages[index - 1];
            const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;
            const showDate = !prevDate || currentDate.toDateString() !== prevDate.toDateString();

            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="chat-date-divider">
                    {currentDate.toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                )}
                <div
                  className={`chat-message ${message.senderId === currentUserId
                    ? "chat-message-sent"
                    : "chat-message-received"
                    }`}
                  onClick={(e) => handleMessageClick(message, e)}
                >
                  <img
                    src={message.senderAvatar || "./default-image.png"}
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
                    {message.replyTo && (
                      <div className="message-reply">
                        <span>{message.replyTo.senderName}</span>
                        <p>{message.replyTo.text}</p>
                      </div>
                    )}
                    {editingMessageId === message.id ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="chat-cancel-edit-button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "red",
                            fontSize: "16px",
                            marginRight: "18px",
                            cursor: "pointer",
                          }}
                        >
                          ✖
                        </button>
                        <input
                          type="text"
                          value={editMessageText}
                          onChange={(e) => setEditMessageText(e.target.value)}
                          className="chat-edit-input"
                        />
                      </div>
                    ) : (
                      <p className="chat-message-text">{message.text}
                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                          <div className="message-reactions">
                            {Object.entries(message.reactions).map(([emoji, reactions]) => {
                              const hasUserReaction = reactions.some(r => r.userId === currentUserId);
                              return (
                                <span
                                  key={emoji}
                                  className={`reaction-bubble ${hasUserReaction ? 'user-reaction' : ''}`}
                                  title={reactions.map(r => r.userId === currentUserId ? 'Вы' : r.userId).join(', ')}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddReaction(message.id, emoji);
                                  }}
                                >
                                  {emoji}
                                  {reactions.length > 1 && ` ${reactions.length}`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </p>
                    )}
                    <span className="chat-message-timestamp">
                      доставлено: {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {message.editedAt && (
                        <span className="chat-message-edited">
                          (изменено: {new Date(message.editedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })})
                        </span>
                      )}
                      {message.senderId === currentUserId && message.seenBy?.includes(recipientId) && (
                        <span className="chat-message-seen">просмотрено</span>
                      )}
                    </span>
                  </div>
                  {selectedMessageId === message.id && (
                    <div
                      className="chat-message-actions"
                      ref={actionsRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Закрываем меню только при клике на обычные кнопки, не эмодзи
                        if (!e.target.closest('.emoji-button, .emoji-more-button')) {
                          setSelectedMessageId(null);
                        }
                      }}
                    >
                      <div className="emoji-quick-bar">
                        {QUICK_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            className="emoji-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddReaction(message.id, emoji);
                              setSelectedMessageId(null); // Закрываем меню
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          className={`emoji-more-button ${showFullEmojiPicker ? 'open' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullEmojiPicker(!showFullEmojiPicker);
                          }}
                        >
                          ▼
                        </button>
                      </div>

                      {/* Полный список смайлов */}
                      {showFullEmojiPicker && (
                        <div className={`emoji-full-list ${showFullEmojiPicker ? 'open' : ''}`}>
                          {EMOJI_LIST.map(emoji => (
                            <button
                              key={emoji}
                              className="emoji-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddReaction(message.id, emoji);
                                setShowFullEmojiPicker(false);
                                setSelectedMessageId(null);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {message.senderId === currentUserId ? (
                        <>
                          <button onClick={() => setReplyingTo(message)}>
                            <FaReply /> Ответить
                          </button>
                          <button onClick={() => handleCopyMessage(message.text)}>
                            <FaCopy /> Копировать
                          </button>
                          <button onClick={() => handleEditMessage(message.id, message.text)}>
                            <FaEdit /> Редактировать
                          </button>
                          <button onClick={() => {
                            setMessageToDelete(message.id);
                            setShowDeleteMessageModal(true);
                          }}>
                            <FaTrash /> Удалить
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setReplyingTo(message)}>
                            <FaReply /> Ответить
                          </button>
                          <button onClick={() => handleCopyMessage(message.text)}>
                            <FaCopy /> Копировать
                          </button>
                          <button onClick={() => {
                            setMessageToDelete(message.id);
                            setShowDeleteMessageModal(true);
                          }}>
                            <FaTrash /> Удалить
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {showDeleteMessageModal && (
                    <div className="delete-message-modal" onClick={() => setShowDeleteMessageModal(false)}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Вы уверены, что хотите удалить сообщение?</h3>
                        <div className="modal-buttons">
                          <button
                            className="cancel-message-button"
                            onClick={() => setShowDeleteMessageModal(false)}
                          >
                            Отмена
                          </button>
                          <button
                            className="delete-message-button"
                            onClick={() => {
                              if (messageToDelete) {
                                handleDeleteMessage(messageToDelete);
                              }
                              setShowDeleteMessageModal(false);
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          {replyingTo && (
            <div className="reply-preview">
              <div className="reply-line"></div>
              <div className="reply-content">
                <span>{replyingTo.senderName}</span>
                <p>{replyingTo.text}</p>
                <button onClick={() => setReplyingTo(null)}>×</button>
              </div>
            </div>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="chat-input-field"
          />
          {editingMessageId ? (
            <button onClick={handleSaveEditedMessage} className="chat-send-button">
              Изменить
            </button>
          ) : (
            <button
              onClick={() => {
                if (replyingTo) {
                  // Отправка сообщения с прикрепленным ответом
                  handleSendMessage();
                  setReplyingTo(null);
                } else {
                  handleSendMessage();
                }
              }}
              className="chat-send-button"
            >
              {replyingTo ? "Ответить" : "Отправить"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;