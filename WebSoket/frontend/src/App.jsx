import { useEffect, useRef, useState } from 'react';

function App() {
    const socketRef = useRef(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // ✅ Connect to WebSocket
        socketRef.current = new WebSocket("wss://localhost:8443");

        socketRef.current.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received:", data);
            setMessages((prev) => [...prev, data]);
        };

        return () => {
            socketRef.current.close();
        };
    }, []);

    const sendMessage = () => {
        const message = {
            type: "chat",
            text: "Hello from frontend!",
        };
        socketRef.current.send(JSON.stringify(message));
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>WebSocket Signaling</h1>
            <button onClick={sendMessage}>Send Test Message</button>

            <h3>Received Messages:</h3>
            <ul>
                {messages.map((msg, i) => (
                    <li key={i}>{msg.text || JSON.stringify(msg)}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
