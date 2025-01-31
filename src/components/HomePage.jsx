//упрощенка 2
// import React, { useState, useEffect, useRef } from "react";
// import { getDatabase, ref as dbRef, onValue, get, push, set, update, remove } from "firebase/database";
// import { auth, database } from "../firebase";
// import defaultAvatar from "../default-image.png";
// import photo from "../Каримзода.jpg";
// import "../App.css";
// import "../PostForm.css";
// import anonymAvatar from '../anonym2.jpg';
// import { GoKebabHorizontal } from "react-icons/go";
// import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark } from "react-icons/fa";

// const HomePage = () => {
//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [menuPostId, setMenuPostId] = useState(null);
//   const [expandedPosts, setExpandedPosts] = useState({}); 
//   const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null });
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [actionMenuId, setActionMenuId] = useState(null);
//   const actionMenuRef = useRef(null);
//   const menuRef = useRef(null);
//   const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
//   const userId = auth.currentUser?.uid; 
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (user) {
//       const db = getDatabase();
//       const userRef = dbRef(db, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const userData = snapshot.val();
//         if (userData && userData.avatarUrl) {
//           setUserAvatarUrl(userData.avatarUrl);
//         } else {
//           setUserAvatarUrl(defaultAvatar);
//         }
//       });
//     }
//   }, []);

//   useEffect(() => {
//     const db = getDatabase();
//     const postsRef = dbRef(db, "posts");
  
//     const unsubscribe = onValue(postsRef, (snapshot) => {
//       const postsData = snapshot.val();
//       if (postsData) {
//         const approvedPosts = Object.keys(postsData)
//           .map((key) => ({
//             id: key,
//             ...postsData[key],
//           }))
//           .filter((post) => post.status === "approved");
//         setPosts(approvedPosts);
//       }
//     });
  
//     const user = auth.currentUser;
//     if (user) {
//       const userRef = dbRef(db, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           setUserDetails({
//             username: data.username || "User",
//             avatarUrl: data.avatarUrl || defaultAvatar,
//           });
//         }
//       });
//     }
  
//     return () => unsubscribe();
//   }, []);

//   const handleDeletePost = (postId) => {
//     const db = getDatabase();
//     const postRef = dbRef(db, `posts/${postId}`);
//     const commentsRef = dbRef(db, `postComments/${postId}`);
//     const likesRef = dbRef(db, `posts/${postId}/likes`);
  
//     Promise.all([
//       remove(postRef),
//       remove(commentsRef),
//       remove(likesRef),
//     ])
//       .then(() => {
//         setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
//         console.log("Пост и связанные данные успешно удалены.");
//         alert("Вы удалили свою публикацию.");
//       })
//       .catch((error) => {
//         console.error("Ошибка удаления поста:", error);
//       });
//   }; 

//   const toggleTextExpansion = (postId) => {
//     setExpandedPosts((prev) => ({
//       ...prev,
//       [postId]: !prev[postId],
//     }));
//   };

//   const openCommentModal = (postId) => {
//     setCommentModal({ isOpen: true, postId });

//     const database = getDatabase();
//     const commentsRef = dbRef(database, `postComments/${postId}`);
//     onValue(commentsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
//         setComments(loadedComments);
//       } else {
//         setComments([]);
//       }
//     });
//   };

//   const closeCommentModal = () => {
//     setCommentModal({ isOpen: false, postId: null });
//     setComments([]);
//     setEditingCommentId(null);
//     setNewComment("");
//   };

//   const handleCommentSubmit = (isAnonymous = false) => {
//     if (newComment.trim() === "") return;

//     const database = getDatabase();
//     const commentRef = dbRef(database, `postComments/${commentModal.postId}`);
//     const postRef = dbRef(database, `posts/${commentModal.postId}`);

//     const formattedTimestamp = new Date().toLocaleString("ru-RU"); // Форматируем дату для записи

//     if (editingCommentId) {
//       update(dbRef(database, `postComments/${commentModal.postId}/${editingCommentId}`), {
//         comment: newComment,
//         timestamp: formattedTimestamp,
//       });
//       setEditingCommentId(null);
//     } else {
//       const newCommentRef = push(commentRef);
//       update(newCommentRef, {
//         avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//         username: isAnonymous ? "Анонимно" : userDetails.username,
//         userId: isAnonymous ? null : auth.currentUser?.uid,
//         anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null,
//         comment: newComment,
//         timestamp: formattedTimestamp,
//       });

//       get(postRef).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== auth.currentUser?.uid) {
//           const notificationRef = dbRef(database, `notifications/${postOwnerId}`);
//           const notificationKey = `comment_${newCommentRef.key}`;
//           set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
//             avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//             username: isAnonymous ? "Анонимно" : userDetails.username,
//             comment: newComment,
//             timestamp: formattedTimestamp, 
//             userId: isAnonymous ? null : auth.currentUser?.uid,
//             type: 'comment',
//           }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
//         }
//       });

//       get(commentRef).then((snapshot) => {
//         const commentCount = snapshot.size || 0;
//         update(postRef, { commentCount });
//       });
//     }
//     setNewComment("");
//   };

//   const handleEditComment = (commentId, commentText) => {
//     setEditingCommentId(commentId);
//     setNewComment(commentText);
//     setActionMenuId(null); 
//   };

//   const handleDeleteComment = (commentId) => {
//     const database = getDatabase();
//     const commentRef = dbRef(database, `postComments/${commentModal.postId}/${commentId}`);
//     const postRef = dbRef(database, `posts/${commentModal.postId}`);

//     remove(commentRef).then(() => {
//       onValue(dbRef(database, `postComments/${commentModal.postId}`), (snapshot) => {
//         const commentCount = snapshot.size || 0;
//         update(postRef, { commentCount });
//       });
//     });
//   };

//   const handleLikeToggle = (postId) => {
//     if (!userId) return;

//     const db = getDatabase();
//     const postLikesRef = dbRef(db, `posts/${postId}/likes`);

//     const post = posts.find((p) => p.id === postId);
//     const isLiked = post?.likes && post.likes[userId];
//     const updatedLikes = { ...post.likes };

//     if (isLiked) {
//       delete updatedLikes[userId];
//     } else {
//       updatedLikes[userId] = true; 
//     }

//     setPosts((prevPosts) =>
//       prevPosts.map((p) => {
//         if (p.id === postId) {
//           return { ...p, likes: updatedLikes };
//         }
//         return p;
//       })
//     );

//     if (isLiked) {
//       update(postLikesRef, { [userId]: null }).catch((error) =>
//         console.error("Ошибка при снятии лайка: ", error)
//       );

//       get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== userId) {
//           const notificationKey = `like_${postId}_${userId}`;
//           const notificationRef = dbRef(database, `notifications/${postOwnerId}/${notificationKey}`);
//           remove(notificationRef).catch((error) => console.error("Ошибка при удалении уведомления: ", error));
//         }
//       });
//     } else {
//       update(postLikesRef, { [userId]: true }).catch((error) =>
//         console.error("Ошибка при добавлении лайка: ", error)
//       );

//       get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== userId) {
//           const notificationKey = `like_${postId}_${userId}`;
//           set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
//             avatarUrl: userDetails.avatarUrl || defaultAvatar,
//             username: userDetails.username || "Пользователь",
//             message: `Пользователю "${userDetails.username}" понравилась ваша публикация`,
//             timestamp: new Date().toLocaleString("ru-RU"), // Читаемый формат даты
//             userId: auth.currentUser?.uid,
//             type: 'like',
//           }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const user = auth.currentUser;
  
//     if (user) {
//       const notificationsRef = dbRef(db, `notifications/${user.uid}`);
  
//       onValue(notificationsRef, (snapshot) => {
//         const notifications = snapshot.val();
//         if (notifications) {
//           const unreadCount = Object.values(notifications).filter(
//             (notif) => !notif.isRead
//           ).length;
//           setUnreadCount(unreadCount);
//         } else {
//           setUnreadCount(0);
//         }
//       });
//     }
//   }, []);
  
//   const [likesModal, setLikesModal] = useState({ isOpen: false, users: [] });

//   const openLikesModal = (postId) => {
//     const db = getDatabase();
//     const likesRef = dbRef(db, `posts/${postId}/likes`);

//     onValue(likesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const likesData = snapshot.val();
//         const userIds = Object.keys(likesData);

//         if (userIds.length === 0) {
//           setLikesModal({ isOpen: true, users: [] });
//           return;
//         }
//         const usersPromises = userIds.map((uid) =>
//           get(dbRef(db, `users/${uid}`)).then((userSnap) => ({
//             userId: uid,
//             username: userSnap.val()?.username || "Пользователь",
//             avatarUrl: userSnap.val()?.avatarUrl || defaultAvatar,
//           }))
//         );
//         Promise.all(usersPromises)
//           .then((users) => {
//             setLikesModal({ isOpen: true, users });
//           })
//           .catch((error) => {
//             console.error("Ошибка при получении данных о пользователях лайков:", error);
//             setLikesModal({ isOpen: true, users: [] });
//           });
//       } else {
//         setLikesModal({ isOpen: true, users: [] });
//       }
//     });
//   };

//   const closeLikesModal = () => {
//     setLikesModal({ isOpen: false, users: [] });
//   };

//   return (
//     <div className="glava">
// <div className="app">
//       <main className="hp-main-content">
//         <section className="hp-news-section">
//           <div className="hp-news-run">
//             <marquee behavior="scroll" direction="left">
//             <div class="scrolling-banner">
//               <div class="scrolling-text">
//                 <pre>
//                  ИҚТИБОС АЗ УМАРИ ХАЙЁМ:  „Не верь тому, кто говорит красиво, в его словах всегда игра. Поверь тому, кто молчаливо, творит красивые дела.“    „Молчанье — щит от многих бед, А болтовня всегда во вред. Язык у человека мал, Но сколько жизней он сломал.“  | Умари Хайём |
//                 </pre>
//               </div>
//             </div>
//             </marquee>
//           </div>
//           <h2>Хабарҳои охирин</h2>
//           <div className="hp-news-grid">
//             {Array(6)
//               .fill(0)
//               .map((_, index) => (
//                 <div key={index} className="hp-news-item">
//                   <div className="hp-news-date">02/12/2024</div>
//                   <img
//                     src={photo}
//                     alt="News"
//                     className="hp-news-image"
//                   />
//                   <p>Масъалаҳои муосири саноати мошинсозӣ</p>
//                 </div>
//               ))}
//           </div>
//         </section>
//       </main>
//     </div>

//     <div className="home-container">
//       <main style={{ paddingTop: "70px", paddingBottom: "100px" }}>
//   <section id="posts">
//     {posts.length === 0 ? (
//       <div className="no-posts-message">
//         <h2>Платформа для студентов факультета ТИК Таджикского Технического Университета</h2>
//       </div>
//     ) : (
//       posts
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .map((post) => {
//           const likesCount = post.likes ? Object.keys(post.likes).length : 0;
//           const isLiked = post.likes && post.likes[userId];
//           return (
//             <div key={post.id} className="post-card">
//               <div className="post-header">
//                 <div className="post-author">
//                   <img
//                     src={post.userAvatar || defaultAvatar}
//                     alt="User Avatar"
//                     className="post-avatar"
//                   />
//                   <span 
//                   className="post-username"
//                   >{post.userName}</span>
//                 </div>
//                 {post.userId === auth.currentUser?.uid && (
//                   <div className="three-dot-menu">
//                     <span>...</span>
//                     {menuPostId === post.id && (
//                       <div ref={menuRef} className="menu-options">
//                         <span>Изменить</span>
//                         <span onClick={() => handleDeletePost(post.id)}>Удалить</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {post.mediaUrl && (
//                 post.mediaUrl.endsWith(".mp4") ? (
//                   <video controls src={post.mediaUrl} className="post-media" />
//                 ) : (
//                   <img src={post.mediaUrl} alt="Post Media" className="post-media" />
//                 )
//               )}

//               <div className="post-actions">
//                 {isLiked ? (
//                   <FaHeart
//                     className="post-icon liked"
//                     onClick={() => handleLikeToggle(post.id)}
//                     style={{ color: "red" }}
//                   />
//                 ) : (
//                   <FaRegHeart
//                     className="post-icon"
//                     onClick={() => handleLikeToggle(post.id)}
//                   />
//                 )}
//                 <FaRegComment 
//                   className="post-icon" 
//                   onClick={() => openCommentModal(post.id)} 
//                 />
//                 <FaRegBookmark className="post-icon" />
//               </div>

//               <p 
//                 className="post-likes" 
//                 onClick={() => openLikesModal(post.id)}
//                 style={{ cursor: "pointer" }}
//               >
//                 Нравится: {likesCount}
//               </p>

//               <p className="post-content">
//                 <span className="post-username">{post.userName}</span>{" "}
//               </p>

//               <p 
//                 style={{color: "grey", marginLeft: "10px", marginTop: "5px"}} 
//                 onClick={() => openCommentModal(post.id)} 
//               >
//                 Посмотреть все комментарии ({post.commentCount || 0})
//               </p>

//               {commentModal.isOpen && commentModal.postId === post.id && (
//                 <div className="comment-modal-overlay">
//                   <div className="comment-modal">
//                     <div className="modal-header">
//                       <h3>Комментарии</h3>
//                       <button className="close-modal" onClick={closeCommentModal}>
//                         &times;
//                       </button>
//                     </div>
//                     <div className="comments-list">
//                       {comments 
//                       .slice()
//                       .reverse()
//                       .map((comment) => (
//                         <div className="comment" key={comment.id}>
//                           <img 
//                             src={comment.avatarUrl || defaultAvatar} 
//                             alt={comment.username} 
//                             className="comment-avatar"
//                           />
//                           <div className="comment-content">
//                             <p
//                               className="comment-username"
//                             >
//                               {comment.username}
//                             </p>
//                             <p className="comment-text">{comment.comment}</p>
//                             <span className="comment-timestamp">{comment.timestamp}</span>
//                           </div>
//                           <div ref={actionMenuRef} className="menu-icon-container">
//                             {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
//                               <>
//                                 <GoKebabHorizontal 
//                                   style={{fontSize: "20px", color: "grey"}} 
//                                   className="action-icon"
//                                 />
//                                 {actionMenuId === comment.id && (
//                                   <div className={`action-menu show`}>
//                                     <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
//                                     <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
//                                   </div>
//                                 )}
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="new-comment">
//                       <input
//                         type="text"
//                         placeholder="Напишите комментарий..."
//                         value={newComment}
//                         onChange={(e) => setNewComment(e.target.value)}
//                       />
//                       <button onClick={() => handleCommentSubmit(false)}>Отправить</button>
//                       <button onClick={() => handleCommentSubmit(true)}>Отправить анонимно</button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {likesModal.isOpen && (
//                 <div className="like-modal-overlay">
//                   <div className="like-modal">
//                     <div className="like-modal-header">
//                       <h3>Лайкнувшие пользователи</h3>
//                       <button className="close-like-modal" onClick={closeLikesModal}>
//                         &times;
//                       </button>
//                     </div>
//                     <div className="like-modal-body">
//                       {likesModal.users.length > 0 ? (
//                         likesModal.users.map((user) => (
//                           <div key={user.userId} className="like-user">
//                             <img src={user.avatarUrl} alt={user.username} className="like-avatar" />
//                             <span className="like-username">{user.username}</span>
//                           </div>
//                         ))
//                       ) : (
//                         <p style={{color: "grey"}}>Нет лайков для этого поста.</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <p className="post-date">{new Date(post.createdAt).toLocaleString("ru-RU")}</p>
//             </div>
//           );
//         })
//     )}
//   </section>
// </main>
//     </div>
//     </div>
//   );
// };

// export default HomePage;













//новый упрощенный
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { getDatabase, ref as dbRef, onValue, get, push, set, update, remove } from "firebase/database";
// import { auth, database } from "../firebase";
// import defaultAvatar from "../default-image.png";
// import "../PostForm.css";
// import anonymAvatar from '../anonym2.jpg';
// import { GoKebabHorizontal } from "react-icons/go";
// import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark } from "react-icons/fa";

// const HomePage = () => {
//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [menuPostId, setMenuPostId] = useState(null);
//   const [expandedPosts, setExpandedPosts] = useState({});
//   const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null });
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [actionMenuId, setActionMenuId] = useState(null);
//   const actionMenuRef = useRef(null);
//   const menuRef = useRef(null);
//   const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
//   const userId = auth.currentUser?.uid; 
//   const [unreadCount, setUnreadCount] = useState(0);
//   const navigate = useNavigate();

//   const goToProfile = (userId) => {
//     navigate(`/profile/${userId}`);
//   };
//   const MAX_TEXT_LENGTH = 100; 

//   const toggleMenu = (postId) => {
//     setMenuPostId(postId === menuPostId ? null : postId);
//   };

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (user) {
//       const db = getDatabase();
//       const userRef = dbRef(db, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const userData = snapshot.val();
//         if (userData && userData.avatarUrl) {
//           setUserAvatarUrl(userData.avatarUrl);
//         } else {
//           setUserAvatarUrl(defaultAvatar);
//         }
//       });
//     }
//   }, []);

//   useEffect(() => {
//     const db = getDatabase();
//     const postsRef = dbRef(db, "posts");
  
//     const unsubscribe = onValue(postsRef, (snapshot) => {
//       const postsData = snapshot.val();
//       if (postsData) {
//         const approvedPosts = Object.keys(postsData)
//           .map((key) => ({
//             id: key,
//             ...postsData[key],
//           }))
//           .filter((post) => post.status === "approved");
//         setPosts(approvedPosts);
//       }
//     });
  
//     const user = auth.currentUser;
//     if (user) {
//       const userRef = dbRef(db, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           setUserDetails({
//             username: data.username || "User",
//             avatarUrl: data.avatarUrl || defaultAvatar,
//           });
//         }
//       });
//     }
  
//     return () => unsubscribe();
//   }, []);

//   const handleDeletePost = (postId) => {
//     const db = getDatabase();
//     const postRef = dbRef(db, `posts/${postId}`);
//     const commentsRef = dbRef(db, `postComments/${postId}`);
//     const likesRef = dbRef(db, `posts/${postId}/likes`);
  
//     Promise.all([
//       remove(postRef),
//       remove(commentsRef),
//       remove(likesRef),
//     ])
//       .then(() => {
//         setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
//         console.log("Пост и связанные данные успешно удалены.");
//       })
//       .catch((error) => {
//         console.error("Ошибка удаления поста:", error);
//       });
//   }; 

//   const toggleTextExpansion = (postId) => {
//     setExpandedPosts((prev) => ({
//       ...prev,
//       [postId]: !prev[postId],
//     }));
//   };

//   const openCommentModal = (postId) => {
//     setCommentModal({ isOpen: true, postId });

//     const database = getDatabase();
//     const commentsRef = dbRef(database, `postComments/${postId}`);
//     onValue(commentsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
//         setComments(loadedComments);
//       } else {
//         setComments([]);
//       }
//     });
//   };

//   const closeCommentModal = () => {
//     setCommentModal({ isOpen: false, postId: null });
//     setComments([]);
//     setEditingCommentId(null);
//     setNewComment("");
//   };

//   const handleCommentSubmit = (isAnonymous = false) => {
//     if (newComment.trim() === "") return;

//     const database = getDatabase();
//     const commentRef = dbRef(database, `postComments/${commentModal.postId}`);
//     const postRef = dbRef(database, `posts/${commentModal.postId}`);

//     const formattedTimestamp = new Date().toLocaleString("ru-RU"); 

//     if (editingCommentId) {
//       update(dbRef(database, `postComments/${commentModal.postId}/${editingCommentId}`), {
//         comment: newComment,
//         timestamp: formattedTimestamp,
//       });
//       setEditingCommentId(null);
//     } else {
//       const newCommentRef = push(commentRef);
//       update(newCommentRef, {
//         avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//         username: isAnonymous ? "Анонимно" : userDetails.username,
//         userId: isAnonymous ? null : auth.currentUser?.uid,
//         anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null,
//         comment: newComment,
//         timestamp: formattedTimestamp, 
//       });

//       get(postRef).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== auth.currentUser?.uid) {
//           const notificationRef = dbRef(database, `notifications/${postOwnerId}`);
//           const notificationKey = `comment_${newCommentRef.key}`;
//           set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
//             avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//             username: isAnonymous ? "Анонимно" : userDetails.username,
//             comment: newComment,
//             timestamp: formattedTimestamp,
//             userId: isAnonymous ? null : auth.currentUser?.uid,
//             type: 'comment',
//           }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
//         }
//       });

//       get(commentRef).then((snapshot) => {
//         const commentCount = snapshot.size || 0;
//         update(postRef, { commentCount });
//       });
//     }
//     setNewComment("");
//   };

//   const handleEditComment = (commentId, commentText) => {
//     setEditingCommentId(commentId);
//     setNewComment(commentText);
//     setActionMenuId(null);
//   };

//   const handleDeleteComment = (commentId) => {
//     const database = getDatabase();
//     const commentRef = dbRef(database, `postComments/${commentModal.postId}/${commentId}`);
//     const postRef = dbRef(database, `posts/${commentModal.postId}`);

//     remove(commentRef).then(() => {
//       onValue(dbRef(database, `postComments/${commentModal.postId}`), (snapshot) => {
//         const commentCount = snapshot.size || 0;
//         update(postRef, { commentCount });
//       });
//     });
//   };

//   const handleLikeToggle = (postId) => {
//     if (!userId) return;

//     const db = getDatabase();
//     const postLikesRef = dbRef(db, `posts/${postId}/likes`);

//     const post = posts.find((p) => p.id === postId);
//     const isLiked = post?.likes && post.likes[userId];
//     const updatedLikes = { ...post.likes };

//     if (isLiked) {
//       delete updatedLikes[userId];
//     } else {
//       updatedLikes[userId] = true;
//     }

//     setPosts((prevPosts) =>
//       prevPosts.map((p) => {
//         if (p.id === postId) {
//           return { ...p, likes: updatedLikes };
//         }
//         return p;
//       })
//     );

//     if (isLiked) {
//       update(postLikesRef, { [userId]: null }).catch((error) =>
//         console.error("Ошибка при снятии лайка: ", error)
//       );

//       get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== userId) {
//           const notificationKey = `like_${postId}_${userId}`;
//           const notificationRef = dbRef(database, `notifications/${postOwnerId}/${notificationKey}`);
//           remove(notificationRef).catch((error) => console.error("Ошибка при удалении уведомления: ", error));
//         }
//       });
//     } else {
//       update(postLikesRef, { [userId]: true }).catch((error) =>
//         console.error("Ошибка при добавлении лайка: ", error)
//       );

//       get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
//         const postOwnerId = snapshot.val()?.userId;
//         if (postOwnerId && postOwnerId !== userId) {
//           const notificationKey = `like_${postId}_${userId}`;
//           set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
//             avatarUrl: userDetails.avatarUrl || defaultAvatar,
//             username: userDetails.username || "Пользователь",
//             message: `Пользователю "${userDetails.username}" понравилась ваша публикация`,
//             timestamp: new Date().toLocaleString("ru-RU"),
//             userId: auth.currentUser?.uid,
//             type: 'like',
//           }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const user = auth.currentUser;
  
//     if (user) {
//       const notificationsRef = dbRef(db, `notifications/${user.uid}`);
  
//       onValue(notificationsRef, (snapshot) => {
//         const notifications = snapshot.val();
//         if (notifications) {
//           const unreadCount = Object.values(notifications).filter(
//             (notif) => !notif.isRead
//           ).length;
//           setUnreadCount(unreadCount);
//         } else {
//           setUnreadCount(0);
//         }
//       });
//     }
//   }, []);

//   const toggleActionMenu = (commentId) => {
//     setActionMenuId((prev) => (prev === commentId ? null : commentId));
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isInsideMenu = actionMenuRef.current && actionMenuRef.current.contains(event.target);
//       const isActionButton = event.target.closest(".action-menu button");
      
//       if (!isInsideMenu && !isActionButton) {
//         setActionMenuId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setMenuPostId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
  
//   const [likesModal, setLikesModal] = useState({ isOpen: false, users: [] });

//   const openLikesModal = (postId) => {
//     const db = getDatabase();
//     const likesRef = dbRef(db, `posts/${postId}/likes`);

//     onValue(likesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const likesData = snapshot.val();
//         const userIds = Object.keys(likesData);

//         if (userIds.length === 0) {
//           setLikesModal({ isOpen: true, users: [] });
//           return;
//         }

//         const usersPromises = userIds.map((uid) =>
//           get(dbRef(db, `users/${uid}`)).then((userSnap) => ({
//             userId: uid,
//             username: userSnap.val()?.username || "Пользователь",
//             avatarUrl: userSnap.val()?.avatarUrl || defaultAvatar,
//           }))
//         );

//         Promise.all(usersPromises)
//           .then((users) => {
//             setLikesModal({ isOpen: true, users });
//           })
//           .catch((error) => {
//             console.error("Ошибка при получении данных о пользователях лайков:", error);
//             setLikesModal({ isOpen: true, users: [] });
//           });
//       } else {
//         setLikesModal({ isOpen: true, users: [] });
//       }
//     });
//   };

//   const closeLikesModal = () => {
//     setLikesModal({ isOpen: false, users: [] });
//   };

//   return (
//     <div className="home-container">
//       <main style={{ paddingTop: "70px", paddingBottom: "100px" }}>
//   <section id="posts">
//     {posts.length === 0 ? (
//       <div className="no-posts-message">
//         <h2>Платформа для студентов факультета ТИК Таджикского Технического Университета</h2>
//       </div>
//     ) : (
//       posts
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .map((post) => {
//           const likesCount = post.likes ? Object.keys(post.likes).length : 0;
//           const isLiked = post.likes && post.likes[userId];
//           return (
//             <div key={post.id} className="post-card">
//                       <div key={post.id} className="post-card">
//               <div className="post-header">
//                 <div className="post-author">
//                   <img
//                     src={post.userAvatar || defaultAvatar}
//                     alt="User Avatar"
//                     className="post-avatar"
//                     onClick={() => goToProfile(post.userId)}
//                   />
//                   <span 
//                   className="post-username"
//                   onClick={() => goToProfile(post.userId)}
//                   >{post.userName}</span>
//                 </div>
//                 {post.userId === auth.currentUser?.uid && (
//                   <div className="three-dot-menu">
//                     <span onClick={() => toggleMenu(post.id)}>...</span>
//                     {menuPostId === post.id && (
//                       <div ref={menuRef} className="menu-options">
//                         <span>Изменить</span>
//                         <span onClick={() => handleDeletePost(post.id)}>Удалить</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {post.mediaUrl && (
//                 post.mediaUrl.endsWith(".mp4") ? (
//                   <video controls src={post.mediaUrl} className="post-media" />
//                 ) : (
//                   <img src={post.mediaUrl} alt="Post Media" className="post-media" />
//                 )
//               )}

//               <div className="post-actions">
//                 {isLiked ? (
//                   <FaHeart
//                     className="post-icon liked"
//                     onClick={() => handleLikeToggle(post.id)}
//                     style={{ color: "red" }}
//                   />
//                 ) : (
//                   <FaRegHeart
//                     className="post-icon"
//                     onClick={() => handleLikeToggle(post.id)}
//                   />
//                 )}
//                 <FaRegComment 
//                   className="post-icon" 
//                   onClick={() => openCommentModal(post.id)} 
//                 />
//                 <FaRegBookmark className="post-icon" />
//               </div>

//               <p 
//                 className="post-likes" 
//                 onClick={() => openLikesModal(post.id)}
//                 style={{ cursor: "pointer" }}
//               >
//                 Нравится: {likesCount}
//               </p>

//               <p className="post-content">
//                 <span className="post-username">{post.userName}</span>{" "}
//                 {post.description.length > MAX_TEXT_LENGTH && !expandedPosts[post.id] ? (
//                   <>
//                     {post.description.slice(0, MAX_TEXT_LENGTH)} ...
//                     <span
//                       className="toggle-text"
//                       onClick={() => toggleTextExpansion(post.id)}
//                     >
//                       ещё
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     {post.description}
//                     {post.description.length > MAX_TEXT_LENGTH && (
//                       <span
//                         className="toggle-text"
//                         onClick={() => toggleTextExpansion(post.id)}
//                         style={{ marginLeft: "5px"}}
//                       >
//                         свернуть
//                       </span>
//                     )}
//                   </>
//                 )}
//               </p>

//               <p 
//                 style={{color: "grey", marginLeft: "10px", marginTop: "5px"}} 
//                 onClick={() => openCommentModal(post.id)} 
//               >
//                 Посмотреть все комментарии ({post.commentCount || 0})
//               </p>

//               {commentModal.isOpen && commentModal.postId === post.id && (
//                 <div className="comment-modal-overlay">
//                   <div className="comment-modal">
//                     <div className="modal-header">
//                       <h3>Комментарии</h3>
//                       <button className="close-modal" onClick={closeCommentModal}>
//                         &times;
//                       </button>
//                     </div>
//                     <div className="comments-list">
//                       {comments 
//                       .slice()
//                       .reverse()
//                       .map((comment) => (
//                         <div className="comment" key={comment.id}>
//                           <img 
//                             src={comment.avatarUrl || defaultAvatar} 
//                             alt={comment.username} 
//                             className="comment-avatar" 
//                             onClick={() => goToProfile(comment.userId)}
//                           />
//                           <div className="comment-content">
//                             <p 
//                               className="comment-username"  
//                               onClick={() => goToProfile(comment.userId)}
//                             >
//                               {comment.username}
//                             </p>
//                             <p className="comment-text">{comment.comment}</p>
//                             <span className="comment-timestamp">{comment.timestamp}</span>
//                           </div>
//                           <div ref={actionMenuRef} className="menu-icon-container">
//                             {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
//                               <>
//                                 <GoKebabHorizontal 
//                                   style={{fontSize: "20px", color: "grey"}} 
//                                   onClick={() => toggleActionMenu(comment.id)} 
//                                   className="action-icon"
//                                 />
//                                 {actionMenuId === comment.id && (
//                                   <div className={`action-menu show`}>
//                                     <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
//                                     <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
//                                   </div>
//                                 )}
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="new-comment">
//                       <input
//                         type="text"
//                         placeholder="Напишите комментарий..."
//                         value={newComment}
//                         onChange={(e) => setNewComment(e.target.value)}
//                       />
//                       <button onClick={() => handleCommentSubmit(false)}>Отправить</button>
//                       <button onClick={() => handleCommentSubmit(true)}>Отправить анонимно</button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {likesModal.isOpen && (
//                 <div className="like-modal-overlay">
//                   <div className="like-modal">
//                     <div className="like-modal-header">
//                       <h3>Лайкнувшие пользователи</h3>
//                       <button className="close-like-modal" onClick={closeLikesModal}>
//                         &times;
//                       </button>
//                     </div>
//                     <div className="like-modal-body">
//                       {likesModal.users.length > 0 ? (
//                         likesModal.users.map((user) => (
//                           <div key={user.userId} className="like-user">
//                             <img src={user.avatarUrl} alt={user.username} className="like-avatar" onClick={() => goToProfile(post.userId)} />
//                             <span className="like-username" onClick={() => goToProfile(user.userId)}>{user.username}</span>
//                           </div>
//                         ))
//                       ) : (
//                         <p style={{color: "grey"}}>Нет лайков для этого поста.</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <p className="post-date">{new Date(post.createdAt).toLocaleString("ru-RU")}</p>
//             </div>
//             </div>
//           );
//         })
//     )}
//   </section>
// </main>
//     </div>
//   );
// };

// export default HomePage;












//оригинал
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, get, push, set, update, remove } from "firebase/database";
import { auth, database } from "../firebase";
import defaultAvatar from "../default-image.png";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";
import defaultImage from "../Ttulogo.jpg";
import glkorpusosimi from "../glkorpusosimi.jpg";
import osimi from "../osimi.png";
import photo from "../Каримзода.jpg";
import "../App.css";
import "../PostForm.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import anonymAvatar from '../anonym2.jpg';
import teacherImage from "../teacher.png";
import ttustudents from "../ttustudents.jpg";
import ttustudents1 from "../ttustudents1.jpg";
import ttustudents2 from "../ttustudents2.jpg";
import ttustudents3 from "../ttustudents3.jpg";
import { GoKebabHorizontal } from "react-icons/go";
import { motion } from 'framer-motion';
import { BsChatTextFill } from "react-icons/bs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlusCircle, FaHeart, FaRegHeart, FaRegComment, FaRegBookmark } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faBell } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [posts, setPosts] = useState([]);
  const [menuPostId, setMenuPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({}); // Для отслеживания состояния каждого поста
  const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);
  const menuRef = useRef(null);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const userId = auth.currentUser?.uid; // Текущий пользователь
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

     // Функция для успешных уведомлений
     const showNotification = (message) => {
      setNotificationType("success");
      setNotification(message);
      setTimeout(() => {
        setNotification("");
        setNotificationType("");
      }, 3000);
    };
    
    // Функция для нейтральных уведомлений
    const showNotificationNeutral = (message) => {
      setNotificationType("neutral");
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

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
  const MAX_TEXT_LENGTH = 100; // Максимальное количество символов до сокращения текста

  const toggleMenuu = () => {
    if (isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 0);
    } else {
      setIsMenuOpen(true);
    }
  };

  const toggleMenu = (postId) => {
    setMenuPostId(postId === menuPostId ? null : postId);
  };

  useEffect(() => {
    const db = getDatabase();
    const user = auth.currentUser;
  
    if (user) {
      const chatsRef = dbRef(db, `users/${user.uid}/chats`);
      const unsubscribeChats = onValue(chatsRef, (snapshot) => {
        const chats = snapshot.val();
        if (chats) {
          const chatIds = Object.keys(chats);
          let totalUnreadCount = 0;
  
          chatIds.forEach((chatId) => {
            const messagesRef = dbRef(db, `chatRooms/${chatId}/messages`);
            const unsubscribeMessages = onValue(messagesRef, (messagesSnapshot) => {
              const messages = messagesSnapshot.val();
              if (messages) {
                const unreadMessages = Object.values(messages).filter(
                  (msg) => !msg.seenBy?.includes(user.uid) && msg.senderId !== user.uid
                );
  
                if (unreadMessages.length > 0) {
                  totalUnreadCount += 1;
                }
              }
            });
  
            return () => unsubscribeMessages();
          });
  
          setUnreadChatsCount(totalUnreadCount);
        } else {
          setUnreadChatsCount(0);
        }
      });
  
      return () => unsubscribeChats();
    }
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Получаем URL аватарки пользователя
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatarUrl) {
          setUserAvatarUrl(userData.avatarUrl);
        } else {
          setUserAvatarUrl(defaultAvatar); // Изображение по умолчанию
        }
      });
    }
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const postsRef = dbRef(db, "posts");
  
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const approvedPosts = Object.keys(postsData)
          .map((key) => ({
            id: key,
            ...postsData[key],
          }))
          .filter((post) => post.status === "approved"); // Фильтруем только одобренные посты
        setPosts(approvedPosts);
      }
    });
  
    // Загрузка данных текущего пользователя
    const user = auth.currentUser;
    if (user) {
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserDetails({
            username: data.username || "User",
            avatarUrl: data.avatarUrl || defaultAvatar,
          });
        }
      });
    }
  
    return () => unsubscribe(); // Отписываемся от слушателя при размонтировании компонента
  }, []);

  const handleDeletePost = (postId) => {
    const db = getDatabase();
    const postRef = dbRef(db, `posts/${postId}`);
    const commentsRef = dbRef(db, `postComments/${postId}`);
    const likesRef = dbRef(db, `posts/${postId}/likes`);
  
    // Удаляем пост, лайки и комментарии
    Promise.all([
      remove(postRef),
      remove(commentsRef),
      remove(likesRef),
    ])
      .then(() => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        console.log("Пост и связанные данные успешно удалены.");
        showNotificationNeutral("Вы удалили свою публикацию.");
      })
      .catch((error) => {
        console.error("Ошибка удаления поста:", error);
      });
  }; 

  const toggleTextExpansion = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Переключение между свернутым и развернутым состоянием
    }));
  };

  const openCommentModal = (postId) => {
    setCommentModal({ isOpen: true, postId });

    const database = getDatabase();
    const commentsRef = dbRef(database, `postComments/${postId}`);
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
        setComments(loadedComments);
      } else {
        setComments([]);
      }
    });
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, postId: null });
    setComments([]);
    setEditingCommentId(null);
    setNewComment("");
  };

  const handleCommentSubmit = (isAnonymous = false) => {
    if (newComment.trim() === "") return;

    const database = getDatabase();
    const commentRef = dbRef(database, `postComments/${commentModal.postId}`);
    const postRef = dbRef(database, `posts/${commentModal.postId}`);

    const formattedTimestamp = new Date().toLocaleString("ru-RU"); // Форматируем дату для записи

    if (editingCommentId) {
      update(dbRef(database, `postComments/${commentModal.postId}/${editingCommentId}`), {
        comment: newComment,
        timestamp: formattedTimestamp, // Используем читаемую дату
      });
      setEditingCommentId(null);
    } else {
      const newCommentRef = push(commentRef);
      update(newCommentRef, {
        avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
        username: isAnonymous ? "Анонимно" : userDetails.username,
        userId: isAnonymous ? null : auth.currentUser?.uid,
        anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null,
        comment: newComment,
        timestamp: formattedTimestamp, // Используем читаемую дату
      });

      // Уведомление владельца поста
      get(postRef).then((snapshot) => {
        const postOwnerId = snapshot.val()?.userId;
        if (postOwnerId && postOwnerId !== auth.currentUser?.uid) {
          const notificationRef = dbRef(database, `notifications/${postOwnerId}`);
          const notificationKey = `comment_${newCommentRef.key}`; // Уникальный ключ для комментария
          set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
            avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
            username: isAnonymous ? "Анонимно" : userDetails.username,
            comment: newComment,
            timestamp: formattedTimestamp, // Используем читаемую дату
            userId: isAnonymous ? null : auth.currentUser?.uid,
            type: 'comment',
          }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
        }
      });

      // Обновление commentCount
      get(commentRef).then((snapshot) => {
        const commentCount = snapshot.size || 0;
        update(postRef, { commentCount });
      });
    }
    setNewComment("");
  };

  const handleEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setNewComment(commentText);
    setActionMenuId(null); // Закрыть меню
  };

  const handleDeleteComment = (commentId) => {
    const database = getDatabase();
    const commentRef = dbRef(database, `postComments/${commentModal.postId}/${commentId}`);
    const postRef = dbRef(database, `posts/${commentModal.postId}`);

    remove(commentRef).then(() => {
      onValue(dbRef(database, `postComments/${commentModal.postId}`), (snapshot) => {
        const commentCount = snapshot.size || 0;
        update(postRef, { commentCount });
      });
    });
  };

  // Обработчик нажатия на лайк
  const handleLikeToggle = (postId) => {
    if (!userId) return; // Убедитесь, что пользователь авторизован

    const db = getDatabase();
    const postLikesRef = dbRef(db, `posts/${postId}/likes`);

    const post = posts.find((p) => p.id === postId);
    const isLiked = post?.likes && post.likes[userId];
    const updatedLikes = { ...post.likes };

    if (isLiked) {
      delete updatedLikes[userId]; // Удаляем лайк локально
    } else {
      updatedLikes[userId] = true; // Добавляем лайк локально
    }

    // Обновляем состояние постов
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );

    // Обновляем данные в Firebase
    if (isLiked) {
      // Снимаем лайк
      update(postLikesRef, { [userId]: null }).catch((error) =>
        console.error("Ошибка при снятии лайка: ", error)
      );

      // Удаляем уведомление о лайке
      get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
        const postOwnerId = snapshot.val()?.userId;
        if (postOwnerId && postOwnerId !== userId) {
          const notificationKey = `like_${postId}_${userId}`;
          const notificationRef = dbRef(database, `notifications/${postOwnerId}/${notificationKey}`);
          remove(notificationRef).catch((error) => console.error("Ошибка при удалении уведомления: ", error));
        }
      });
    } else {
      // Добавляем лайк
      update(postLikesRef, { [userId]: true }).catch((error) =>
        console.error("Ошибка при добавлении лайка: ", error)
      );

      // Добавляем уведомление о лайке
      get(dbRef(database, `posts/${postId}`)).then((snapshot) => {
        const postOwnerId = snapshot.val()?.userId;
        if (postOwnerId && postOwnerId !== userId) {
          const notificationKey = `like_${postId}_${userId}`;
          set(dbRef(database, `notifications/${postOwnerId}/${notificationKey}`), {
            avatarUrl: userDetails.avatarUrl || defaultAvatar,
            username: userDetails.username || "Пользователь",
            message: `Пользователю "${userDetails.username}" понравилась ваша публикация`,
            timestamp: new Date().toLocaleString("ru-RU"), // Читаемый формат даты
            userId: auth.currentUser?.uid,
            type: 'like',
          }).catch((error) => console.error("Ошибка при добавлении уведомления: ", error));
        }
      });
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const user = auth.currentUser;
  
    if (user) {
      const notificationsRef = dbRef(db, `notifications/${user.uid}`);
  
      onValue(notificationsRef, (snapshot) => {
        const notifications = snapshot.val();
        if (notifications) {
          const unreadCount = Object.values(notifications).filter(
            (notif) => !notif.isRead
          ).length;
          setUnreadCount(unreadCount);
        } else {
          setUnreadCount(0);
        }
      });
    }
  }, []);

  const toggleActionMenu = (commentId) => {
    setActionMenuId((prev) => (prev === commentId ? null : commentId));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideMenu = actionMenuRef.current && actionMenuRef.current.contains(event.target);
      const isActionButton = event.target.closest(".action-menu button");
      
      // Закрываем меню только если клик произошел за пределами actionMenu и не на кнопках
      if (!isInsideMenu && !isActionButton) {
        setActionMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Если клик вне menu-options, закрываем меню
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuPostId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 50 },
    },
  };
  
  // Модальное окно для отображения пользователей, поставивших лайк
  const [likesModal, setLikesModal] = useState({ isOpen: false, users: [] });

  const openLikesModal = (postId) => {
    const db = getDatabase();
    const likesRef = dbRef(db, `posts/${postId}/likes`);

    onValue(likesRef, (snapshot) => {
      if (snapshot.exists()) {
        const likesData = snapshot.val();
        const userIds = Object.keys(likesData);

        if (userIds.length === 0) {
          setLikesModal({ isOpen: true, users: [] });
          return;
        }

        // Получаем данные о пользователях, поставивших лайк
        const usersPromises = userIds.map((uid) =>
          get(dbRef(db, `users/${uid}`)).then((userSnap) => ({
            userId: uid,
            username: userSnap.val()?.username || "Пользователь",
            avatarUrl: userSnap.val()?.avatarUrl || defaultAvatar,
          }))
        );

        Promise.all(usersPromises)
          .then((users) => {
            setLikesModal({ isOpen: true, users });
          })
          .catch((error) => {
            console.error("Ошибка при получении данных о пользователях лайков:", error);
            setLikesModal({ isOpen: true, users: [] });
          });
      } else {
        setLikesModal({ isOpen: true, users: [] });
      }
    });
  };

  const closeLikesModal = () => {
    setLikesModal({ isOpen: false, users: [] });
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  }

  return (
    <div className="glava">
<div className="app">
      <div className="hp-header">
        <div className="hp-header-logo">
          <img src={basiclogo} alt="Логотип" />
        </div>
        <div className="hp-header-title">
        <h1>
          ФАКУЛТЕТИ ТЕХНОЛОГИЯҲОИ РАҚАМӢ,
        </h1>
        <h1>СИСТЕМАҲО ВА ҲИФЗИ ИТТИЛООТ</h1>
        </div>
        <div className="hp-header-icon">
          <img src={ttulogo} alt="Логотип 2" />
        </div>
      </div>

      <nav className="hp-navbar">
        <ul>
          <li><Link to="/home">Асосӣ</Link></li>
            <li><Link to="/about">Факултет</Link></li>
            <li>Кафедраҳо</li>
            <li><Link to="/teachers">Омӯзгорон</Link></li>
            <li><Link to="/schedule">Ҷадвали дарсҳо</Link></li>
            <li><Link to="/library">Китобхонаи электронӣ</Link></li>
            <li><Link to="/contacts">Тамос</Link></li>
        </ul>
      </nav>

      <main className="hp-main-content">
        <section className="slider-section">
        <h2 className="section-title" style={{color: "black"}}>Галерея</h2>
        <Swiper className="swiper"
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          spaceBetween={30}
          slidesPerView={1}
          loop
        >
          <SwiperSlide><img style={{width: "100%"}} src={glkorpusosimi} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents1} alt="Фото 2" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents2} alt="Фото 3" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents3} alt="Фото 4" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents1} alt="Фото 2" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents2} alt="Фото 3" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents3} alt="Фото 4" /></SwiperSlide>
        </Swiper>
      </section>
        <section className="hp-news-section">
          <div className="hp-news-run">
            <marquee behavior="scroll" direction="left">
            <div class="scrolling-banner">
              <div class="scrolling-text">
                <pre>
                 ИҚТИБОС АЗ УМАРИ ХАЙЁМ:  „Не верь тому, кто говорит красиво, в его словах всегда игра. Поверь тому, кто молчаливо, творит красивые дела.“    „Молчанье — щит от многих бед, А болтовня всегда во вред. Язык у человека мал, Но сколько жизней он сломал.“  | Умари Хайём |
                </pre>
              </div>
            </div>
            </marquee>
          </div>
          <h2>Хабарҳои охирин</h2>
          <div className="hp-news-grid">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="hp-news-item">
                  <div className="hp-news-date">02/12/2024</div>
                  <img
                    src={photo}
                    alt="News"
                    className="hp-news-image"
                  />
                  <p>Масъалаҳои муосири саноати мошинсозӣ</p>
                </div>
              ))}
          </div>
        </section>
      </main>

      <footer className="hp-footer">
        <p>
          Донишгоҳи техникии Тоҷикистон ба номи академик М.С. Осимӣ
          <br />
          Чумҳурии Тоҷикистон, 734042, ш. Душанбе, хиёбони академик Раҳимҷонов
          10
        </p>
        <p>Email: info@ttu.tj, ttu@ttu.tj</p>
        <p>+992 (372) 21-35-11 | +992 (372) 23-02-46</p>
      </footer>
    </div>

    <div className="home-container" onContextMenu={handleContextMenu}>
      {notification && (
        <div className={`notification ${notificationType}`}>
          {notification}
        </div>
      )}

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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              {/* <FaUser className="user-icon"></FaUser> */}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-nav-2">

          {/* <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} /> */}

          <Link to="/notifications">
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon icon={faBell} style={{marginLeft: "15px"}} className="footer-icon" />
              {unreadCount > 0 && (
                <span className="notification-count">
              {unreadCount}
                </span>
              )}
            </div>
          </Link>

          <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>

          <Link to="/chats">
  <div style={{ position: "relative" }}>
    <BsChatTextFill style={{ fontSize: "25px", marginRight: "15px", color: "white" }} />
    {unreadChatsCount > 0 && (
      <span className="notification-chat-count">
        {unreadChatsCount}
      </span>
    )}
  </div>
</Link>
          <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenuu}>          
            <span className="bm-span"></span>
            <span className="bm-span"></span>
            <span className="bm-span"></span>
          </div>

          <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
          <ul>
             <li><Link to="/home"><FontAwesomeIcon icon={faHome} style={{color: "red"}} /> Главная</Link></li>
             <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
             <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
             <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
             <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
             <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
             <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
          </ul>
          </div>

        </div>
      </header>

      <main style={{ paddingTop: "70px", paddingBottom: "100px" }}>
  <section id="posts">
    {posts.length === 0 ? (
      <div className="no-posts-message">
        <h2>Платформа для студентов факультета ТИК Таджикского Технического Университета</h2>
      </div>
    ) : (
      posts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((post) => {
          const likesCount = post.likes ? Object.keys(post.likes).length : 0;
          const isLiked = post.likes && post.likes[userId];
          return (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <img
                    src={post.userAvatar || defaultAvatar}
                    alt="User Avatar"
                    className="post-avatar"
                    onClick={() => goToProfile(post.userId)}
                  />
                  <span 
                  className="post-username"
                  onClick={() => goToProfile(post.userId)}
                  >{post.userName}</span>
                </div>
                {post.userId === auth.currentUser?.uid && (
                  <div className="three-dot-menu">
                    <span onClick={() => toggleMenu(post.id)}>...</span>
                    {menuPostId === post.id && (
                      <div ref={menuRef} className="menu-options">
                        <span>Изменить</span>
                        <span onClick={() => handleDeletePost(post.id)}>Удалить</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {post.mediaUrl && (
                post.mediaUrl.endsWith(".mp4") ? (
                  <video controls src={post.mediaUrl} className="post-media" />
                ) : (
                  <img src={post.mediaUrl} alt="Post Media" className="post-media" />
                )
              )}

              <div className="post-actions">
                {isLiked ? (
                  <FaHeart
                    className="post-icon liked"
                    onClick={() => handleLikeToggle(post.id)}
                    style={{ color: "red" }}
                  />
                ) : (
                  <FaRegHeart
                    className="post-icon"
                    onClick={() => handleLikeToggle(post.id)}
                  />
                )}
                <FaRegComment 
                  className="post-icon" 
                  onClick={() => openCommentModal(post.id)} 
                />
                <FaRegBookmark className="post-icon" />
              </div>

              <p 
                className="post-likes" 
                onClick={() => openLikesModal(post.id)}
                style={{ cursor: "pointer" }}
              >
                Нравится: {likesCount}
              </p>

              <p className="post-content">
                <span className="post-username">{post.userName}</span>{" "}
                {post.description.length > MAX_TEXT_LENGTH && !expandedPosts[post.id] ? (
                  <>
                    {post.description.slice(0, MAX_TEXT_LENGTH)} ...
                    <span
                      className="toggle-text"
                      onClick={() => toggleTextExpansion(post.id)}
                    >
                      ещё
                    </span>
                  </>
                ) : (
                  <>
                    {post.description}
                    {post.description.length > MAX_TEXT_LENGTH && (
                      <span
                        className="toggle-text"
                        onClick={() => toggleTextExpansion(post.id)}
                        style={{ marginLeft: "5px"}}
                      >
                        свернуть
                      </span>
                    )}
                  </>
                )}
              </p>

              <p 
                style={{color: "grey", marginLeft: "10px", marginTop: "5px"}} 
                onClick={() => openCommentModal(post.id)} 
              >
                Посмотреть все комментарии ({post.commentCount || 0})
              </p>

              {commentModal.isOpen && commentModal.postId === post.id && (
                <div className="comment-modal-overlay">
                  <div className="comment-modal">
                    <div className="modal-header">
                      <h3>Комментарии</h3>
                      <button className="close-modal" onClick={closeCommentModal}>
                        &times;
                      </button>
                    </div>
                    <div className="comments-list">
                      {comments 
                      .slice()
                      .reverse()
                      .map((comment) => (
                        <div className="comment" key={comment.id}>
                          <img 
                            src={comment.avatarUrl || defaultAvatar} 
                            alt={comment.username} 
                            className="comment-avatar" 
                            onClick={() => goToProfile(comment.userId)}
                          />
                          <div className="comment-content">
                            <p
                              className="comment-username"
                              onClick={() => goToProfile(comment.userId)}
                            >
                              {comment.username}
                            </p>
                            <p className="comment-text">{comment.comment}</p>
                            <span className="comment-timestamp">{comment.timestamp}</span>
                          </div>
                          <div ref={actionMenuRef} className="menu-icon-container">
                            {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
                              <>
                                <GoKebabHorizontal 
                                  style={{fontSize: "20px", color: "grey"}} 
                                  onClick={() => toggleActionMenu(comment.id)} 
                                  className="action-icon"
                                />
                                {actionMenuId === comment.id && (
                                  <div className={`action-menu show`}>
                                    <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
                                    <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="new-comment">
                      <input
                        type="text"
                        placeholder="Напишите комментарий..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button onClick={() => handleCommentSubmit(false)}>Отправить</button>
                      <button onClick={() => handleCommentSubmit(true)}>Отправить анонимно</button>
                    </div>
                  </div>
                </div>
              )}

              {likesModal.isOpen && (
                <div className="like-modal-overlay">
                  <div className="like-modal">
                    <div className="like-modal-header">
                      <h3>Лайкнувшие пользователи</h3>
                      <button className="close-like-modal" onClick={closeLikesModal}>
                        &times;
                      </button>
                    </div>
                    <div className="like-modal-body">
                      {likesModal.users.length > 0 ? (
                        likesModal.users.map((user) => (
                          <div key={user.userId} className="like-user">
                            <img src={user.avatarUrl} alt={user.username} className="like-avatar" onClick={() => goToProfile(post.userId)} />
                            <span className="like-username" onClick={() => goToProfile(user.userId)}>{user.username}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{color: "grey"}}>Нет лайков для этого поста.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <p className="post-date">{new Date(post.createdAt).toLocaleString("ru-RU")}</p>
            </div>
          );
        })
    )}
  </section>
</main>

      <footer className="footer-desktop">
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <motion.nav 
          variants={navbarVariants} 
          initial="hidden" 
          animate="visible" 
          className="footer-nav"
        >
          <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon active-icon" style={{ }} /></Link>
          <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
          <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
          <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
          <Link to="/myprofile">
            <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
          </Link>
        </motion.nav> 
      </div>
    </div>
    </div>
  );
};

export default HomePage;