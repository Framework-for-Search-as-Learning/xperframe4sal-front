/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useEffect, useRef } from 'react';
import {
    Box,
    Typography
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

const useStyles = makeStyles((theme) => ({
    messageArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
                backgroundColor: '#a8a8a8',
            },
        },
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#5f6368',
    },
}));

const MessageArea = ({ messages, isTyping }) => {
    const classes = useStyles();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    return (
        <Box className={classes.messageArea}>
            {messages.length === 0 ? (
                <Box className={classes.emptyState}>
                    <Typography variant="h6">
                        Começe uma conversa
                    </Typography>
                    <Typography variant="body2">
                        Digite sua mensagem abaixo para começar
                    </Typography>
                </Box>
            ) : (
                messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                    />
                ))
            )}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export { MessageArea };
