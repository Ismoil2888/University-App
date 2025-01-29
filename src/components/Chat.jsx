import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
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
import { auth } from "../firebase"; // Импортируем auth для получения текущего пользователя
import "../ChatWithTeacher.css";

const Chat = () => {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserData, setCurrentUserData] = useState({});
  const [recipientData, setRecipientData] = useState({});
  const navigate = useNavigate();
  const [recipientId, setRecipientId] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null); // Для открытия меню действий
  const [editingMessageId, setEditingMessageId] = useState(null); // Для редактирования сообщения
  const [editMessageText, setEditMessageText] = useState(""); // Текст редактируемого сообщения
  const currentUserId = auth.currentUser?.uid; // Получаем ID текущего пользователя

  const messagesEndRef = useRef(null); // Ссылка на последний элемент сообщений
  const actionsRef = useRef(null);

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
      if (chatData && chatData.participants) {
        const otherParticipantId = Object.keys(chatData.participants).find(
          (id) => id !== currentUserId
        );
        setRecipientId(otherParticipantId);

        // Получаем данные получателя
        if (otherParticipantId) {
          const recipientRef = databaseRef(db, `users/${otherParticipantId}`);
          onValue(recipientRef, (snapshot) => {
            setRecipientData(snapshot.val());
          });
        }
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
              id: key, // Добавляем ID сообщения
              ...message,
              senderName: senderData?.username || "Неизвестный пользователь",
              senderAvatar: senderData?.avatarUrl || "./default-avatar.png",
            };
          })
        );
        setMessages(messagesArray);

        // Прокручиваем вниз к последнему сообщению
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });
  }, [chatRoomId, currentUserId]);

  

  // Обработчик нажатия на сообщение
  const handleMessageClick = (messageId, event) => {
    // Проверяем, если клик произошёл на поле ввода или кнопке, то игнорируем обработку
    if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON") {
      return;
    }
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
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

  // Сохранение измененного сообщения
  const handleSaveEditedMessage = () => {
    if (editMessageText.trim() === "") return;

    const db = getDatabase();
    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${editingMessageId}`);

    const updatedMessage = {
      text: editMessageText,
      editedAt: new Date().toISOString(), // Добавляем метку времени редактирования
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

  // Отправка нового сообщения
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: currentUserId,
      senderName: currentUserData.username || "Вы",
      senderAvatar: currentUserData.avatarUrl || "./default-avatar.png",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Оптимистичное добавление сообщения в локальный стейт
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setNewMessage(""); // Сразу очищаем поле ввода

    // Асинхронно отправляем сообщение в Firebase
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);

    push(messagesRef, messageData)
      .catch((error) => {
        console.error("Ошибка при отправке сообщения:", error);
        // Обработка ошибок (например, удаление оптимистично добавленного сообщения)
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.timestamp !== messageData.timestamp)
        );
      });

    // Скролл к последнему сообщению
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
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
      <div className="chat-header">
        <FaChevronLeft
          style={{ marginLeft: "10px", color: "white", fontSize: "25px" }}
          onClick={() => navigate(-1)}
        />
        <img
          src={recipientData.avatarUrl || "./default-avatar.png"}
          alt={recipientData.username || "Профиль"}
          className="chat-header-avatar"
          style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
        />
        <h2>{recipientData.username || "Чат"}</h2>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.senderId === currentUserId
                ? "chat-message-sent"
                : "chat-message-received"
            }`}
            onClick={(e) =>
              message.senderId === currentUserId && handleMessageClick(message.id, e)
            }
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
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.editedAt && (
                  <span className="chat-message-edited">
                    (изменено: {new Date(message.editedAt).toLocaleTimeString()})
                  </span>
                )}
              </span>
            </div>
            {selectedMessageId === message.id && (
              <div className="chat-message-actions" ref={actionsRef}>
                <button onClick={() => handleEditMessage(message.id, message.text)}>
                  <FaEdit /> Редактировать
                </button>
                <button onClick={() => handleDeleteMessage(message.id)}>
                  <FaTrash /> Удалить
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
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
          <button onClick={handleSendMessage} className="chat-send-button">
            Отправить
          </button>
        )}
      </div>
    </div>
  );
};

export default Chat;