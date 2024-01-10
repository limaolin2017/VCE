function sendMessage() {
    var input = document.getElementById('messageInput');
    var message = input.value.trim();

    if(message !== "") {
        var chatMessages = document.querySelector('.chat-messages');
        var messageElement = document.createElement('div');
        messageElement.classList.add('message');

        var textElement = document.createElement('div');
        textElement.classList.add('message-text');
        textElement.textContent = message;

        messageElement.appendChild(textElement);
        chatMessages.appendChild(messageElement);

        input.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
