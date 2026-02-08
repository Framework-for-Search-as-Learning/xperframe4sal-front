/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useState } from 'react';
import { Container, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChatHeader } from './ChatHeader';
import { MessageArea } from './MessageArea';
import { MessageInput } from './MessageInput';
import createChat from '../../lib/gemini';
import useCookies from '../../lib/useCookies';
import { marked } from "marked";
import { useTranslation } from 'react-i18next';


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
    const { t } = useTranslation();
    const history = useCookies("history");
    const style = useStyles();

    const [messages, setMessages] = useState(() => {
        const savedMessages = history.getCookie() || [];
        const welcomeMessage = {
            id: 1,
            text: `${t('chatbot_wellcome_part1')} ${BOT_NAME} ${t('chatbot_wellcome_part2')}`,
            sender: "bot",
            role: "model",
            timestamp: new Date(),
            parts: [{ text: `Olá! Sou o assistente ${BOT_NAME}. Como posso te ajudar hoje?` }]
        };
        return savedMessages.length > 1 ? [welcomeMessage, ...savedMessages] : [welcomeMessage];
    });

    const getGeminiHistory = () => {
        return messages
            .filter(msg => msg.id !== 1)
            .map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: msg.parts
            }));
    };

    const chat = createChat(getGeminiHistory());
    const [isTyping, setIsTyping] = useState(false);
    const handleSendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: "user",
            role: "user",
            timestamp: new Date(),
            parts: [{ text: messageText }]
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        try {
            const stream = await chat.sendMessageStream({ message: messageText });

            let fullResponse = "";
            const botMessageId = Date.now() + 1;

            for await (const chunk of stream) {
                fullResponse += chunk.text;

                if (fullResponse === chunk.text) {
                    setIsTyping(false);

                    const botMessage = {
                        id: botMessageId,
                        text: marked(fullResponse),
                        sender: "bot",
                        role: "model",
                        timestamp: new Date(),
                        parts: [{ text: fullResponse }]
                    };

                    setMessages(prev => [...prev, botMessage]);
                } else {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === botMessageId
                                ? {
                                    ...msg,
                                    text: marked(fullResponse),
                                    parts: [{ text: fullResponse }]
                                }
                                : msg
                        )
                    );
                }
            }

            setMessages(prev => {
                const messagesToSave = prev.filter(msg => msg.id !== 1);
                history.replaceCookie(messagesToSave);
                return prev;
            });

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setIsTyping(false);

            const errorMessage = {
                id: Date.now() + 2,
                text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
                sender: "bot",
                role: "model",
                timestamp: new Date(),
                parts: [{ text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente." }]
            };

            setMessages(prev => [...prev, errorMessage]);
        }
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
