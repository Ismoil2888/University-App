import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../firebase";
import { Link } from "react-router-dom";
import { IoPersonOutline, IoMailOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [showCopyPassword, setShowCopyPassword] = useState(false); 

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleCopyPasswordVisibility = () => {
    setShowCopyPassword(!showCopyPassword);
  };

  const register = (e) => {
    e.preventDefault();

    if (copyPassword !== password) {
      setError("Passwords do not match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        set(ref(database, "users/" + user.uid), {
          username: username,
          email: user.email,
        });

        setError("");
        setEmail("");
        setPassword("");
        setCopyPassword("");
        setUsername("");
        window.location.href = "#/authdetails";
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError("Этот имейл уже используется");
            break;
          case 'auth/invalid-email':
            setError("Invalid email format");
            break;
          case 'auth/weak-password':
            setError("Password is too weak");
            break;
          default:
            setError("An error occurred during registration");
        }
      });
  };

  return (
    <div className="section">
      <div className="register-box">
        <form onSubmit={register}>
          <h2>Регистрация</h2>
          <div className="reg-input-box">
            <span className="icon">
              <IoPersonOutline />
            </span>
            <input
              type="text"
              maxLength="12"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="username">Имя</label>
          </div>
          <div className="reg-input-box">
            <span className="icon">
              <IoMailOutline />
            </span>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Электронная почта</label>
          </div>
          <div className="reg-input-box">
            <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
              {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
            </span>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />
            <label htmlFor="password">Пароль</label>
          </div>
          <div className="reg-input-box">
            <span className="icon" onClick={toggleCopyPasswordVisibility} style={{ cursor: "pointer" }}>
              {showCopyPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
            </span>
            <input
              type={showCopyPassword ? "text" : "password"}
              id="confirmPassword"
              value={copyPassword}
              onChange={(e) => setCopyPassword(e.target.value)}
              minLength="6"
              required
            />
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
          </div>
          <div className="remember-forgot">
            <label className="checkbox-p">
              <input type="checkbox" /> <p>Запомнить меня</p>
            </label>
            <p>Забыли пароль?</p>
          </div>
          <button type="submit">Register</button>
          {error && <p style={{ color: "red", marginTop: "55px", position: "absolute", marginLeft: "50px" }}>{error}</p>}
          <div className="register-link">
            <p>
              Уже есть аккаунт? <Link className="a" to="/">Войти</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;




// import React, { useState } from "react";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { ref, set } from "firebase/database";
// import { auth, database } from "../firebase";
// import { Link } from "react-router-dom";
// import { IoPersonOutline, IoMailOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

// const SignUp = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [copyPassword, setCopyPassword] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false); // Состояние для показа/скрытия пароля
//   const [showCopyPassword, setShowCopyPassword] = useState(false); // Состояние для подтверждения пароля

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const toggleCopyPasswordVisibility = () => {
//     setShowCopyPassword(!showCopyPassword);
//   };

//   const register = (e) => {
//     e.preventDefault();

//     if (copyPassword !== password) {
//       setError("Passwords do not match");
//       return;
//     }

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;

//         // Сохраняем имя пользователя в Realtime Database
//         set(ref(database, "users/" + user.uid), {
//           username: username,
//           email: user.email,
//         });

//         setError("");
//         setEmail("");
//         setPassword("");
//         setCopyPassword("");
//         setUsername("");

//         // Перенаправление на AuthDetails после регистрации
//         window.location.href = "#/authdetails";
//       })
//       // .catch((error) => {
//       //   console.log(error);
//       //   setError("An error occurred during registration");
//       // });
//       .catch((error) => {
//         switch (error.code) {
//           case 'auth/email-already-in-use':
//             setError("This email is already in use");
//             break;
//           case 'auth/invalid-email':
//             setError("Invalid email format");
//             break;
//           case 'auth/weak-password':
//             setError("Password is too weak");
//             break;
//           default:
//             setError("An error occurred during registration");
//         }
//       });      
//   };

//   return (
//     <div className="section">
//       <div className="register-box">
//         <form onSubmit={register}>
//           <h2>Registration</h2>
//           <div className="reg-input-box">
//             <span className="icon">
//               <IoPersonOutline /> {/* Замена на иконку профиля */}
//             </span>
//             <input
//               type="text"
//               maxLength="12"
//               name="user_name"
//               id="user_name"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//             <label htmlFor="user_name">Name</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon">
//               <IoMailOutline /> {/* Замена на иконку email */}
//             </span>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <label>Email</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
//               {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />} {/* Переключение иконки */}
//             </span>
//             <input
//               type={showPassword ? "text" : "password"} // Переключение типа input
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               minLength="6"
//             />
//             <label>Password</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon" onClick={toggleCopyPasswordVisibility} style={{ cursor: "pointer" }}>
//               {showCopyPassword ? <IoEyeOutline /> : <IoEyeOffOutline />} {/* Переключение иконки */}
//             </span>
//             <input
//               type={showCopyPassword ? "text" : "password"} // Переключение типа input
//               value={copyPassword}
//               onChange={(e) => setCopyPassword(e.target.value)}
//               minLength="6"
//             />
//             <label>Confirm Password</label>
//           </div>
//           <div className="remember-forgot">
//             <label>
//               <input type="checkbox" /> Remember me
//             </label>
//             <p>Forgot Password?</p>
//           </div>
//           <button type="submit">Register</button>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//           <div className="register-link">
//             <p>
//               Already have an account? <Link className="a" to="/">Login</Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignUp;