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
      updateContactList(server.username, "add"); // Add yourself to the contact list
  };

  server.on_user_connected = function(new_user_id) {
    console.log("New user connected:", new_user_id);
    // If not yourself, send a history message to the new user
    if (new_user_id !== server.user_id) {
      var historyMessage = {
          type: "history",
          content: chatHistory
      };
      server.sendMessage(JSON.stringify(historyMessage), [new_user_id]);
      
      // Also sends the current user's join message
      var joinMessage = {
          type: "join",
          username: server.username,
          avatar: server.avatar
      };
      console.log("Sending join message for:", server.username); // Debugging Information
      server.sendMessage(JSON.stringify(joinMessage));
  }
};
  server.on_user_disconnected = function(user_id) {
    console.log("User disconnected:", user_id);
    if (userIdToNameMap[user_id]) {
      var username = userIdToNameMap[user_id].username;
      updateContactList(username, "remove"); // Removing users from the contact list
      delete userIdToNameMap[user_id]; // Remove users from the mapping
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
        // Handling real-time chat messages
        appendMessageToChat(parsedMsg.username, parsedMsg.message, parsedMsg.avatar);
        // Add message to history
        chatHistory.push(parsedMsg);
      } else if (parsedMsg.type === "history") {
        // Here's what to do when you receive a history message,
        parsedMsg.content.forEach(function(historyMsg) {
          appendMessageToChat(historyMsg.username, historyMsg.message, historyMsg.avatar);
          });
      } else if (parsedMsg.type === "join") {
        // Handling of accession type messages1
        console.log("Processing join message for:", parsedMsg.username);
        userIdToNameMap[author_id] = { username: parsedMsg.username, avatar: parsedMsg.avatar };
        updateContactList(parsedMsg.username, "add"); //  Updating the contact list
      } else if (parsedMsg.type === "myInfo") {
        // Handling of accession type messages2
        console.log("Processing myInfo message for:", parsedMsg.username);
        userIdToNameMap[author_id] = { username: parsedMsg.username, avatar: parsedMsg.avatar };
        updateContactList(parsedMsg.username, "add"); //  Updating the contact list
      } else {
        console.log("Received unknown type of message:", parsedMsg);
      }
  };

  server.on_ready = function(my_id) {
      server.user_id = my_id; // Store the user's own ID
      var joinMessage = {
          type: "text",
          username: username,
          message: username + " joined the chat.",
          avatar: avatar
      };
      server.sendMessage(JSON.stringify(joinMessage));
        // Creating a message with new user information
      var myInfoMessage = {
          type: "myInfo",
          username: localStorage.getItem('username'),
          avatar: localStorage.getItem('avatar')
      };
      // Sending a message using the broadcast function
      server.sendMessage(JSON.stringify(myInfoMessage)); 
  };

  document.querySelector('.loginPage').style.display = 'none';
  document.getElementById('chatPage').style.display = 'block';

  // Bind an event listener for the Enter key to send a message.
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
        chatHistory.push(msgObject); // Adding messages to the history
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
  console.log("Updating contact list for:", username, "Action:", action); // Debugging Information
  if (action === "add") {
    var contactElement = document.createElement("div");
    contactElement.classList.add("contact");
    contactElement.textContent = username;
    contactsDiv.appendChild(contactElement);
  } else if (action === "remove") {
    // Remove user from contact list
    var contacts = contactsDiv.getElementsByClassName("contact");
    for (var i = 0; i < contacts.length; i++) {
      if (contacts[i].textContent === username) {
        contactsDiv.removeChild(contacts[i]);
        break;
      }
    }
  }
}