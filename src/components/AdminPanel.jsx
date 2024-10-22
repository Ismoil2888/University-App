import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaHome, FaBook, FaChalkboardTeacher } from 'react-icons/fa';
import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, set, push, update, remove } from "firebase/database";
import imageCompression from 'browser-image-compression'; // Импортируем библиотеку для сжатия
import '../AdminPanel.css';
import '../App.css';

const AdminPanel = () => {
  const [teachers, setTeachers] = useState([]);
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredTeachers, setFilteredTeachers] = useState([]); 

  // Firebase setup
  const storage = getStorage();
  const database = getDatabase();

  // Fetch teachers data from Firebase when component mounts
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

  // Сжатие изображения перед загрузкой
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // Максимальный размер файла (в МБ)
      maxWidthOrHeight: 1920, // Максимальная ширина/высота (в пикселях)
      useWebWorker: true, // Использовать WebWorker для сжатия
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.log("Ошибка при сжатии изображения:", error);
      return file; // В случае ошибки возвращаем исходный файл
    }
  };

  // Handle adding or updating teacher
  const handleSaveTeacher = async () => {
    if (newTeacher.name && newTeacher.surname && newTeacher.subject && newTeacher.login && newTeacher.password) {
      let photoURL = '';
      
      if (photoFile) {
        // Сжимаем фото перед загрузкой
        const compressedPhoto = await compressImage(photoFile);

        const fileRef = storageReference(storage, `teachers/${compressedPhoto.name}`);
        await uploadBytes(fileRef, compressedPhoto);
        photoURL = await getDownloadURL(fileRef);
      }
  
      const teacherData = { ...newTeacher, photo: photoURL };
  
      if (editingTeacherId) {
        // Update existing teacher
        const updatedTeachers = teachers.map(t =>
          t.id === editingTeacherId ? { ...t, ...teacherData } : t
        );
        setTeachers(updatedTeachers);
  
        // Update in Firebase
        const teacherRef = dbRef(database, `teachers/${editingTeacherId}`);
        await update(teacherRef, teacherData);
      } else {
        // Add new teacher
        const teachersRef = dbRef(database, 'teachers');
        const newTeacherRef = push(teachersRef);
        await set(newTeacherRef, teacherData);
      }
  
      // Reset form
      setNewTeacher({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
      setPhotoFile(null);
      setEditingTeacherId(null);
      setIsEditing(false);
    }
  };

  // Handle edit click
  const handleEditTeacher = (teacher) => {
    setNewTeacher(teacher);
    setEditingTeacherId(teacher.id);
    setIsEditing(true);
  };

  // Handle delete
  const handleDeleteTeacher = async (id) => {
    setTeachers(teachers.filter(t => t.id !== id));

    const teacherRef = dbRef(database, `teachers/${id}`);
    await remove(teacherRef);
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(query)
    );
    setFilteredTeachers(filtered);
  };

  // Handle selecting a teacher from search results
  const handleSelectTeacher = (teacher) => {
    setFilteredTeachers([teacher]);
  };

  return (
    <div className="admin-panel">
      <h1>Административная панель</h1>
      <div className="admin-buttons">
        <button className='ap-buttons-add-edit' onClick={() => setIsEditing(true)}><FaPlus /> Добавить преподавателя</button>
        <button className='ap-buttons-add-edit' onClick={() => setShowTeachersList(!showTeachersList)}>Показать список преподавателей</button>
      </div>

      {isEditing && (
        <div className="modal">
          <div className="modal-content">
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
              type="password" 
              placeholder="Пароль" 
              value={newTeacher.password} 
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} 
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPhotoFile(e.target.files[0])} 
            />
            <div className="modal-buttons">
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
            type="text" 
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

      <motion.nav 
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, type: 'spring', stiffness: 80 },
          },
        }} 
        initial="hidden" 
        animate="visible" 
        className="navbar"
      >
        <a href="#"><FaHome /> Главная</a>
        <a href="#library"><FaBook /> Библиотека</a>
        <a href="#teachers"><FaChalkboardTeacher /> Преподаватели</a>
      </motion.nav>
    </div>
  );
};

export default AdminPanel;