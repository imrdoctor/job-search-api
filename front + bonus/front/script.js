const baseURL = "http://localhost:7801";

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
function goToChat() {
    window.location.href = "chat.html";
}

if (window.location.pathname.includes("home.html")) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
        window.location.href = "index.html";
    } else {
        fetch(`${baseURL}/user/user-info`, {
            method: "GET",
            headers: {
                "authorization": token,
                "authtype": role === "admin" ? "Admin" : "Bearer"
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.info) {
                localStorage.setItem("userInfo", JSON.stringify(data.info));

                document.getElementById("user").textContent = data.info.username;
                document.getElementById("usernameDisplay").textContent = data.info.username;

                const userAvatar = document.getElementById("userAvatar");
                if (data.info.profileImage) {
                    userAvatar.style.backgroundImage = `url(${data.info.profileImage})`;
                    userAvatar.style.backgroundSize = "cover";
                } else {
                    userAvatar.textContent = data.info.username.slice(0, 2).toUpperCase();
                }
            } else {
                console.log(data);
                
                alert("فشل في تحميل بيانات المستخدم.");
                window.location.href = "index.html";
            }
        })
        .catch(error => {
            console.error("Fetch User Info Error:", error);
            console.log(error);
            alert("حدث خطأ أثناء تحميل بيانات المستخدم.");
            window.location.href = "index.html";
        });

        const socket = io(baseURL, {
            auth: {
                authorization: token,
                authType: role === "admin" ? "Admin" : "Bearer"
            }
        });

        socket.on("notification", (data) => {
            const notifBox = document.getElementById("notifications");
            const div = document.createElement("div");
            div.classList.add("notification-item");
            div.textContent = data.message;
            notifBox.prepend(div);
        });
    }
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
  
    if (!username || !password) {
      alert("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
  
    const payload = {
      email: username,
      password: password
    };
  
    fetch(`${baseURL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error("فشل عملية تسجيل الدخول");
      return response.json();
    })
    .then(data => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", data.role || data.info?.role); 
      localStorage.setItem("userInfo", JSON.stringify(data.userInfo || data.info));
  
      window.location.href = "home.html";
    })
    .catch(error => {
      console.error("خطأ في تسجيل الدخول:", error);
      alert("فشل تسجيل الدخول، يرجى التحقق من بيانات الدخول.");
    });
}