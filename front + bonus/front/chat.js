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

// === Fetch Users ===
async function fetchUsers() {
    try {
        const response = await fetch(`${baseURL}/chat/users`, {
            method: "GET",
            headers: {
                "authorization": token,
                "authtype": role === "admin" ? "Admin" : "Bearer"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        console.log("API Response:", data);

        if (!Array.isArray(data.data)) throw new Error("Users data is not an array");

        const usersList = document.getElementById("users");
        usersList.innerHTML = "";

        data.data.forEach(user => {
            if (user._id !== userInfo.id) {
                const li = document.createElement("li");
                li.textContent = `${user.firstName} ${user.lastName}`;
                li.dataset.id = user._id;
                li.addEventListener("click", () => selectUser(user));
                usersList.appendChild(li);
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// === Fetch Messages ===
async function fetchMessages(userId) {
    try {
        const response = await fetch(`${baseURL}/chat/messages/${userId}`, {
            method: "GET",
            headers: {
                "authorization": token,
                "authtype": role === "admin" ? "Admin" : "Bearer"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        console.log("Chat History:", data);

        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = "";

        data.messages.forEach(msg => {
            displayMessage(msg.message, msg.senderId === userInfo.id ? "outgoing" : "incoming", msg.senderId);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// === Select User for Chat ===
function selectUser(user) {
    selectedUserId = user._id;
    document.getElementById("selectedUser").textContent = `👤 Chatting with: ${user.firstName} ${user.lastName}`;
    document.getElementById("messageInput").disabled = false;
    document.querySelector(".chat-input button").disabled = false;

    fetchMessages(selectedUserId);
}

// === Send Message ===
function sendMessage() {
    if (!selectedUserId) {
        alert("❌ Please select a user first.");
        return;
    }

    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!message) {
        alert("❌ Message cannot be empty.");
        return;
    }

    try {
        socket.emit("sendMessage", {
            text: message,
            senderId: userInfo.id,
            senderName: userInfo.username,
            receiverId: selectedUserId
        });

        displayMessage(message, "outgoing", "You");
        messageInput.value = "";
    } catch (error) {
        console.error("❌ Error sending message:", error);
        alert("An error occurred while sending the message. Please try again.");
    }
}

// === Receive Messages ===
socket.on("receiveMessage", (data) => {
    if (data.receiverId === userInfo.id || data.senderId === userInfo.id) {
        displayMessage(data.text, data.senderId === userInfo.id ? "outgoing" : "incoming", data.senderName);
    }
});

// === Display Message in Chat Box ===
function displayMessage(message, type, senderName) {
    const chatBox = document.getElementById("chatBox");
    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message", type);
    messageDiv.innerHTML = `<strong>${senderName}:</strong> ${message}`;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // تمرير تلقائي إلى آخر رسالة
}

// === Handle Socket Events ===
socket.on("connect", () => {
    console.log("✅ Connected to WebSocket Server");
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from WebSocket Server");
});

socket.on("error", (error) => {
    console.error("❌ WebSocket Error:", error);
});

// === Logout Function ===
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
    window.location.href = "index.html";
}

// === Initialize ===
document.addEventListener("DOMContentLoaded", fetchUsers);
