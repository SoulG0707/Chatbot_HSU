import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [chats, setChats] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [question, setQuestion] = useState("");
  const [editingName, setEditingName] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatBoxRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [newMajor, setNewMajor] = useState("");
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  useEffect(() => {
    console.log("Role sau khi login:", role);
  }, [role]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chats, activeIndex]);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Sai thông tin đăng nhập");
      const data = await res.json();
      setIsLoggedIn(true);
      setRole(data.role);
      setShowAvatarMenu(false); // Đảm bảo menu không tự động hiển thị sau khi đăng nhập
    } catch (err) {
      alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setChats([]);
    setActiveIndex(0);
    setQuestion("");
    setShowAvatarMenu(false); // Đảm bảo menu đóng khi đăng xuất
  };

  const addNewChat = () => {
    setChats([
      ...chats,
      {
        name: `Chat ${chats.length + 1}`,
        major: null,
        messages: [
          {
            sender: "bot",
            text: "Chào bạn! Bạn học ngành gì?",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      },
    ]);
    setActiveIndex(chats.length);
    setShowAvatarMenu(false); // Đảm bảo menu không tự động hiển thị sau khi tạo chat mới
  };

  const uploadMajor = async () => {
    if (!newMajor || !file) {
      alert("Điền tên ngành và chọn file.");
      return;
    }
    const formData = new FormData();
    formData.append("username", username);
    formData.append("major", newMajor);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/admin/upload_major", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || "Đã tải lên thành công.");
      setShowUploadModal(false); // Đóng modal sau khi tải lên thành công
    } catch (err) {
      alert("Lỗi khi tải lên ngành mới.");
      setShowUploadModal(false); // Đóng modal ngay cả khi có lỗi
    }
  };

  const deleteChat = (i) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đoạn chat này?")) return;
    const updated = chats.filter((_, idx) => idx !== i);
    setChats(updated);
    if (activeIndex === i) {
      setActiveIndex(0);
    } else if (activeIndex > i) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleMajorSelect = (major) => {
    const updated = [...chats];
    updated[activeIndex].major = major;
    updated[activeIndex].messages.push(
      {
        sender: "user",
        text: major,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        sender: "bot",
        text: `Bạn đã chọn ngành "${major}". Mời bạn đặt câu hỏi!`,
        timestamp: new Date().toLocaleTimeString(),
      }
    );
    setChats(updated);
  };

  const updateChat = (newMessages) => {
    const updated = [...chats];
    updated[activeIndex].messages = [
      ...updated[activeIndex].messages,
      ...newMessages,
    ];
    setChats(updated);
  };

  const handleSend = async (text = null) => {
    const input = text ?? question;
    if (!input.trim()) return;

    const current = chats[activeIndex];
    updateChat([
      {
        sender: "user",
        text: input,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setQuestion("");

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          major: current.major,
          username: username,
          chat_id: activeIndex,
        }),
      });

      const data = await res.json();
      updateChat([
        {
          sender: "bot",
          text: data.answer,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      updateChat([
        {
          sender: "bot",
          text: "Lỗi kết nối đến AI!",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const renameChat = (i, newName) => {
    const updated = [...chats];
    updated[i].name = newName;
    setChats(updated);
  };

  const current = chats[activeIndex] || { messages: [], major: null, name: "" };
  const suggestedMap = {
    "Trí tuệ nhân tạo": [
      {
        label: "Mục tiêu ngành AI",
        full: "Mục tiêu của ngành Trí tuệ nhân tạo là gì?",
      },
      {
        label: "Hướng đào tạo",
        full: "Ngành Trí tuệ nhân tạo đào tạo theo hướng nào?",
      },
      {
        label: "Lĩnh vực việc làm",
        full: "Sinh viên tốt nghiệp ngành AI có thể làm việc trong những lĩnh vực nào?",
      },
      {
        label: "Tổng tín chỉ",
        full: "Ngành Trí tuệ nhân tạo có bao nhiêu tín chỉ?",
      },
      {
        label: "Thời gian học",
        full: "Ngành Trí tuệ nhân tạo học trong bao nhiêu năm?",
      },
      {
        label: "Tín chỉ bắt buộc / tự chọn",
        full: "Bao nhiêu tín chỉ là bắt buộc, bao nhiêu là tự chọn?",
      },
      {
        label: "Tín chỉ tốt nghiệp",
        full: "Sinh viên cần hoàn thành những tín chỉ nào để tốt nghiệp?",
      },
      {
        label: "Chuẩn đầu ra",
        full: "Chuẩn đầu ra của ngành Trí tuệ nhân tạo gồm những gì?",
      },
      {
        label: "Kỹ năng sau tốt nghiệp",
        full: "Sinh viên sau khi tốt nghiệp cần đạt những kỹ năng gì?",
      },
      {
        label: "Yêu cầu tiếng Anh",
        full: "Ngành Trí tuệ nhân tạo có yêu cầu về kỹ năng tiếng Anh không?",
      },
      {
        label: "Môn đại cương",
        full: "Những môn học đại cương trong chương trình đào tạo là gì?",
      },
      {
        label: "Môn chuyên ngành",
        full: "Các môn chuyên ngành bắt buộc của ngành Trí tuệ nhân tạo gồm những gì?",
      },
      {
        label: "Học AI nâng cao",
        full: "Ngành Trí tuệ nhân tạo có học môn Trí tuệ nhân tạo nâng cao không?",
      },
      {
        label: "Học máy / học sâu",
        full: "Có môn học nào liên quan đến học sâu hoặc học máy không?",
      },
      {
        label: "Trình độ tiếng Anh đầu vào",
        full: "Sinh viên cần trình độ tiếng Anh đầu vào như thế nào?",
      },
      {
        label: "Điều kiện tốt nghiệp",
        full: "Điều kiện để được xét tốt nghiệp ngành Trí tuệ nhân tạo là gì?",
      },
      {
        label: "Khóa luận hay thực tập",
        full: "Sinh viên có thể làm khóa luận hay thực tập tốt nghiệp?",
      },
    ],
    "Công nghệ thông tin": [
      {
        label: "Mục tiêu đào tạo",
        full: "Mục tiêu của ngành Công nghệ thông tin là gì?",
      },
      {
        label: "Chuẩn đầu ra về kiến thức",
        full: "Chuẩn đầu ra kiến thức ngành CNTT gồm những gì?",
      },
      {
        label: "Kỹ năng nghề nghiệp",
        full: "Sinh viên CNTT được đào tạo kỹ năng gì?",
      },
      {
        label: "Trách nhiệm nghề nghiệp",
        full: "Ngành CNTT yêu cầu sinh viên có trách nhiệm gì?",
      },
      {
        label: "Làm việc nhóm",
        full: "Ngành CNTT có rèn luyện kỹ năng làm việc nhóm không?",
      },
      {
        label: "Các ngành nghề phù hợp",
        full: "Ngành CNTT có thể làm ở lĩnh vực nào sau khi ra trường?",
      },
      {
        label: "Các vị trí cụ thể",
        full: "Sinh viên CNTT có thể làm ở những vị trí nào?",
      },
      {
        label: "Số tín chỉ toàn khóa",
        full: "Ngành CNTT có bao nhiêu tín chỉ?",
      },
      {
        label: "Môn học tự chọn",
        full: "Ngành CNTT có những môn học tự chọn nào?",
      },
      {
        label: "Tốt nghiệp cần những điều kiện gì?",
        full: "Sinh viên CNTT cần điều kiện gì để tốt nghiệp?",
      },
      {
        label: "Học phần đại cương",
        full: "Ngành CNTT có những học phần đại cương nào?",
      },
      {
        label: "Môn lập trình",
        full: "Ngành CNTT học những môn lập trình nào?",
      },
      {
        label: "Tự chọn theo hướng ngành",
        full: "Ngành CNTT có những hướng ngành tự chọn nào?",
      },
    ],
    "Kỹ thuật phần mềm": [
      {
        label: "Mục tiêu chung",
        full: "Ngành Kỹ thuật phần mềm có mục tiêu đào tạo gì?",
      },
      {
        label: "Chuẩn đầu ra kiến thức",
        full: "Ngành KTPM yêu cầu chuẩn đầu ra về kiến thức gì?",
      },
      {
        label: "Chuẩn đầu ra kỹ năng",
        full: "Sinh viên KTPM cần đạt kỹ năng gì khi tốt nghiệp?",
      },
      {
        label: "Giao tiếp và tiếng Anh",
        full: "Ngành KTPM yêu cầu trình độ tiếng Anh như thế nào?",
      },
      { label: "Tổng tín chỉ", full: "Ngành KTPM có bao nhiêu tín chỉ?" },
      {
        label: "Các môn lập trình",
        full: "Ngành KTPM học các môn lập trình nào?",
      },
      {
        label: "Các môn kiểm thử",
        full: "Ngành KTPM có học kiểm thử phần mềm không?",
      },
      {
        label: "Cơ hội việc làm",
        full: "Sinh viên KTPM có thể làm việc ở đâu sau khi ra trường?",
      },
      {
        label: "Các vị trí nghề nghiệp",
        full: "Ngành KTPM đào tạo sinh viên cho các vị trí nào?",
      },
      {
        label: "Chọn hướng ngành",
        full: "Sinh viên KTPM có thể chọn những hướng ngành nào?",
      },
      {
        label: "Tốt nghiệp cần gì?",
        full: "Điều kiện tốt nghiệp của ngành KTPM là gì?",
      },
      {
        label: "Khác biệt với CNTT",
        full: "Ngành KTPM khác gì với ngành CNTT?",
      },
      { label: "Môn đồ án", full: "Ngành có học phần đồ án phần mềm không?" },
    ],
  };
  const suggestedQuestions = suggestedMap[current.major] || [];

  if (!isLoggedIn) {
    return (
      <div
        className={`container ${darkMode ? "dark" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          height: "100vh",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>
          Hệ thống Chatbot tư vấn ngành học HSU
        </h1>
        <p style={{ fontSize: 18, marginBottom: 40 }}>
          Vui lòng đăng nhập để sử dụng hệ thống.
        </p>
        <form
          className="login-form-box"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-button">
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`container ${darkMode ? "dark" : ""}`}>
      <div className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "❮" : "❯"}
        </button>

        {sidebarOpen && (
          <>
            <button onClick={addNewChat}>Cuộc trò chuyện mới</button>
            {chats
              .filter((chat) =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((chat, i) => (
                <div
                  key={i}
                  className={`chat-tab ${i === activeIndex ? "active" : ""}`}
                >
                  <div
                    onClick={() => setActiveIndex(i)}
                    onDoubleClick={() => setEditingName(i)}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
                    {editingName === i ? (
                      <input
                        autoFocus
                        value={chat.name}
                        onChange={(e) => renameChat(i, e.target.value)}
                        onBlur={() => setEditingName(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            renameChat(i, e.target.value);
                            setEditingName(null);
                          }
                        }}
                      />
                    ) : (
                      chat.name
                    )}
                  </div>
                  <img
                    src="/logo_svg/delete.svg"
                    alt="xóa"
                    onClick={() => deleteChat(i)}
                    style={{
                      width: 16,
                      height: 16,
                      marginLeft: 8,
                      cursor: "pointer",
                    }}
                  />
                </div>
              ))}
            <div className="spacer" />
            <button
              className="toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <img
                  src="/logo_svg/sun.svg"
                  alt="Sáng"
                  style={{ width: 20, height: 20 }}
                />
              ) : (
                <img
                  src="/logo_svg/moon.svg"
                  alt="Tối"
                  style={{ width: 20, height: 20 }}
                />
              )}
            </button>
          </>
        )}
      </div>

      <div className="main">
        <div className="avatar-container">
          <img
            src="/logo_svg/avatar.svg"
            alt="avatar"
            className="avatar-icon"
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
          />
          {showAvatarMenu && (
            <div className="avatar-dropdown">
              {role === "admin" && (
                <button onClick={() => {
                  setShowUploadModal(true);
                  setShowAvatarMenu(false); // Đóng menu sau khi nhấp vào tùy chỉnh nội dung
                }}>
                  Tùy chỉnh nội dung
                </button>
              )}
              <button onClick={() => {
                handleLogout();
                setShowAvatarMenu(false); // Đóng menu sau khi đăng xuất
              }} className="logout-button">
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        <div className="chat-box" ref={chatBoxRef}>
          {current.messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <span>
                <b>{msg.sender === "user" ? "Bạn" : "AI"}:</b> {msg.text}
              </span>
              <br />
              <small>{msg.timestamp}</small>
            </div>
          ))}
        </div>

        {chats.length === 0 && (
          <div
            className="select-major"
            style={{ marginTop: 50, textAlign: "center", width: "100%" }}
          >
            <p>Bạn chưa có cuộc trò chuyện nào.</p>
            <button style={{ padding: 16, fontSize: 16 }} onClick={addNewChat}>
              Tạo đoạn chat mới
            </button>
          </div>
        )}

        {!current.major && chats.length > 0 && (
          <div className="select-major">
            <p>Chọn ngành học của bạn:</p>
            <button onClick={() => handleMajorSelect("Trí tuệ nhân tạo")}>
              Trí tuệ nhân tạo
            </button>
            <button onClick={() => handleMajorSelect("Công nghệ thông tin")}>
              Công nghệ thông tin
            </button>
            <button onClick={() => handleMajorSelect("Kỹ thuật phần mềm")}>
              Kỹ thuật phần mềm
            </button>
          </div>
        )}

        {current.major && (
          <>
            <div className="input-area">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
              />
              <button onClick={() => handleSend()}>Gửi</button>
            </div>

            <div style={{ textAlign: "right", marginTop: 10 }}>
              <button
                className="toggle-suggest-icon"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <img
                  src={
                    showSuggestions
                      ? "/logo_svg/arrow-circle-right.svg"
                      : "/logo_svg/arrow-circle-left.svg"
                  }
                  alt="toggle"
                  style={{ width: 24, height: 24 }}
                />
              </button>
            </div>

            {showSuggestions && (
              <div className="suggested-questions">
                <p>Câu hỏi gợi ý:</p>
                <div className="question-grid">
                  {suggestedQuestions.map((q, i) => (
                    <button key={i} onClick={() => handleSend(q.full)}>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal upload ngành: luôn hiển thị đúng */}
      {showUploadModal && (
        <div className="search-modal">
          <div className="search-box">
            <h3>Thêm ngành đào tạo mới</h3>
            <input
              type="text"
              placeholder="Tên ngành"
              value={newMajor}
              onChange={(e) => setNewMajor(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginBottom: 10 }}
            />
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button onClick={() => setShowUploadModal(false)}>Hủy</button>
              <button onClick={uploadMajor}>Tải lên</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tìm kiếm đoạn chat */}
      {showSearch && (
        <div className="search-modal">
          <div className="search-box">
            <div className="search-header">
              <input
                type="text"
                placeholder="Tìm kiếm đoạn chat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="close-btn"
                onClick={() => setShowSearch(false)}
              >
                ✕
              </button>
            </div>

            <div className="search-results">
              <button onClick={addNewChat} className="search-new">
                Đoạn chat mới
              </button>
              <hr />
              {chats
                .filter((chat) =>
                  chat.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((chat, i) => (
                  <div
                    key={i}
                    className="search-item"
                    onClick={() => {
                      setActiveIndex(i);
                      setShowSearch(false);
                    }}
                  >
                    {chat.name}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;