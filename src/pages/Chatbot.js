import React, { useState } from 'react';
import {
    Container,
    Box,
    Paper
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChatHeader } from '../components/Chatbot/ChatHeader';
import { MessageArea } from '../components/Chatbot/MessageArea';
import { MessageInput } from '../components/Chatbot/MessageInput';

const useStyles = makeStyles((theme) => ({
    chatContainer: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        padding: '0 !important',
        maxWidth: '100% !important',
    },
    chatPaper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0 !important',
        backgroundColor: '#ffffff',
    },
}));

const BOT_NAME = "XF4 Bot"

const Chatbot = () => {
    const style = useStyles();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Olá! Sou o assistente ${BOT_NAME}. Como posso te ajudar hoje?`,
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSendMessage = (messageText) => {
        if (!messageText.trim()) return;

        // Adiciona mensagem do usuário
        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Simula resposta do bot após 1 segundo
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                text: "Olá! Recebi sua mensagem. Como posso ajudá-lo?",
                sender: "bot",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <Container className={style.chatContainer}>
            <Paper className={style.chatPaper} elevation={0}>
                <ChatHeader bot_name={BOT_NAME} />
                <MessageArea messages={messages} isTyping={isTyping} />
                <MessageInput onSendMessage={handleSendMessage} />
            </Paper>
        </Container>
    );
};

export { Chatbot };
