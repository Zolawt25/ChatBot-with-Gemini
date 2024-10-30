import React, { useState, useEffect, useRef } from "react";
import botIcon from "./assets/bot.svg";
import userIcon from "./assets/user.svg";
import send from "./assets/send.svg";
import axios from "axios";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const generateUniqueId = () => {
    const timeStamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timeStamp}-${hexadecimalString}`;
  };

  const typeText = (uniqueId, text) => {
    let index = 0;
    const interval = setInterval(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === uniqueId
            ? { ...msg, value: text.slice(0, index + 1) }
            : msg
        )
      );

      if (index < text.length - 1) {
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = { isAi: false, value: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const uniqueId = generateUniqueId();
      const botMessage = { isAi: true, value: "", id: uniqueId };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      setLoading(true);

      const res = await axios.post(
        `https://chat-bot-server-azure.vercel.app/gemini`,
        {
          prompt: input,
        }
      );
      setInput("");

      const botResponse = res.data.bot;
      setLoading(false);

      typeText(uniqueId, botResponse);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { isAi: true, value: "Sorry, something went wrong. Please try again!" },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessages = () => {
    return messages.map((msg, index) => (
      <div key={index} className={`wrapper ${msg.isAi ? "ai" : ""}`}>
        <div className="chat">
          <div className="profile">
            <img
              src={msg.isAi ? botIcon : userIcon}
              alt={msg.isAi ? "bot" : "user"}
            />
          </div>
          <div className="message">{msg.value || (loading && "...")}</div>
        </div>
      </div>
    ));
  };

  return (
    <div id="app">
      <div id="chat_container" ref={chatContainerRef}>
        {renderMessages()}
        {messages.length === 0 && (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                textAlign: "center",
                width: "100%",
                color: "gray",
                fontSize: "20px",
              }}
            >
              Ask me any thing...
            </p>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          name="prompt"
          cols="1"
          rows="1"
          placeholder="Ask CodeX..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          required
        ></textarea>
        <button type="submit">
          <img src={send} alt="send" />
        </button>
      </form>
    </div>
  );
};

export default App;
