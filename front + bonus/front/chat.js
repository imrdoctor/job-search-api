const baseURL = "http://localhost:7801";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const userInfo = JSON.parse(localStorage.getItem("userInfo"));

if (!token || !role || !userInfo) {
    window.location.href = "index.html";
} else {
    document.getElementById("user").textContent = userInfo.username;
    document.getElementById("userAvatar").textContent = userInfo.username.slice(0, 2).toUpperCase();
}

const socket = io(baseURL, {
    auth: {
        authorization: token,
        authType: role === "admin" ? "Admin" : "Bearer"
    }
});

let selectedUserId = null;

// Fetch users list
fetch(`${baseURL}/chat/users`, {
    method: "GET",
    headers: {
        "authorization": token,
        "authtype": role === "admin" ? "Admin" : "Bearer"
    }
})
.then(res => res.json())
.then(users => {
    const usersList = document.getElementById("users");
    users.forEach(user => {
        if (user.id !== userInfo.id) {
            const li = document.createElement("li");
            li.textContent = user.username;
            li.dataset.id = user.id;
            li.addEventListener("click", () => selectUser(user));
            usersList.appendChild(li);
        }
    });
});

// Select user
function selectUser(user) {
    selectedUserId = user.id;
    document.getElementById("selectedUser").textContent = `👤 Chatting with: ${user.username}`;
    document.getElementById("messageInput").disabled = false;
    document.querySelector(".chat-input button").disabled = false;
}

// Send message
function sendMessage() {
    if (!selectedUserId) return alert("Please select a user first.");

    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit("sendMessage", { 
            text: message, 
            senderId: userInfo.id, 
            senderName: userInfo.username, 
            receiverId: selectedUserId
        });
        messageInput.value = "";
    }
}

// Receive message
socket.on("receiveMessage", (data) => {
    if (data.receiverId === userInfo.id || data.senderId === userInfo.id) {
        alert(`New message from ${data.senderName}: ${data.text}`);
    }
});

// Go back home
function goHome() {
    window.location.href = "home.html";
}
