var avatars = [
  'avatar/avatar1.png',
  'avatar/avatar2.png',
  // Add more avatars here...
];

var avatarSelect = document.getElementById('avatarSelect');
var server;
var chatHistory = [];
var userIdToNameMap = {};

for (var i = 0; i < avatars.length; i++) {
  var option = document.createElement('option');
  option.value = avatars[i];
  option.text = 'Avatar ' + (i + 1);
  avatarSelect.appendChild(option);
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  var username = document.getElementById('username').value;
  var room = document.getElementById('room').value;
  var avatar = avatarSelect.value;

  localStorage.setItem('avatar', avatar);
  localStorage.setItem('username', username);
  localStorage.setItem('room', room);

  server = new SillyClient();
  server.connect("wss://ecv-etic.upf.edu/node/9000/ws", room);
  server.avatar = avatar;
  server.username = username;

  server.on_connect = function() {
      console.log("Connected to the server in room:", room);
      updateContactList(server.username, "add"); // 将自己添加到联系人列表
  };

  server.on_user_connected = function(new_user_id) {
    console.log("New user connected:", new_user_id);
    // 如果不是自己，则发送历史消息给新用户
    if (new_user_id !== server.user_id) {
      var historyMessage = {
          type: "history",
          content: chatHistory
      };
      server.sendMessage(JSON.stringify(historyMessage), [new_user_id]);
      
      // 同时发送当前用户的加入信息
      var joinMessage = {
          type: "join",
          username: server.username,
          avatar: server.avatar
      };
      console.log("Sending join message for:", server.username); // 调试信息
      server.sendMessage(JSON.stringify(joinMessage));
  }
};
  server.on_user_disconnected = function(user_id) {
    console.log("User disconnected:", user_id);
    if (userIdToNameMap[user_id]) {
      var username = userIdToNameMap[user_id].username;
      updateContactList(username, "remove"); // 从联系人列表中移除用户
      delete userIdToNameMap[user_id]; // 从映射中移除用户
    }
  };
  server.on_message = function(author_id, msg) {
      var parsedMsg;
      try {
          parsedMsg = JSON.parse(msg);
      } catch (e) {
          console.error("Error parsing message:", msg);
          return;
      }
      if (parsedMsg.type === "text") {
        // 处理实时聊天消息
        appendMessageToChat(parsedMsg.username, parsedMsg.message, parsedMsg.avatar);
        // 添加消息到历史记录
        chatHistory.push(parsedMsg);
      } else if (parsedMsg.type === "history") {
        // 这里是收到历史消息时的处理，可能不需要在客户端做任何事
        parsedMsg.content.forEach(function(historyMsg) {
          appendMessageToChat(historyMsg.username, historyMsg.message, historyMsg.avatar);
          });
      } else if (parsedMsg.type === "join") {
        // 处理加入类型的消息1
        console.log("Processing join message for:", parsedMsg.username);
        userIdToNameMap[author_id] = { username: parsedMsg.username, avatar: parsedMsg.avatar };
        updateContactList(parsedMsg.username, "add"); // 更新联系人列表
      } else if (parsedMsg.type === "myInfo") {
        // 处理加入类型的消息2
        console.log("Processing myInfo message for:", parsedMsg.username);
        userIdToNameMap[author_id] = { username: parsedMsg.username, avatar: parsedMsg.avatar };
        updateContactList(parsedMsg.username, "add"); // 更新联系人列表
      } else {
        console.log("Received unknown type of message:", parsedMsg);
      }
  };

  server.on_ready = function(my_id) {
      server.user_id = my_id; // 存储用户自己的ID
      var joinMessage = {
          type: "text",
          username: username,
          message: username + " joined the chat.",
          avatar: avatar
      };
      server.sendMessage(JSON.stringify(joinMessage));
        // 创建包含新用户信息的消息
      var myInfoMessage = {
          type: "myInfo",
          username: localStorage.getItem('username'),
          avatar: localStorage.getItem('avatar')
      };
      // 使用广播函数发送消息
      server.sendMessage(JSON.stringify(myInfoMessage)); // 这会将消息发送给所有其他用户
  };

  document.querySelector('.loginPage').style.display = 'none';
  document.getElementById('chatPage').style.display = 'block';

  // 绑定回车键发送消息的事件监听器
  document.getElementById('messageInput').addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
      sendMessage();
      event.preventDefault();
    }
  });
});

function sendMessage() {
    var input = document.getElementById('messageInput');
    var message = input.value.trim();
    var username = localStorage.getItem('username');
    var avatar = localStorage.getItem('avatar');

    if (message !== "") {
        var msgObject = {
            type: "text",
            username: username,
            message: message,
            avatar: avatar
        };
        server.sendMessage(JSON.stringify(msgObject));
        chatHistory.push(msgObject); // 将消息添加到历史记录
        appendMessageToChat(username, message, avatar);
        input.value = '';
    }
}

function appendMessageToChat(username, message, avatar) {
  var chatMessages = document.querySelector('.chat-messages');
  var messageElement = document.createElement('div');
  messageElement.classList.add('message');

  var usernameElement = document.createElement('div');
  usernameElement.classList.add('message-username');
  usernameElement.textContent = username + ": ";
  messageElement.appendChild(usernameElement);

  var textElement = document.createElement('div');
  textElement.classList.add('message-text');
  textElement.textContent = message;
  messageElement.appendChild(textElement);

  var avatarImg = document.createElement('img');
  avatarImg.src = avatar;
  avatarImg.classList.add('message-avatar');
  messageElement.appendChild(avatarImg);

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateContactList(username, action) {
  var contactsDiv = document.querySelector('.Contacts');
  console.log("Updating contact list for:", username, "Action:", action); // 调试信息
  if (action === "add") {
    var contactElement = document.createElement("div");
    contactElement.classList.add("contact");
    contactElement.textContent = username;
    contactsDiv.appendChild(contactElement);
  } else if (action === "remove") {
    // 移除用户从联系人列表
    var contacts = contactsDiv.getElementsByClassName("contact");
    for (var i = 0; i < contacts.length; i++) {
      if (contacts[i].textContent === username) {
        contactsDiv.removeChild(contacts[i]);
        break;
      }
    }
  }
}