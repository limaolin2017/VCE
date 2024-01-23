# VCE HOMEWORK 1
This is a chatroom assignment from https://docs.google.com/presentation/d/1rqqRO7ZV5ioQaTBWCO4Lhp8ip2QzSkrIWwUKRAC0F9U/edit#slide=id.gaf8a365159_0_5

Myinfo:
e-mail: maolin.li01@estudiant.upf.edu

student number: u217931

Chatroom Overview:

1. Avatar Selection: It begins by populating a dropdown menu (`avatarSelect`) with avatar choices from a predefined array (`avatars`). Users can select an avatar from this menu.

2. Chat Connection: When a user submits the login form (`loginForm`), the script prevents the default form submission action. It retrieves the user's chosen username, chat room, and avatar. It then connects to a chat server using the SillyClient library, specifying the chosen room.

3. Server Event Handlers: There are several event handlers for different server events:
   - `on_connect`: Executes when connected to the server.
   - `on_ready`: Triggers when the server is ready. It sends a join message and user info to the server and updates the chat history and contact list.
   - `on_user_connected`: Handles new user connections by sending them the chat history and notifying other users.
   - `on_user_disconnected`: Removes disconnected users from the contact list and user mapping.
   - `on_message`: Handles incoming messages. It categorizes messages by type (text, history, join, etc.) and updates the chat interface accordingly.

4. Message Sending: The `sendMessage` function is triggered when the Enter key is pressed in the message input field. It sends the user's message to the server and updates the chat history and UI.

5. UI Updates: Functions like `appendMessageToChat` and `updateContactList` are used to dynamically update the chat interface, displaying messages and managing the contact list.

6. Chat UI Display: After logging in, it switches the display from the login page to the chat page.

