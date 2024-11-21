import React, { useState, useEffect } from "react";
import "../contact.css";
import { Link } from "react-router-dom";
import basiclogo from "../basic-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import FlowXOWidget from "./FlowXOWidget"; // Убедитесь, что путь к файлу корректный

const ContactsPage = () => {


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    if (isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 0); // Задержка для плавного исчезновения
    } else {
      setIsMenuOpen(true);
    }
  };

  return (
    <div className="cont-body">
      {/* Theme Toggle */}
      <div className="cont-theme-toggle" id="theme-toggle">
        <div className="cont-toggle-circle"></div>
      </div>

      <header>
        <nav>
          <ul>
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/about">О факультете</Link></li>
            <li><Link to="/teachers">Преподаватели</Link></li>
            <li><Link to="/schedule">Расписание</Link></li>
            <li><Link to="/library">Библиотека</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Контакты</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              <FontAwesomeIcon icon={faUser } className="" />              
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-nav-2">

        <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Контакты</ul>

        <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          
          <span className="bm-span"></span>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
        </div>

        <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
        <ul>
           <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
           <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
           <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
           <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
           <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
           <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} style={{color: "red"}} /> Контакты</Link></li>
           <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
        </ul>
        </div>

        </div>
      </header>

      {/* Header */}
      <div className="cont-header">
        <div className="cont-container">
          <h1>Контакты</h1>
        </div>
      </div>

      <div className="cont-tors">

      {/* Main Content */}
      <main>
        {/* Contact Section */}
        <section className="cont-contact-section">
          <div className="cont-container">
            <h2>Свяжитесь с нами</h2>
            <p>
              Мы всегда рады помочь вам. Свяжитесь с нами через форму или найдите
              нас на карте ниже.
            </p>
            <div className="cont-content">
              {/* Form Container */}
              <div className="cont-form-container">
                <form id="contactForm">
                  <div className="cont-form-group">
                    <label htmlFor="name">Ваше имя</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Введите ваше имя"
                      required
                    />
                  </div>
                  <div className="cont-form-group">
                    <label htmlFor="email">Электронная почта</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Введите ваш email"
                      required
                    />
                  </div>
                  <div className="cont-form-group">
                    <label htmlFor="message">Сообщение</label>
                    <textarea
                      id="message"
                      placeholder="Напишите сообщение"
                      rows="5"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="cont-btn">
                    Отправить
                  </button>
                </form>
              </div>

              {/* Info Container */}
              <div className="cont-info-container">
                <h3>Наш Университет</h3>
                <p>
                  Улица Кибербезопасности 123
                  <br />
                  Душанбе, Таджикистан
                </p>
                <p>
                  Email: info@cyberfaculty.tj
                  <br />
                  Телефон: +992 908 06 04 04
                </p>
              </div>
            </div>
          </div>
        </section>

        <FlowXOWidget />

        {/* Map Section */}
        <section className="cont-map-section">
          <div className="cont-container">
            <h2>Найдите нас</h2>
            <div className="cont-map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1111.964702339398!2d68.75871108036485!3d38.57296072697182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b5d1df27fb072b%3A0x4ee7aef3c6a5ff2a!2sFakul&#39;tet%20Informatsionno%20Kommunikatsionnykh%20Tekhnologiy%20Ttu%20Im%20Akademika%20M.%20S.%20Osimi!5e1!3m2!1snl!2s!4v1732189674782!5m2!1snl!2s"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      </div>

      {/* Footer */}
      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
        <Link to="/myprofile"><FontAwesomeIcon icon={faUser} className="footer-icon" /></Link>
      </div>
    </div>
  );
};

export default ContactsPage;













// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { FaUser } from "react-icons/fa"; // Импорт иконки крестика
// import "../App.css";
// import "../library.css";
// import "../contact.css";
// import basiclogo from "../basic-logo.png";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";

// const Contacts = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     message: ""
//   });

//   const [responseMessage, setResponseMessage] = useState("");

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setFormData({ ...formData, [id]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Обработать отправку формы
//     setResponseMessage("Ваше сообщение успешно отправлено!");
//     setFormData({
//       name: "",
//       email: "",
//       phone: "",
//       message: ""
//     });
//   };

//   const [isMenuOpen, setIsMenuOpen] = useState(false);
  
//     const toggleMenu = () => {
//       if (isMenuOpen) {
//         setTimeout(() => {
//           setIsMenuOpen(false);
//         }, 0); // Задержка для плавного исчезновения
//       } else {
//         setIsMenuOpen(true);
//       }
//     };

//     const handleContextMenu = (event) => {
//       event.preventDefault();
//     }

//   return (
//     <div className="contact-body" onContextMenu={handleContextMenu}>
//       <header>
//         <nav>
//           <ul>
//             <li><Link to="/home">Главная</Link></li>
//             <li><Link to="/about">О факультете</Link></li>
//             <li><Link to="/teachers">Преподаватели</Link></li>
//             <li><Link to="/schedule">Расписание</Link></li>
//             <li><Link to="/library">Библиотека</Link></li>
//             <li><Link to="/contacts">Контакты</Link></li>
//           </ul>
//           <ul style={{color: "#58a6ff", fontSize: "25px"}}>Преподаватели</ul>
//           <ul>
//             <li>
//               <Link to="/myprofile">
//               <FaUser className="user-icon"></FaUser>
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         <div className="header-nav-2">

//         <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

//         <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Преподаватели</ul>

//         <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//         </div>

//         <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
//         <ul>
//            <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
//            <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
//            <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
//            <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
//            <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
//            <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} style={{color: "red"}} /> Контакты</Link></li>
//            <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
//         </ul>
//         </div>

//         </div>
//       </header>

//       <div className="contact-container">
//         <h1>Свяжитесь с нами</h1>

//         <section className="social-media">
//           <h2>Мы в социальных сетях</h2>
//           <ul>
//             <li><a href="#" target="_blank" rel="noopener noreferrer">Facebook</a></li>
//             <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a></li>
//             <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
//             <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
//           </ul>
//         </section>

//         <section className="contact-form">
//           <h2>Отправьте ваши вопросы</h2>
//           <form id="contact-form" onSubmit={handleSubmit}>
//             <label htmlFor="name">Имя:</label>
//             <input
//               type="text"
//               id="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />

//             <label htmlFor="email">Электронная почта:</label>
//             <input
//               type="email"
//               id="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />

//             <label htmlFor="phone">Номер телефона:</label>
//             <input
//               type="tel"
//               id="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               required
//             />

//             <label htmlFor="message">Сообщение:</label>
//             <textarea
//               id="message"
//               value={formData.message}
//               onChange={handleChange}
//               required
//             ></textarea>

//             <button type="submit">Отправить</button>
//           </form>
//           <div id="response-message">{responseMessage}</div>
//         </section>
//       </div>

//       <footer className="footer-desktop">
//         <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
//       </footer>

//       <div className="footer-nav">
//         <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
//         <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
//         <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
//         <Link to="/myprofile"><FontAwesomeIcon icon={faUser} className="footer-icon" /></Link>
//       </div>
//     </div>
//   );
// };

// export default Contacts;