import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, set, get, push, update, remove } from "firebase/database";
import imageCompression from 'browser-image-compression';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminPanel.css';
import '../App.css';
import defaultAvatar from "../default-image.png";

const AdminPanel = () => {
  const [teachers, setTeachers] = useState([]);
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const storage = getStorage();
  const database = getDatabase();
  const reference = dbRef(database, 'requests');
  const [userComments, setUserComments] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, commentId: null });
  const [showComments, setShowComments] = useState(false);
  const [teacherComments, setTeacherComments] = useState([]);
  const [showTeacherComments, setShowTeacherComments] = useState(false);
  const [confirmTeacherCommentDelete, setConfirmTeacherCommentDelete] = useState({ isOpen: false, commentId: null, teacherId: null });
  const [userMap, setUserMap] = useState({}); // Словарь userId -> username

  useEffect(() => {
    const db = getDatabase();
    const commentsRef = dbRef(db, "comments");

    onValue(commentsRef, async (snapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        const allComments = [];

        Object.keys(commentsData).forEach((teacherId) => {
          const comments = commentsData[teacherId];
          Object.keys(comments).forEach((commentId) => {
            allComments.push({
              id: commentId,
              teacherId,
              ...comments[commentId],
            });
          });
        });

        // Сортировка по дате
        allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Получение данных о пользователях для анонимных комментариев
        const userIdsToFetch = [
          ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
        ];

        const userPromises = userIdsToFetch.map(async (userId) => {
          const userSnapshot = await get(dbRef(db, `users/${userId}`));
          return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
        });

        const users = await Promise.all(userPromises);
        const userMap = users.reduce((acc, { userId, username }) => {
          acc[userId] = username;
          return acc;
        }, {});

        setUserMap(userMap);
        setTeacherComments(allComments);
      }
    });
  }, []);

  const handleDeleteTeacherComment = (commentId, teacherId) => {
    const db = getDatabase();
    const commentRef = dbRef(db, `comments/${teacherId}/${commentId}`);
  
    remove(commentRef)
      .then(() => {
        setTeacherComments((prev) => prev.filter((comment) => comment.id !== commentId));
        toast.success('Комментарий удалён.');
      })
      .catch((error) => {
        console.error("Ошибка при удалении комментария:", error);
        toast.error('Ошибка при удалении комментария.');
      });
  };

  const openTeacherCommentDeleteModal = (commentId, teacherId) => {
    setConfirmTeacherCommentDelete({ isOpen: true, commentId, teacherId });
  };
  
  const confirmTeacherCommentDeleteAction = () => {
    const { commentId, teacherId } = confirmTeacherCommentDelete;
    if (commentId && teacherId) {
      handleDeleteTeacherComment(commentId, teacherId);
      setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
    }
  };
  
  const cancelTeacherCommentDelete = () => {
    setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
  };  


  useEffect(() => {
    const db = getDatabase();
    const commentsRef = dbRef(db, "postComments");

    onValue(commentsRef, async (snapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        const allComments = [];

        Object.keys(commentsData).forEach((postId) => {
          const postComments = commentsData[postId];
          Object.keys(postComments).forEach((commentId) => {
            allComments.push({
              id: commentId,
              postId,
              ...postComments[commentId],
            });
          });
        });

        // Сортировка по дате
        allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Получение данных о пользователях для анонимных комментариев
        const userIdsToFetch = [
          ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
        ];

        const userPromises = userIdsToFetch.map(async (userId) => {
          const userSnapshot = await get(dbRef(db, `users/${userId}`));
          return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
        });

        const users = await Promise.all(userPromises);
        const userMap = users.reduce((acc, { userId, username }) => {
          acc[userId] = username;
          return acc;
        }, {});

        setUserMap(userMap);
        setUserComments(allComments);
      }
    });
  }, []);

  const confirmDeleteComment = () => {
    const db = getDatabase();
    const { commentId } = confirmDelete;

    if (commentId) {
        const comment = userComments.find((c) => c.id === commentId);

        if (comment) {
            const commentRef = dbRef(db, `postComments/${comment.postId}/${comment.id}`);
            const postRef = dbRef(db, `posts/${comment.postId}`);

            remove(commentRef)
                .then(() => {
                    // Пересчет количества комментариев
                    onValue(dbRef(db, `postComments/${comment.postId}`), (snapshot) => {
                        const commentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                        update(postRef, { commentCount })
                            .then(() => {
                                setUserComments((prevComments) =>
                                    prevComments.filter((c) => c.id !== commentId)
                                );
                                setConfirmDelete({ isOpen: false, commentId: null });
                            })
                            .catch((error) => {
                                console.error("Ошибка при обновлении количества комментариев:", error);
                            });
                    }, { onlyOnce: true });
                })
                .catch((error) => {
                    console.error("Ошибка при удалении комментария:", error);
                });
        }
    }
};

  const handleDeleteClick = (commentId) => {
    setConfirmDelete({ isOpen: true, commentId });
  };

  
  const cancelDelete = () => {
    setConfirmDelete({ isOpen: false, commentId: null });
  };
  
  const toggleShowComments = () => {
    setShowComments((prev) => !prev);
  };
  
  useEffect(() => {
    const teachersRef = dbRef(database, 'teachers');
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTeachers = Object.keys(data).map(id => ({ id, ...data[id] }));
        setTeachers(loadedTeachers);
        setFilteredTeachers(loadedTeachers);
      } else {
        setTeachers([]);
      }
    });
  }, [database]);
  
  useEffect(() => {
    const requestsRef = dbRef(database, "requests");
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          status: data[key].status || 'pending', // Новый ключ состояния заявки
        }));
        setRequests(formattedData);
        setNewRequestsCount(formattedData.length);
      }
    });
  }, [database]);
  
  const handleRequestStatusChange = async (userId, status) => {
    try {
      const userRef = dbRef(database, `users/${userId}`);
      await update(userRef, { identificationStatus: status });
      toast.success(`Заявка ${status === "verified" ? "принята" : "отклонена"}`);
    } catch (error) {
      console.error("Ошибка при обновлении статуса заявки:", error);
    }
  };
  
  
  const handleAcceptRequest = (id) => {
    update(dbRef(database, `requests/${id}`), { status: "accepted" });
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "accepted" } : request
      )
    );
    setNewRequestsCount((prevCount) => prevCount - 1);
    toast.success('Заявка принята');
  };
  
  const handleRejectRequest = (id) => {
    update(dbRef(database, `requests/${id}`), { status: "rejected" });
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "rejected" } : request
  )
    );
    setNewRequestsCount((prevCount) => prevCount - 1);
    toast.error('Заявка отклонена');
  };
  
  const handleEditRequest = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "pending" } : request
  )
    );
    toast.info('Заявка возвращена для редактирования');
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.log("Ошибка при сжатии изображения:", error);
      return file;
    }
  };
  
  const handleSaveTeacher = async () => {
    if (newTeacher.name && newTeacher.surname && newTeacher.subject && newTeacher.login && newTeacher.password) {
      setIsLoading(true);
      let photoURL = '';
      if (photoFile) {
        const compressedPhoto = await compressImage(photoFile);
        const fileRef = storageReference(storage, `teachers/${compressedPhoto.name}`);
        await uploadBytes(fileRef, compressedPhoto);
        photoURL = await getDownloadURL(fileRef);
      }
      
      const teacherData = { ...newTeacher, photo: photoURL };
      
      if (editingTeacherId) {
        const updatedTeachers = teachers.map(t =>
          t.id === editingTeacherId ? { ...t, ...teacherData } : t
        );
        setTeachers(updatedTeachers);

        const teacherRef = dbRef(database, `teachers/${editingTeacherId}`);
        await update(teacherRef, teacherData);
        window.location.reload();
        toast.success('Преподаватель успешно изменен!');
      } else {
        const teachersRef = dbRef(database, 'teachers');
        const newTeacherRef = push(teachersRef);
        await set(newTeacherRef, teacherData);
        toast.success('Преподаватель успешно добавлен!');
      }
      
      setIsEditing(false);
      setNewTeacher({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
      setPhotoFile(null);
      setEditingTeacherId(null);
      setIsLoading(false);
    }
  };
  
  const handleEditTeacher = (teacher) => {
    setNewTeacher(teacher);
    setEditingTeacherId(teacher.id);
    setIsEditing(true);
  };
  
  const handleDeleteTeacher = async (id) => {
    setTeachers(teachers.filter(t => t.id !== id));
    const teacherRef = dbRef(database, `teachers/${id}`);
    await remove(teacherRef);
    toast.success('Преподаватель успешно удален!');
  };
  
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(query)
    );
    setFilteredTeachers(filtered);
  };
  
  const handleSelectTeacher = (teacher) => {
    setFilteredTeachers([teacher]);
  };
  
  return (
    <div className="admin-panel">
      <h1>Административная панель</h1>

      <div className="admin-buttons">
        <button className='ap-buttons-add-edit' onClick={() => setIsEditing(true)}><FaPlus /> Добавить преподавателя</button>
        <button className='ap-buttons-add-edit' onClick={() => setShowTeachersList(!showTeachersList)}>Показать список преподавателей</button>
        <button className='ap-buttons-add-edit' onClick={() => setShowRequests(!showRequests)}>
          {showRequests ? 'Скрыть заявки' : 'Показать заявки'}
          {newRequestsCount > 0 && <div className="new-request-count-basic"><span className="new-requests-count">{newRequestsCount}</span> </div>}
        </button>
      </div>

      {isLoading && <div className="loading-bar">Подождите немного...</div>}

      <h2 style={{marginTop: "50px"}}>Комментарии пользователей</h2>
      <div className="admin-buttons">
      <button className="toggle-comments-btn" onClick={toggleShowComments}>
        {showComments ? "Скрыть комментарии постов" : "Показать комментарии постов"}
      </button>

      {showComments && (
        <div id="users-comments">
          {userComments.map((comment) => (
            <div className="adm-user-comment" key={comment.id}>
              <img
                src={comment.avatarUrl || defaultAvatar}
                alt={comment.username}
                className="adm-comment-avatar"
                />
              <div className="adm-comment-details">
                <p className="adm-comment-username">
                {comment.username}
              {comment.username === "Анонимно" && comment.anonymousOwnerId && (
                <span> (Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
              )}
                </p>
                <p className="adm-comment-text">{comment.comment}</p>
                <span className="adm-comment-timestamp">{comment.timestamp}</span>
              </div>
              <button
                className="delete-comment-btn"
                onClick={() => handleDeleteClick(comment.id)}
                >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

<button className="toggle-comments-btn" onClick={() => setShowTeacherComments(!showTeacherComments)}>
  {showTeacherComments ? "Скрыть отзывы учителей" : "Показать отзывы учителей"}
</button>

{showTeacherComments && (
  <div id="users-tch-comments">
    {teacherComments.map((comment) => (
      <div className="adm-user-comment" key={comment.id}>
        <img
          src={comment.avatarUrl || defaultAvatar}
          alt={comment.username}
          className="adm-comment-avatar"
        />
        <div className="adm-comment-details">
          <p className="adm-comment-username">
          {comment.username}
              {comment.username === "Анонимно" && comment.anonymousOwnerId && (
                <span>(Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
              )}
          </p>
          <p className="adm-comment-text">{comment.comment}</p>
          <span className="adm-comment-timestamp">{comment.timestamp}</span>
        </div>
        <button
          className="delete-comment-btn"
          onClick={() => openTeacherCommentDeleteModal(comment.id, comment.teacherId)}
        >
          🗑️
        </button>
      </div>
    ))}
  </div>
)}

{confirmTeacherCommentDelete.isOpen && (
  <div className="delete-confirm-overlay">
    <div className="delete-confirm-modal">
      <p>Вы уверены, что хотите удалить отзыв об учителе?</p>
      <div className="confirm-buttons">
        <button onClick={confirmTeacherCommentDeleteAction}>Да</button>
        <button onClick={cancelTeacherCommentDelete}>Нет</button>
      </div>
    </div>
  </div>
)}

      {confirmDelete.isOpen && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <p>Вы уверены, что хотите удалить комментарий пользователя?</p>
            <div className="confirm-buttons">
              <button onClick={confirmDeleteComment}>Да</button>
              <button onClick={cancelDelete}>Нет</button>
            </div>
          </div>
        </div>
      )}
</div>

      {showRequests && (
        <div className="ident-requests">
          <h2>Заявки на идентификацию</h2>
          <div className="ident-requests-cards">
          {requests.map((request) => (
            <div
            key={request.id}
            className={`request-card ${
              request.status !== 'pending' ? 'compact-card' : ''
            }`}
            >
              {request.status === 'pending' ? (
                <>
                  <p>ФИО: {request.fio}</p>
                  <p>Факультет: {request.faculty}</p>
                  <p>Курс: {request.course}</p>
                  <p>Группа: {request.group}</p>
                  {request.photoUrl && <img src={request.photoUrl} alt="Фото студента" className="request-card-photo" />}
                  <button onClick={() => handleAcceptRequest(request.id)}>Принять</button>
                  <button onClick={() => handleRejectRequest(request.id)}>Отклонить</button>
                </>
              ) : (
                <div className="compact-content">
                  {request.photoUrl && (
                    <img src={request.photoUrl} alt="Фото студента" className="compact-photo" />
                  )}
                  <div className="compact-info">
                    <p>{request.fio}</p>
                    <p
                      className={`status-label ${
                        request.status === 'accepted' ? 'accepted' : 'rejected'
                      }`}
                      >
                      {request.status === 'accepted' ? 'Идентифицирован' : 'Не идентифицирован'}
                    </p>
                  </div>
                  <FaEdit
                    className="edit-icon-request-card"
                    onClick={() => handleEditRequest(request.id)}
                    />
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {isEditing && !isLoading && (
        <div className="adm-modal">
          <div className="adm-modal-content">
            <h2>{editingTeacherId ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</h2>
            <input 
              type="text" 
              placeholder="Имя" 
              value={newTeacher.name} 
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} 
            />
            <input 
              type="text" 
              placeholder="Фамилия" 
              value={newTeacher.surname} 
              onChange={(e) => setNewTeacher({ ...newTeacher, surname: e.target.value })} 
              />
            <input 
              type="text" 
              placeholder="Предмет" 
              value={newTeacher.subject} 
              onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })} 
              />
            <input 
              type="text" 
              placeholder="Статус" 
              value={newTeacher.status} 
              onChange={(e) => setNewTeacher({ ...newTeacher, status: e.target.value })} 
              />
            <input 
              type="text" 
              placeholder="Логин" 
              value={newTeacher.login} 
              onChange={(e) => setNewTeacher({ ...newTeacher, login: e.target.value })} 
              />
            <input 
              type="text" 
              placeholder="Пароль" 
              value={newTeacher.password} 
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} 
              />
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPhotoFile(e.target.files[0])} 
              />
            <div className="adm-modal-buttons">
            <button onClick={handleSaveTeacher}>{editingTeacherId ? 'Сохранить изменения' : 'Добавить'}</button>
            <button onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

       {showTeachersList && (
         <div className="teachers-list">
           <h2>Список преподавателей</h2>
          
           <input 
             className='search-teacherc-input'
             type="search" 
             placeholder="Поиск преподавателя..." 
             value={searchQuery}
             onChange={handleSearchChange}
             />
           {searchQuery && (
             <div className="search-suggestions">
               {filteredTeachers.map(teacher => (
                 <div 
                   key={teacher.id} 
                   className="suggestion-item" 
                   onClick={() => handleSelectTeacher(teacher)}
                   >
                   {teacher.name} {teacher.surname}
                 </div>
               ))}
             </div>
           )}

           <div className="teachers-grid">
             {filteredTeachers.map(teacher => (
               <div key={teacher.id} className="teacher-card">
                 <div className="card-header">
                   <img src={teacher.photo || 'default-photo-url.jpg'} alt={`${teacher.name} ${teacher.surname}`} />
                   <FaEdit className="edit-icon" onClick={() => handleEditTeacher(teacher)} />
                 </div>
                 <div className="card-body">
                   <h3>{`${teacher.name} ${teacher.surname}`}</h3>
                   <p><strong>Предмет:</strong> {teacher.subject}</p>
                   <p><strong>Статус:</strong> {teacher.status}</p>
                   <p><strong>Логин:</strong> {teacher.login}</p>
                   <div className="card-actions">
                     <button onClick={() => handleDeleteTeacher(teacher.id)}><FaTrash /> Удалить</button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
      <ToastContainer />
    </div>
  );
};

export default AdminPanel;