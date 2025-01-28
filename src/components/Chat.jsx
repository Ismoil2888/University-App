import React, { useState, useEffect, useRef } from "react";
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
  const currentUserId = auth.currentUser?.uid; // Получаем ID текущего пользователя

  const messagesEndRef = useRef(null); // Ссылка на последний элемент сообщений

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
      if (chatData && chatData.participants) { // Проверяем, что chatData и participants существуют
        const otherParticipantId = Object.keys(chatData.participants).find(
          (id) => id !== currentUserId
        );
        setRecipientId(otherParticipantId);
  
        // Получаем данные получателя
        if (otherParticipantId) { // Проверяем, что otherParticipantId существует
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
        }, 100); // Небольшая задержка для корректной отрисовки сообщений
      }
    });
  }, [chatRoomId, currentUserId]);

  const inputRef = useRef(null);

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
  
    push(messagesRef, messageData).catch((error) => {
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
        <button onClick={handleSendMessage} className="chat-send-button">
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;