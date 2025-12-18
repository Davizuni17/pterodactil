import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faPaperPlane, faMicrophone, faImage, faServer, faTimes, faUserShield, faStop } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { AnimatePresence, motion } from 'framer-motion';
import http from '@/api/http';
import useSWR from 'swr';

// --- Animations ---
const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
`;

const glow = keyframes`
    0% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.5); }
    50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.8), 0 0 10px rgba(236, 72, 153, 0.5); }
    100% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.5); }
`;

// --- Styled Components ---
const ChatContainer = styled(motion.div)`
    ${tw`fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 z-50 flex flex-col items-end`};
`;

const ChatButton = styled(motion.button)`
    ${tw`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center text-lg sm:text-xl cursor-pointer focus:outline-none`};
    animation: ${float} 3s ease-in-out infinite;
    &:hover {
        ${tw`shadow-xl`};
    }
`;

const ChatWindow = styled(motion.div)`
    ${tw`mb-4 w-full sm:w-80 md:w-96 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-700`};
    height: 500px;
    backdrop-filter: blur(10px);

    @media (max-width: 640px) {
        height: calc(100vh - 7rem);
    }
`;

const Header = styled.div`
    ${tw`p-3 sm:p-4 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center`};
`;

const MessagesArea = styled.div`
    ${tw`flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3`};
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
    }
`;

const InputArea = styled.div`
    ${tw`p-2.5 sm:p-3 bg-gray-800/50 border-t border-gray-700 flex flex-wrap sm:flex-nowrap items-center gap-2`};
`;

const MessageBubble = styled.div<{ isOwn?: boolean }>`
    ${tw`p-3 rounded-2xl text-sm max-w-[80%] relative break-words`};
    ${props => props.isOwn ? tw`bg-purple-600 text-white self-end rounded-br-none` : tw`bg-gray-700 text-gray-200 self-start rounded-bl-none`};
`;

const AdminBadge = styled.span`
    ${tw`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-red-500 text-white inline-flex items-center gap-1`};
    animation: ${glow} 2s infinite;
`;

const ActionButton = styled.button`
    ${tw`text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10`};
`;

const TextInput = styled.input`
    ${tw`flex-1 min-w-0 bg-gray-900/50 border border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors`};
`;

// --- Types ---
interface Message {
    id: number;
    user: {
        username: string;
        root_admin: boolean;
    };
    content: string;
    type: 'text' | 'audio' | 'image' | 'share';
    attachment_url?: string;
    created_at: string;
}

export default () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const user = useStoreState((state: any) => state.user.data);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Fetch messages every 3 seconds
    const { data: messages, mutate } = useSWR<Message[]>('/api/client/chat', (url) => http.get(url).then(r => r.data), { refreshInterval: 3000 });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const sendMessage = async (type: string, content: string, file?: File) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('content', content);
        if (file) formData.append('file', file);

        try {
            await http.post('/api/client/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            mutate(); // Refresh messages
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage('text', inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            sendMessage('image', 'Sent an image', e.target.files[0]);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], 'voice_message.wav', { type: 'audio/wav' });
                sendMessage('audio', 'Sent a voice message', audioFile);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleShareWork = () => {
        // Simple implementation: Share current URL
        sendMessage('share', `Check out this page: ${window.location.href}`);
    };

    return (
        <ChatContainer>
            <AnimatePresence>
                {isOpen && (
                    <ChatWindow
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <Header>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-bold text-white tracking-wide">Global Chat</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </Header>

                        <MessagesArea>
                            {messages?.map((msg) => {
                                const isOwn = msg.user.username === user?.username;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                        {!isOwn && (
                                            <div className="flex items-center gap-2 mb-1 ml-1">
                                                <span className="text-xs text-gray-400 font-bold">{msg.user.username}</span>
                                                {msg.user.root_admin && (
                                                    <AdminBadge>
                                                        <FontAwesomeIcon icon={faUserShield} size="xs" />
                                                        ADMIN
                                                    </AdminBadge>
                                                )}
                                            </div>
                                        )}
                                        <MessageBubble isOwn={isOwn}>
                                            {msg.type === 'text' && msg.content}
                                            {msg.type === 'share' && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs opacity-75">Shared a link:</span>
                                                    <a href={msg.content.split(': ')[1]} target="_blank" rel="noreferrer" className="text-blue-300 underline break-all">
                                                        {msg.content.split(': ')[1]}
                                                    </a>
                                                </div>
                                            )}
                                            {msg.type === 'image' && msg.attachment_url && (
                                                <img src={msg.attachment_url} alt="Shared" className="max-w-full rounded-lg mt-1" style={{ maxHeight: '150px' }} />
                                            )}
                                            {msg.type === 'audio' && msg.attachment_url && (
                                                <audio controls src={msg.attachment_url} className="mt-1" style={{ height: '30px', maxWidth: '200px' }} />
                                            )}
                                        </MessageBubble>
                                        <span className="text-[10px] text-gray-500 mt-1 mx-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </MessagesArea>

                        <InputArea>
                            <ActionButton title="Share Work" onClick={handleShareWork}>
                                <FontAwesomeIcon icon={faServer} />
                            </ActionButton>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <ActionButton title="Send Image" onClick={() => fileInputRef.current?.click()}>
                                <FontAwesomeIcon icon={faImage} />
                            </ActionButton>

                            <ActionButton
                                title={isRecording ? "Stop Recording" : "Send Audio"}
                                onClick={isRecording ? stopRecording : startRecording}
                                className={isRecording ? "text-red-500 animate-pulse" : ""}
                            >
                                <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
                            </ActionButton>

                            <TextInput
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                onClick={handleSend}
                                className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} size="sm" />
                            </button>
                        </InputArea>
                    </ChatWindow>
                )}
            </AnimatePresence>

            <ChatButton
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <FontAwesomeIcon icon={isOpen ? faTimes : faComments} />
            </ChatButton>
        </ChatContainer>
    );
};
