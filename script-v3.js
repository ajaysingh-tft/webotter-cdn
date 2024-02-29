const BASE_URL = "http://203.110.83.71:65000";

let socket;

let uuid = localStorage.getItem("uuid");
export const initializeBot = ({ apiKey, projectId }) => {
  if (!apiKey) {
    console.log('apiKey not provided') 
    return;
  } else if (!projectId) {
    console.log('projectId not provided')
    return;
  }
  if (apiKey && projectId) {
    if (!uuid) {
      uuid = generateUUID();
      console.log('session id not found')
      localStorage.setItem("uuid", uuid);
    } else {
      console.log('session id found')
    }
    startWebSocketConnection({apiKey, projectId});
  }
}

function generateUUID() {
  console.log('regenerating new session')
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function startWebSocketConnection({apiKey, projectId}) {
  console.log('started ws');
  showLoadingAnimation();
  fetch(`${BASE_URL}/projects/configurations/?project_id=${projectId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
    }),
  })
    .then((response) => response.json())
    .then((configData) => {
      const botColor = configData.custom_colour;
      const botPosition = configData.bot_position;

      const chatHeader = document.querySelector(".chat-header");
      chatHeader.style.backgroundColor = botColor;

      const chatContainer = document.querySelector(".chat-container");
      chatContainer.style.right = botPosition === "right" ? "10px" : "";
      chatContainer.style.left = botPosition === "left" ? "10px" : "";
      hideLoadingAnimation();
    })
    .catch((error) => {
      console.error("Error:", error);
      hideLoadingAnimation();
    });

  const webSocketUrl = `ws://203.110.83.71:65000/ws/chat/${projectId}/${uuid}/`;

  const updateConnectionStatus = (isConnected) => {
    const connectionStatusElement = document.getElementsByClassName("connection-status")[0];
    connectionStatusElement.style.marginLeft = "1rem";
    if (isConnected) {
      connectionStatusElement.textContent = "Online"
    } else {
      connectionStatusElement.textContent = "Offline"
    }
  };

  socket = new WebSocket(webSocketUrl);

  socket.addEventListener("open", (event) => {
    console.log("Connected to the WebSocket server");
    updateConnectionStatus(true);
  });

  socket.addEventListener("message", (event) => {
    console.log("Received message from server:", event);
    const data = JSON.parse(event.data);
    console.log("data", data);
    sendBotMessage(data.message);
  });

  socket.addEventListener("close", (event) => {
    console.log("Connection closed:", event);
    updateConnectionStatus(false);
  });

  
// startWebSocketConnection();
const chatContainer = document.createElement("div");
chatContainer.classList.add("chat-container");
document.body.appendChild(chatContainer);

const chatHeader = document.createElement("div");
chatHeader.classList.add("chat-header");

const leftContainer = document.createElement("div");
leftContainer.classList.add("left-container");

const profileImage = document.createElement("div");
profileImage.classList.add("profile-image");
const profileName = document.createElement("div");
profileName.classList.add("profile-name");
profileName.textContent = "Design test 01";

// connection status
const connectionStatus = document.createElement("div");
connectionStatus.classList.add("connection-status");

leftContainer.appendChild(profileImage);
leftContainer.appendChild(profileName);
leftContainer.appendChild(connectionStatus)

const rightContainer = document.createElement("div");
rightContainer.classList.add("right-container");

const hideImage = document.createElement("img");
hideImage.src = "assets/hide.svg";
let isChatExpanded = false;
hideImage.addEventListener("click", () => {
  if (!isChatExpanded) {
    chatContainer.style.height = "45px";
  } else {
    chatContainer.style.height = "347px";
  }
  isChatExpanded = !isChatExpanded;
});
const crossImage = document.createElement("img");
crossImage.src = "assets/cross.svg";
crossImage.addEventListener("click", () => {
  chatContainer.style.display = "none";
});

rightContainer.appendChild(hideImage);
rightContainer.appendChild(crossImage);

chatHeader.appendChild(leftContainer);
chatHeader.appendChild(rightContainer);

chatContainer.appendChild(chatHeader);

const chatMessages = document.createElement("div");
chatMessages.classList.add("chat-messages");
chatMessages.id = "chat-messages";
chatContainer.appendChild(chatMessages);

const chatInputContainer = document.createElement("div");
chatInputContainer.classList.add("chat-input");
chatContainer.appendChild(chatInputContainer);

const alphabetImage = document.createElement("img");
alphabetImage.id = "alphabet-img";
alphabetImage.src = "assets/alphabet.svg";
alphabetImage.alt = "Alphabet";
chatInputContainer.appendChild(alphabetImage);

const userInput = document.createElement("input");
userInput.type = "text";
userInput.id = "user-input";
userInput.placeholder = "Type your text here";
chatInputContainer.appendChild(userInput);

const sendButton = document.createElement("button");
const sendImage = document.createElement("img");
sendImage.src = "assets/send-btn.svg";
sendImage.alt = "Send";
sendButton.appendChild(sendImage);
sendButton.id = "sendButton";
chatInputContainer.appendChild(sendButton);

const styleElement = document.createElement("style");
styleElement.textContent = `
  body {
    font-family: Arial, sans-serif;
    position: relative;
  } 
  .chat-container {
    background: #fff;
    position: fixed;
    right: 10px;
    bottom: 10px;
    height: 347px;
    width: 270px;
    border: 1px solid #ccc;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  } 
  .chat-header {
    height: 45px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    background-color: #6780C3;
    border-radius: 10px 10px 0 0;
    color: white;
    padding: 10px;
    font-size: 14px;
  } 
  .left-container {
    display: flex;
    align-items: center;
  }
  .profile-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: white;
    margin-right: 5px;
  }
  .profile-name {
    color: #F8F8F8;
    font-size: 14px;
  }
  .right-container {
    display: flex;
  }
  .right-container img {
    margin-left: 10px;
  }
  .chat-messages {
    padding: 10px;
    height: 238px;
    overflow-y: scroll;
  } 
  #loader{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 290px;
  }
  .chat-input {
    height: 45px;
    display: flex;
    border: 1px solid #C8C8C8;
    box-sizing: border-box;
  }
  #alphabet-img{
    padding: 10px;
  }
  input {
    flex: 10;
    padding: 10px;
    margin-right: 10px;
    border: none;
    font-size: 12px;
  }
  input:focus {
    outline: none; 
    border: none; 
  }
  button {
    padding: 10px;
    flex: 1;
    border: none;
    cursor: pointer;
    background-color: #ffffff;
  } 
  .chatMessageContainer{
    display:flex;
  }
  .user-message-wrapper{
    display: flex;
    justify-content: flex-end;
  }
  .bot-message-wrapper {
    display: flex;
    justify-content: flex-start;
  }
  .message {
    max-width: 90%;
  }
  .chat-message{
    font-size: 14px;
    display: block;
    background-color: #6780C3;
    color: white;
    padding: 4px 10px;
    border-radius: 10px;
    border-bottom-right-radius: 0px;
  }
  .bot-message {
    background-color: #2F2F2F0D;
    border-radius: 10px;
    border-bottom-left-radius: 0px;
    padding: 4px 10px;
  }
  .message-meta {
    margin: 5px;
    display: flex;
  }
  .user-message-wrapper .message-meta {
    justify-content: flex-end;
  }
  #time {
    font-size: 10px;
    color: #2F2F2F;
    padding: 12px 5px 0px 0px;
  }
  #author {
    margin-bottom: 5px;
    text-align: right;
    font-size: 12px;
    color: #E9AB4D;
  }
  #bot{
    margin-bottom: 5px;
    text-align: left;
    font-size: 12px;
    color: #E9AB4D;
  }
  .chat-message, .bot-message {
    font-size: 14px;
  }
  #loading-container::before {
    content: "loading...";
    color: blue;
    font-size: .6rem;
    color: black; /* Adjust the color as needed */
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
}
  #loading-container {
    position: absolute !important;
    z-index: 999;
    width: 100%;
    height: 100vh;
    display: grid;
    place-items: center;
  }
  #loading-spinner {
    width: 4rem;
    height: 4rem;
    border: 5px solid transparent;
    border-top: 5px solid #1d71d4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }
`;

document.head.appendChild(styleElement);

sendButton.addEventListener("click", () => {
  sendUserMessage(userInput.value);
  socket.addEventListener("close", (event) => {
    return;
  });
});

userInput.addEventListener("keypress", (event) => {
  socket.addEventListener("close", (event) => {
    return;
  });
  if (event.key === "Enter") {
    sendUserMessage(userInput.value);
  }
});

const sendUserMessage = async (msg) => {
  try {
    await socket.send(JSON.stringify({ message: msg, language: "en", project_id: projectId }));
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
  const InputMessage = msg;
  if (msg.trim() !== "") {
    const userMesageWrapper = document.createElement("div");
    userMesageWrapper.classList.add("user-message-wrapper");

    const message = document.createElement("div");
    message.classList.add("message");

    const messageMeta = document.createElement("div");

    const author = document.createElement("span");
    messageMeta.id = "author";
    messageMeta.textContent = "User";

    messageMeta.appendChild(author);

    const chatMessageContainer = document.createElement("div");
    chatMessageContainer.classList.add("chatMessageContainer");

    const timeStamp = document.createElement("span");
    timeStamp.id = "time";
    timeStamp.textContent = new Date().toLocaleTimeString();

    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-message");
    chatMessage.innerText = InputMessage;

    chatMessageContainer.appendChild(timeStamp);
    chatMessageContainer.appendChild(chatMessage);

    message.appendChild(messageMeta);
    message.appendChild(chatMessageContainer);

    userMesageWrapper.appendChild(message);
    chatMessages.appendChild(userMesageWrapper);
    userInput.value = "";
    userMesageWrapper.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};

const sendBotMessage = (msg) => {
  if (msg.trim() !== "") {
    const botMesageWrapper = document.createElement("div");
    botMesageWrapper.classList.add("bot-message-wrapper");

    const message = document.createElement("div");
    message.classList.add("message");

    const messageMeta = document.createElement("div");

    const author = document.createElement("span");
    messageMeta.id = "bot";
    author.textContent = "Bot";

    messageMeta.appendChild(author);

    const chatMessageContainer = document.createElement("div");
    chatMessageContainer.classList.add("chatMessageContainer");

    const chatMessage = document.createElement("div");
    chatMessage.classList.add("bot-message");
    chatMessage.innerText = msg;

    const timeStamp = document.createElement("span");
    timeStamp.id = "time";
    timeStamp.textContent = new Date().toLocaleTimeString();

    chatMessageContainer.appendChild(chatMessage);
    chatMessageContainer.appendChild(timeStamp);

    message.appendChild(messageMeta);
    message.appendChild(chatMessageContainer);

    botMesageWrapper.appendChild(message);
    chatMessages.appendChild(botMesageWrapper);

    botMesageWrapper.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};

function showLoadingAnimation() {
  const loadingContainer = document.createElement("div");
  loadingContainer.id = "loading-container";

  const loadingSpinner = document.createElement("div");
  loadingSpinner.id = "loading-spinner";

  loadingContainer.appendChild(loadingSpinner);
  document.body.appendChild(loadingContainer);
}

function hideLoadingAnimation() {
  const loadingContainer = document.getElementById("loading-container");
  if (loadingContainer) {
    document.body.removeChild(loadingContainer);
  }
}
}
