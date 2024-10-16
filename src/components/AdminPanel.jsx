// AdminPanel.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaHome, FaBook, FaChalkboardTeacher } from 'react-icons/fa';

const initialTeachers = [
  {
    id: 1,
    name: 'Анна',
    surname: 'Смирнова',
    subject: 'Математика',
  },
  {
    id: 2,
    name: 'Иван',
    surname: 'Петров',
    subject: 'Физика',
  },
  {
    id: 3,
    name: 'Екатерина',
    surname: 'Волкова',
    subject: 'История',
  },
];

const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 80 },
    },
  };

const AdminPanel = () => {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '' });
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  const handleAddTeacher = () => {
    if (newTeacher.name && newTeacher.surname && newTeacher.subject) {
      const newId = teachers.length > 0 ? teachers[teachers.length - 1].id + 1 : 1;
      setTeachers([...teachers, { ...newTeacher, id: newId }]);
      setNewTeacher({ name: '', surname: '', subject: '' });
    }
  };

  const handleEditTeacher = (id) => {
    const teacher = teachers.find(t => t.id === id);
    setNewTeacher({ name: teacher.name, surname: teacher.surname, subject: teacher.subject });
    setEditingTeacherId(id);
  };

  const handleUpdateTeacher = () => {
    setTeachers(teachers.map(t =>
      t.id === editingTeacherId ? { ...t, ...newTeacher } : t
    ));
    setEditingTeacherId(null);
    setNewTeacher({ name: '', surname: '', subject: '' });
  };

  const handleDeleteTeacher = (id) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };

  return (
    <div className="admin-panel">
      <h1>Административная панель</h1>
      <div className="admin-buttons">
        <button onClick={handleAddTeacher}><FaPlus /> Добавить преподавателя</button>
        <button onClick={() => setShowTeachersList(!showTeachersList)}>Показать список преподавателей</button>
      </div>

      {/* Форма для добавления или редактирования преподавателя */}
      <div className="teacher-form">
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
        <button onClick={editingTeacherId ? handleUpdateTeacher : handleAddTeacher}>
          {editingTeacherId ? 'Сохранить изменения' : 'Добавить'}
        </button>
      </div>

      {/* Список преподавателей */}
      {showTeachersList && (
        <div className="teachers-list">
          <h2>Список преподавателей</h2>
          {teachers.length > 0 ? (
            teachers.map(teacher => (
              <div key={teacher.id} className="teacher-item">
                <span>{`${teacher.name} ${teacher.surname} - ${teacher.subject}`}</span>
                <div className="actions">
                  <button onClick={() => handleEditTeacher(teacher.id)}><FaEdit /></button>
                  <button onClick={() => handleDeleteTeacher(teacher.id)}><FaTrash /></button>
                </div>
              </div>
            ))
          ) : (
            <p>Нет преподавателей.</p>
          )}
        </div>
      )}

<motion.nav 
        variants={navbarVariants} 
        initial="hidden" 
        animate="visible" 
        className="navbar"
      >
        <a href="#">
          <FaHome /> Главная
        </a>
        <a href="#library">
          <FaBook /> Библиотека
        </a>
        <a href="#teachers">
          <FaChalkboardTeacher /> Преподаватели
        </a>
      </motion.nav>
    </div>
  );
};

export default AdminPanel;