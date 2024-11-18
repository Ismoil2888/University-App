import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref as databaseRef, onValue, query, orderByChild, equalTo } from "firebase/database";
import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const navigate = useNavigate();

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

    // Получаем статус идентификации пользователя
    const requestRef = query(
      databaseRef(db, "requests"),
      orderByChild("email"),
      equalTo(userData?.email || "")
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
  }, [userId, userData?.email]);

  if (!userData) {
    return <p>Loading...</p>;
  }

  const renderStatus = () => {
    return status === "online" ? (
      <span className="up-status-online">в сети</span>
    ) : (
      <span className="up-status-offline">был(а) в сети: {lastActive}</span>
    );
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  }

  return (
    <div className="up-profile-container" onContextMenu={handleContextMenu}>
      <div className="up-profile-header">
        <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px"}}>
        <img
          src={userData.avatarUrl || "./default-image.png"}
          alt={userData.username}
          className="up-user-avatar"
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
          <FaLock className={`up-info-icon ${identificationStatus === "идентифицирован" ? "up-icon-verified" : "up-icon-unverified"}`} />
          Идентификация
        </div>
        <div className={`up-info-content ${identificationStatus === "идентифицирован" ? "up-status-verified" : "up-status-unverified"}`}>
          {identificationStatus}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;