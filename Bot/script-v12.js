const BASE_URL = "https://webotter-be.tftus.com";

let socket;
let selectedLanguage = "en";

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
      const languages = configData.preferred_languages;

      const chatHeader = document.querySelector(".webotter-chat-header");
      chatHeader.style.backgroundColor = botColor;

      const chatContainer = document.querySelector(".webotter-chat-container");
      chatContainer.style.right = botPosition === "right" ? "10px" : "";
      chatContainer.style.left = botPosition === "left" ? "10px" : "";
      chatContainer.style.display = "block";
      minimizingStateWrapper.style.right = botPosition === "right" ? "10px" : "";
      minimizingStateWrapper.style.left = botPosition === "left" ? "10px" : "";
      if (Object.keys(languages).length === 0) {
        addLanguageOption("en", "EN");
        selectedLanguage = "en"; 
      } else {
        languages.forEach((lang) => {
          addLanguageOption(lang.toLowerCase(), lang.toUpperCase());
        });
      }
      hideLoadingAnimation();
    })
    .catch((error) => {
      console.error("Error:", error);
      hideLoadingAnimation();
    });
  
  function addLanguageOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    selectElement.appendChild(option);
  }

  const webSocketUrl = `wss://webotter-be.tftus.com/ws/chat/${projectId}/${uuid}/`;

  const updateConnectionStatus = (isConnected) => {
    const connectionStatusElement = document.getElementsByClassName("webotter-connection-ring")[0];
    if (isConnected) {
      connectionRing.style.borderColor = "#90EE90"; 
    } else {
      connectionRing.style.borderColor = "red"; 
    }
  };

  socket = new WebSocket(webSocketUrl);

  socket.addEventListener("open", (event) => {
    updateConnectionStatus(true);
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    sendBotMessage(data.message);
  });

  socket.addEventListener("close", (event) => {
    updateConnectionStatus(false);
  });

  
// startWebSocketConnection();
const chatContainer = document.createElement("div");
chatContainer.classList.add("webotter-chat-container");
document.body.appendChild(chatContainer);

const chatHeader = document.createElement("div");
chatHeader.classList.add("webotter-chat-header");

const leftContainer = document.createElement("div");
leftContainer.classList.add("webotter-left-container");

const profileImage = document.createElement("div");
profileImage.classList.add("webotter-profile-image");

// connection status
const connectionRing = document.createElement("div");
connectionRing.classList.add("webotter-connection-ring");
profileImage.appendChild(connectionRing);

const imageElement = document.createElement("img");
imageElement.classList.add("webotter-logo");
imageElement.src = "https://cdn.jsdelivr.net/gh/ajaysingh-tft/webotter-cdn@main/Bot/assets/logo-small.svg";
connectionRing.appendChild(imageElement);

const profileName = document.createElement("div");
profileName.classList.add("webotter-profile-name");
profileName.textContent = "Webotter";

leftContainer.appendChild(profileImage);
leftContainer.appendChild(profileName);

const selectContainer = document.createElement("div");
selectContainer.style.marginLeft = "7px";

// select language
const selectElement = document.createElement("select");
selectElement.id = "webotter-language-select";
selectElement.name = "languages";
selectElement.style.border = "none"
selectElement.addEventListener("change", (e) => {
  selectedLanguage = e.target.value;
});

selectContainer.appendChild(selectElement);
leftContainer.appendChild(selectContainer);

const rightContainer = document.createElement("div");
rightContainer.classList.add("webotter-right-container");

const hideImage = document.createElement("img");
hideImage.src = "https://cdn.jsdelivr.net/gh/ajaysingh-tft/webotter-cdn@main/Bot/assets/hide.svg";
let isChatExpanded = false;
hideImage.addEventListener("click", () => {
  if (!isChatExpanded) {
    chatContainer.style.display = "none";
    minimizingStateWrapper.style.display = "flex";
  } else {
    chatContainer.style.display = "block";
    minimizingStateWrapper.style.display = "none";
  }
  isChatExpanded = !isChatExpanded;
});
const crossImage = document.createElement("img");
crossImage.src = "https://cdn.jsdelivr.net/gh/ajaysingh-tft/webotter-cdn@main/Bot/assets/cross.svg";
crossImage.addEventListener("click", () => {
  chatContainer.style.display = "none";
});

rightContainer.appendChild(hideImage);
rightContainer.appendChild(crossImage);

chatHeader.appendChild(leftContainer);
chatHeader.appendChild(rightContainer);

chatContainer.appendChild(chatHeader);

const chatMessages = document.createElement("div");
chatMessages.classList.add("webotter-chat-messages");
chatMessages.id = "webotter-chat-messages";
chatContainer.appendChild(chatMessages);

const chatInputContainer = document.createElement("div");
chatInputContainer.classList.add("webotter-chat-input");
chatContainer.appendChild(chatInputContainer);

const alphabetImage = document.createElement("img");
alphabetImage.id = "webotter-alphabet-img";
alphabetImage.src = "https://cdn.jsdelivr.net/gh/ajaysingh-tft/webotter-cdn@main/Bot/assets/alphabet.svg";
alphabetImage.alt = "Alphabet";
chatInputContainer.appendChild(alphabetImage);

const userInput = document.createElement("input");
userInput.type = "text";
userInput.id = "webotter-user-input";
userInput.placeholder = "Type your text here";
chatInputContainer.appendChild(userInput);

const sendButton = document.createElement("button");
const sendImage = document.createElement("img");
sendImage.src = "https://cdn.jsdelivr.net/gh/ajaysingh-tft/webotter-cdn@main/Bot/assets/send-btn.svg";
sendImage.alt = "Send";
sendButton.appendChild(sendImage);
sendButton.id = "webotter-sendButton";
chatInputContainer.appendChild(sendButton);

const minimizingStateWrapper = document.createElement("div");
minimizingStateWrapper.classList.add("webotter-minimizing-state-wrapper");

document.body.appendChild(minimizingStateWrapper);

const minimizingState = document.createElement("div");
minimizingState.classList.add("webotter-minimizing-state");

minimizingStateWrapper.appendChild(minimizingState)

minimizingState.addEventListener("click", () => {
    if (!isChatExpanded) {
      chatContainer.style.display = "none";
      minimizingStateWrapper.style.display = "flex";
    } else {
      chatContainer.style.display = "block";
      minimizingStateWrapper.style.display = "none";
    }
    isChatExpanded = !isChatExpanded;
  });

const minimizingStateImg = document.createElement("img");
minimizingStateImg.classList.add("webotter-minimizing-img");
minimizingStateImg.src = "https://cdn.jsdelivr.net/gh/ajaysingh-tft/webotter-cdn@main/Bot/assets/minimized-img.png";
minimizingState.appendChild(minimizingStateImg);

const minimizingStateCrossImg = document.createElement("img");
minimizingStateCrossImg.classList.add("webotter-minimizing-cross-img");
minimizingStateCrossImg.src = "https://cdn.jsdelivr.net/gh/ajaysingh-tft/webotter-cdn@main/Bot/assets/grey-cross.png";
minimizingStateWrapper.appendChild(minimizingStateCrossImg);

minimizingStateCrossImg.addEventListener("click", () => {
    minimizingStateWrapper.style.display = "none";
  });

const styleElement = document.createElement("style");
styleElement.textContent = `
  body {
    font-family: Arial, sans-serif;
    position: relative;
  } 
  .webotter-chat-container {
    display: none;
    z-index: 999;
    background: #fff;
    position: fixed;
    bottom: 10px;
    height: 347px;
    width: 270px;
    border: 1px solid #ccc;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  } 
  .webotter-chat-header {
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
  .webotter-left-container {
    display: flex;
    align-items: center;
  }
  .webotter-profile-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: white;
    margin-right: 5px;
    display:flex;
    justify-content: center;
    align-items: center;
  }
  .webotter-profile-name {
    color: #F8F8F8;
    font-size: 14px;
  }
  .webotter-right-container {
    display: flex;
  }
  .webotter-right-container img {
    margin-left: 10px;
  }
  .webotter-chat-messages {
    padding: 10px;
    height: 238px;
    overflow-y: scroll;
  } 
  #webotter-loader{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 290px;
  }
  .webotter-chat-input {
    height: 45px;
    display: flex;
    border: 1px solid #C8C8C8;
    box-sizing: border-box;
  }
  #webotter-alphabet-img{
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
  .webotter-chatMessageContainer{
    display:block;
  }
  .webotter-user-message-wrapper{
    display: flex;
    justify-content: flex-end;
  }
  .webotter-bot-message-wrapper {
    display: flex;
    justify-content: flex-start;
  }
  .webotter-message {
    max-width: 90%;
  }
  .webotter-chat-message{
    font-size: 14px;
    display: block;
    background-color: #6780C3;
    color: white !important;
    padding: 4px 10px;
    border-radius: 10px;
    border-bottom-right-radius: 0px;
    max-width: 200px;
    word-break: break-word;
  }
  .webotter-bot-message {
    background-color: #2F2F2F0D;
    border-radius: 10px;
    border-bottom-left-radius: 0px;
    padding: 4px 10px;
    max-width: 200px;
    word-break: break-word;
    color: black !important;
  }
  .webotter-message-meta {
    margin: 5px;
    display: flex;
  }
  .webotter-user-message-wrapper .webotter-message-meta {
    justify-content: flex-end;
  }
  #webotter-time {
    text-align: right;
    font-size: 10px;
    color: #2F2F2F;
    padding: 5px;
  }
  #webotter-author {
    margin-bottom: 5px;
    text-align: right;
    font-size: 12px;
    color: #E9AB4D;
  }
  #webotter-bot{
    margin-bottom: 5px;
    text-align: left;
    font-size: 12px;
    color: #E9AB4D;
  }
  .webotter-chat-message, .webotter-bot-message {
    font-size: 14px;
  }
  #webotter-loading-container::before {
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
  #webotter-loading-container {
    position: absolute !important;
    z-index: 999;
    width: 100%;
    height: 100vh;
    display: grid;
    place-items: center;
  }
  #webotter-loading-spinner {
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
  .webotter-logo {
    height: 15px;
  }
  .webotter-connection-ring{
    width: 25px;
    height: 25px;
    border: 2px solid red;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .webotter-minimizing-state-wrapper{
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #6780C3;
    z-index: 999;
    position: fixed;
    display: none;
    bottom: 30px;
    justify-content: center;
    align-items: center;
  }
  .webotter-minimizing-state{
    display:flex
    justify-content: center;
    align-items: center;
  }
  .webotter-minimizing-cross-img{
    width: 16px;
    height: 16px;
    border-radius: 50%;
    position: absolute;
    top: 0px;
    right: 0px;
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
    await socket.send(JSON.stringify({ message: msg, language: selectedLanguage, project_id: projectId }));
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
  const InputMessage = msg;
  if (msg.trim() !== "") {
    const userMesageWrapper = document.createElement("div");
    userMesageWrapper.classList.add("webotter-user-message-wrapper");

    const message = document.createElement("div");
    message.classList.add("webotter-message");

    const messageMeta = document.createElement("div");

    const author = document.createElement("span");
    messageMeta.id = "webotter-author";
    messageMeta.textContent = "User";

    messageMeta.appendChild(author);

    const chatMessageContainer = document.createElement("div");
    chatMessageContainer.classList.add("webotter-chatMessageContainer");

    const timeStamp = document.createElement("div");
    timeStamp.id = "webotter-time";
    
    timeStamp.textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("webotter-chat-message");
    chatMessage.innerText = InputMessage;

    chatMessageContainer.appendChild(chatMessage);
    chatMessageContainer.appendChild(timeStamp);

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
    botMesageWrapper.classList.add("webotter-bot-message-wrapper");

    const message = document.createElement("div");
    message.classList.add("webotter-message");

    const messageMeta = document.createElement("div");

    const author = document.createElement("span");
    messageMeta.id = "webotter-bot";
    author.textContent = "Bot";

    messageMeta.appendChild(author);

    const chatMessageContainer = document.createElement("div");
    chatMessageContainer.classList.add("webotter-chatMessageContainer");

    const chatMessage = document.createElement("div");
    chatMessage.classList.add("webotter-bot-message");
    chatMessage.innerText = msg.replace(/\\n/g, `\n`).replace(/"/g, ' ');;

    const timeStamp = document.createElement("span");
    timeStamp.id = "webotter-time";
    timeStamp.textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
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
  loadingContainer.id = "webotter-loading-container";

  const loadingSpinner = document.createElement("div");
  loadingSpinner.id = "webotter-loading-spinner";

  loadingContainer.appendChild(loadingSpinner);
  document.body.appendChild(loadingContainer);
}

function hideLoadingAnimation() {
  const loadingContainer = document.getElementById("webotter-loading-container");
  if (loadingContainer) {
    document.body.removeChild(loadingContainer);
  }
}
}
