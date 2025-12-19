
// --- 1. IMPORTS & CONFIGURATION ---
const API_URL = 'http://127.0.0.1:5000/ask_ai'; 
const USER_ID_A = 'student_revolution'; 
const USER_ID_B = 'student_advanced'; 
const CURRENT_USER_ID = USER_ID_A; 

// --- 2. REACT COMPONENT SIMULATION ---

function ChatInterface() {
    const [messages, setMessages] = React.useState([
        { id: 1, text: "नमस्ते! मैं आपका Cognitive Mentor हूँ। आज आप क्या सीखना चाहेंगे?", sender: 'ai' },
    ]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentMode, setCurrentMode] = React.useState('Loading...');

    // --- VOICE FEATURES (NEW) ---

    // 1. AI के बोलने के लिए फ़ंक्शन (Text-to-Speech)
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // पिछली आवाज़ रोकें
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN'; // हिंदी/इंग्लिश मिक्स सपोर्ट
            utterance.rate = 1.0;     // रफ़्तार
            window.speechSynthesis.speak(utterance);
        }
    };

    // 2. स्टूडेंट की आवाज़ सुनने के लिए फ़ंक्शन (Speech-to-Text)
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'hi-IN'; // हिंदी/इंग्लिश सुन सकता है
            
            recognition.onstart = () => {
                console.log("Listening...");
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript); // जो बोला उसे इनपुट बॉक्स में डालें
            };

            recognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
            };

            recognition.start();
        } else {
            alert("आपका ब्राउज़र वॉइस सपोर्ट नहीं करता। कृपया Chrome का उपयोग करें।");
        }
    };

    React.useEffect(() => {
        if (CURRENT_USER_ID === USER_ID_A) {
            setCurrentMode('Revolutionary Mode (Class 10 Physics/Analogy)');
        } else {
            setCurrentMode('Advanced Mode (B.Tech DSA/Logic)');
        }
    }, []);
    
    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        const userQuestion = input.trim();
        const newUserMessage = { id: Date.now(), text: userQuestion, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        
        setInput('');
        setIsLoading(true);

        setTimeout(() => {
            const chatWindow = document.getElementById('chat-window');
            if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 100);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: CURRENT_USER_ID,
                    question: userQuestion,
                }),
            });
            
            const data = await response.json();
            const aiResponseText = data.response || "Sorry, the AI Mentor is currently offline.";
            
            const aiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };
            setMessages((prevMessages) => [...prevMessages, aiMessage]);

            // --- AI को बोलने के लिए कॉल करें ---
            speak(aiResponseText);

        } catch (error) {
            console.error("API Call Failed:", error);
            const errorMessage = { id: Date.now() + 1, text: "Connection error. Please ensure your Python server is running.", sender: 'ai' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                const chatWindow = document.getElementById('chat-window');
                if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
            }, 100);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', maxWidth: '800px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '10px', backgroundColor: '#fffbe6', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #fae3be' }}>
                Mode: <span style={{ color: '#d97706' }}>{currentMode}</span>
            </div>

            <div id="chat-window" style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: '#f9fafb' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                        <div style={{ 
                                maxWidth: '70%', 
                                padding: '10px 15px', 
                                borderRadius: '15px', 
                                color: msg.sender === 'user' ? 'white' : 'black',
                                backgroundColor: msg.sender === 'user' ? '#3b82f6' : '#d1fae5',
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap' 
                            }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '10px 15px', borderRadius: '15px' }}>
                            Cognitive Mentor is synthesizing a personalized response...
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', padding: '15px', borderTop: '1px solid #ccc', backgroundColor: 'white', alignItems: 'center' }}>
                {/* --- माइक बटन (NEW) --- */}
                <button 
                    onClick={startListening}
                    style={{ marginRight: '10px', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}
                    title="बोलकर पूछें"
                >
                    🎤
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    placeholder="Ask your query or use Mic..."
                    style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '5px 0 0 5px', fontSize: '16px', outline: 'none' }}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0 5px 5px 0', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    disabled={isLoading}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.render(<ChatInterface />, rootElement);
}