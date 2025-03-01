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


function selectUser(user) {
    selectedUserId = user._id;
    document.getElementById("selectedUser").textContent = `👤 Chatting with: ${user.username}`;
    document.getElementById("messageInput").disabled = false;
    document.querySelector(".chat-input button").disabled = false;
}

async function sendMessage() {
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

    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
        alert("❌ User information not found. Please log in again.");
        return;
    }

    const userInfo = JSON.parse(storedUserInfo);
    if (!userInfo.userId) {
        alert("❌ User ID is missing. Please log in again.");
        return;
    }

    try {
        socket.emit("sendMessage", {
            text: message,
            senderId: userInfo.userId, 
            senderName: userInfo.username,
            receiverId: selectedUserId
        });

        messageInput.value = "";
    } catch (error) {
        console.error("❌ Error sending message:", error);
        alert("An error occurred while sending the message. Please try again.");
    }
}



socket.on("receiveMessage", (data) => {
    if (data.receiverId === userInfo.id || data.senderId === userInfo.id) {
        alert(`New message from ${data.senderName}: ${data.text}`);
    }
});

function goHome() {
    window.location.href = "home.html";
}

document.addEventListener("DOMContentLoaded", fetchUsers);