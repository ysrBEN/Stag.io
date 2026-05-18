import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestQuestions = [
        "Quelles offres correspondent à mes skills?",
        "Comment améliorer mon profil?",
        "Chno les meilleures entreprises sur la plateforme?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        const newMessages = [...messages, userMsg];
        setMessages([...newMessages, { role: 'assistant', content: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://stag-io-b8nn.onrender.com/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: text,
                    conversationHistory: messages.slice(-4)
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete lines only
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);

                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6);
                    if (data === '[DONE]') break;

                    try {
                        const { token } = JSON.parse(data);
                        if (token) {
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = { ...updated[updated.length - 1] };
                                last.content = last.content + token;
                                updated[updated.length - 1] = last;
                                return updated;
                            });
                        }
                    } catch (e) { }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = 'Désolé, je rencontre un problème de connexion. Réessayez plus tard.';
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-teal-500 hover:bg-teal-400 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-[9999]"
                    style={{ zIndex: 9999 }}
                >
                    <MessageCircle className="w-7 h-7" />
                </button>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-80 md:max-w-[400px] h-[500px] bg-[#0F1C2E] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] animate-fade-in-up"
                    style={{ zIndex: 9999, animation: 'slideUp 0.3s ease-out' }}
                >
                    {/* Header */}
                    <div className="bg-teal-600 p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-2 text-white font-bold">
                            <span>🤖</span>
                            <span>Stag.io Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111827]">
                        {messages.length === 0 && (
                            <div className="space-y-4">
                                <div className="bg-[#1F2937] p-3 rounded-lg rounded-tl-none border border-white/5 text-gray-200 text-sm w-[85%]">
                                    Bonjour! Je suis l'assistant AI de Stag.io. Comment puis-je vous aider aujourd'hui?
                                </div>
                                <div className="flex flex-col space-y-2 mt-4">
                                    <p className="text-xs text-gray-400">Questions suggérées :</p>
                                    {suggestQuestions.map((sq, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(sq)}
                                            className="text-left text-sm bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 px-3 py-2 rounded-lg border border-teal-500/20 transition-colors"
                                        >
                                            {sq}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-[85%] text-sm ${msg.role === 'user'
                                    ? 'bg-teal-500 text-white rounded-tr-none'
                                    : 'bg-[#1F2937] text-gray-200 rounded-tl-none border border-white/5 whitespace-pre-wrap'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#1F2937] p-3 rounded-lg rounded-tl-none border border-white/5 flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-[#0F1C2E] border-t border-white/10 shrink-0">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center space-x-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tapez votre message..."
                                className="flex-1 bg-[#1F2937] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-teal-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-teal-500 hover:bg-teal-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default ChatBot;
