import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComments,
    faImage,
    faMicrophone,
    faPaperPlane,
    faServer,
    faTimes,
    faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { AnimatePresence, motion } from 'framer-motion';

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
    ${tw`fixed bottom-6 right-6 z-50 flex flex-col items-end`};
`;

const ChatButton = styled(motion.button).attrs({ type: 'button' })`
    ${tw`w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center text-xl cursor-pointer focus:outline-none`};
    animation: ${float} 3s ease-in-out infinite;
    &:hover {
        ${tw`shadow-xl`};
    }
`;

const ChatWindow = styled(motion.div)`
    ${tw`mb-4 w-80 md:w-96 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-700`};
    height: 500px;
    backdrop-filter: blur(10px);
`;

const Header = styled.div`
    ${tw`p-4 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center`};
`;

const MessagesArea = styled.div`
    ${tw`flex-1 p-4 overflow-y-auto flex flex-col gap-3`};
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }
`;

const InputArea = styled.div`
    ${tw`p-3 bg-gray-800/50 border-t border-gray-700 flex items-center gap-2`};
`;

const MessageBubble = styled.div<{ isOwn?: boolean }>`
    ${tw`p-3 rounded-2xl text-sm max-w-[80%] relative`};
    ${(props) =>
        props.isOwn
            ? tw`bg-purple-600 text-white self-end rounded-br-none`
            : tw`bg-gray-700 text-gray-200 self-start rounded-bl-none`};
`;

const AdminBadge = styled.span`
    ${tw`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-red-500 text-white inline-flex items-center gap-1`};
    animation: ${glow} 2s infinite;
`;

const ActionButton = styled.button.attrs({ type: 'button' })`
    ${tw`text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10`};
`;

const TextInput = styled.input`
    ${tw`flex-1 bg-gray-900/50 border border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors`};
`;

// --- Types ---
interface Message {
    id: number;
    user: string;
    avatar: string;
    content: string;
    type: 'text' | 'audio' | 'image' | 'share';
    isAdmin?: boolean;
    isOwn?: boolean;
    timestamp: string;
}

export default () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const user = useStoreState((state: any) => state.user.data);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock Messages
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            user: 'System',
            avatar: '',
            content: 'Welcome to the Global Chat!',
            type: 'text',
            isAdmin: true,
            timestamp: '12:00',
            isOwn: false,
        },
        {
            id: 2,
            user: 'Davizuni17',
            avatar: '',
            content: 'Check out my new server config!',
            type: 'text',
            isAdmin: true,
            timestamp: '12:05',
            isOwn: false,
        },
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            user: user?.username || 'Guest',
            avatar: user?.avatar_url || '',
            content: inputValue,
            type: 'text',
            isAdmin: user?.root_admin,
            isOwn: true,
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages([...messages, newMessage]);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
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
                            <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                                <span className='font-bold text-white tracking-wide'>Global Chat</span>
                            </div>
                            <button
                                type='button'
                                onClick={() => setIsOpen(false)}
                                className='text-gray-400 hover:text-white'
                                aria-label='Close chat'
                                title='Close chat'
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </Header>

                        <MessagesArea>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}
                                >
                                    {!msg.isOwn && (
                                        <div className='flex items-center gap-2 mb-1 ml-1'>
                                            <span className='text-xs text-gray-400 font-bold'>{msg.user}</span>
                                            {msg.isAdmin && (
                                                <AdminBadge>
                                                    <FontAwesomeIcon icon={faUserShield} size='xs' />
                                                    ADMIN
                                                </AdminBadge>
                                            )}
                                        </div>
                                    )}
                                    <MessageBubble isOwn={msg.isOwn}>
                                        {msg.type === 'text' && msg.content}
                                        {msg.type === 'share' && (
                                            <div className='flex items-center gap-2 bg-black/20 p-2 rounded'>
                                                <FontAwesomeIcon icon={faServer} className='text-yellow-400' />
                                                <span>Shared Server Config</span>
                                            </div>
                                        )}
                                    </MessageBubble>
                                    <span className='text-[10px] text-gray-500 mt-1 mx-1'>{msg.timestamp}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </MessagesArea>

                        <InputArea>
                            <ActionButton title='Share Work' aria-label='Share work'>
                                <FontAwesomeIcon icon={faServer} />
                            </ActionButton>
                            <ActionButton title='Send Image' aria-label='Send image'>
                                <FontAwesomeIcon icon={faImage} />
                            </ActionButton>
                            <ActionButton title='Send Audio' aria-label='Send audio'>
                                <FontAwesomeIcon icon={faMicrophone} />
                            </ActionButton>
                            <TextInput
                                placeholder='Type a message...'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                type='button'
                                onClick={handleSend}
                                className='w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors'
                                aria-label='Send message'
                                title='Send message'
                            >
                                <FontAwesomeIcon icon={faPaperPlane} size='sm' />
                            </button>
                        </InputArea>
                    </ChatWindow>
                )}
            </AnimatePresence>

            <ChatButton
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                title={isOpen ? 'Close chat' : 'Open chat'}
            >
                <FontAwesomeIcon icon={isOpen ? faTimes : faComments} />
            </ChatButton>
        </ChatContainer>
    );
};
