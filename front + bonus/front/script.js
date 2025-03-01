const baseURL = "http://localhost:7801";

// تسجيل الخروج
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
function goToChat() {
    window.location.href = "chat.html";
}

// عند فتح صفحة home.html
if (window.location.pathname.includes("home.html")) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
        window.location.href = "index.html";
    } else {
        // جلب بيانات المستخدم
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
                // تحديث بيانات المستخدم في localStorage
                localStorage.setItem("userInfo", JSON.stringify(data.info));

                // عرض اسم المستخدم
                document.getElementById("user").textContent = data.info.username;
                document.getElementById("usernameDisplay").textContent = data.info.username;

                // عرض صورة المستخدم أو أول حرفين من اسمه
                const userAvatar = document.getElementById("userAvatar");
                if (data.info.profileImage) {
                    userAvatar.style.backgroundImage = `url(${data.info.profileImage})`;
                    userAvatar.style.backgroundSize = "cover";
                } else {
                    userAvatar.textContent = data.info.username.slice(0, 2).toUpperCase();
                }
            } else {
                alert("فشل في تحميل بيانات المستخدم.");
                window.location.href = "index.html";
            }
        })
        .catch(error => {
            console.error("Fetch User Info Error:", error);
            alert("حدث خطأ أثناء تحميل بيانات المستخدم.");
            window.location.href = "index.html";
        });

        // الاتصال بـ Socket.io للإشعارات
        const socket = io(baseURL, {
            auth: {
                authorization: token,
                authType: role === "admin" ? "Admin" : "Bearer"
            }
        });

        // استقبال الإشعارات وتنسيقها
        socket.on("notification", (data) => {
            const notifBox = document.getElementById("notifications");
            const div = document.createElement("div");
            div.classList.add("notification-item");
            div.textContent = data.message;
            notifBox.prepend(div); // إضافة الإشعار في الأعلى
        });
    }
}
