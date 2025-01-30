import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
  const [deleteForBoth, setDeleteForBoth] = useState(false);
  const actionsModalRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
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

    // 4. Первая подписка на сообщения (загрузка и рендеринг)
    const unsubscribeMessages1 = onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = await Promise.all(
          Object.entries(data).map(async ([key, message]) => {
            const senderSnapshot = await get(databaseRef(db, `users/${message.senderId}`));
            return {
              id: key,
              ...message,
              senderName: senderSnapshot.val()?.username || "Неизвестный",
              senderAvatar: senderSnapshot.val()?.avatarUrl || "./default-image.png",
            };
          })
        );
        // Добавьте сортировку
        messagesArray.sort((a, b) =>
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(messagesArray);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    });

    // 5. Вторая подписка на сообщения (обновление статуса просмотра)
    const unsubscribeMessages2 = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updates = {};
        Object.entries(data).forEach(([key, message]) => {
          if (
            message.senderId !== currentUserId &&
            !message.seenBy?.includes(currentUserId)
          ) {
            updates[`${key}/seenBy`] = [...(message.seenBy || []), currentUserId];
          }
        });

        if (Object.keys(updates).length > 0) {
          update(messagesRef, updates);
        }
      }
    });

    // Инициализация
    loadCurrentUser();

    // Cleanup-функция при размонтировании
    return () => {
      unsubscribeChatRoom();
      unsubscribeMessages1();
      unsubscribeMessages2();
    };
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
    setSelectedMessageId(message.id === selectedMessageId ? null : message.id);
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

    const db = getDatabase();
    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${editingMessageId}`);

    const updatedMessage = {
      text: editMessageText,
      editedAt: new Date().toISOString(),
    };

    update(messageRef, updatedMessage)
      .then(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === editingMessageId
              ? { ...msg, text: editMessageText, editedAt: updatedMessage.editedAt }
              : msg
          )
        );
        setEditingMessageId(null);
        setEditMessageText("");
      })
      .catch((error) => console.error("Ошибка при редактировании сообщения:", error));
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification("Текст скопирован в буфер обмена");
        console.log('Текст скопирован в буфер обмена');
      })
      .catch((err) => {
        console.error('Ошибка при копировании текста:', err);
      });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: currentUserId,
      senderName: currentUserData.username || "Вы",
      senderAvatar: currentUserData.avatarUrl || "./default-image.png",
      text: newMessage,
      timestamp: new Date().toISOString(),
      seenBy: [], // Изначально сообщение не просмотрено
      replyTo: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        senderName: replyingTo.senderName
      } : null
    };

    // Оптимистичное добавление сообщения в локальный стейт
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setNewMessage(""); // Сразу очищаем поле ввода

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
    <div className="chat-container">
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
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
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
                    <p className="chat-message-text">{message.text}</p>
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
                  <div className="chat-message-actions" ref={actionsRef}>
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
                        <button onClick={() => handleDeleteMessage(message.id)}>
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
                        {/* Уберите эту кнопку если нельзя удалять чужие сообщения */}
                        <button onClick={() => handleDeleteMessage(message.id)}>
                          <FaTrash /> Удалить
                        </button>
                      </>
                    )}
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
  );
};

export default Chat;