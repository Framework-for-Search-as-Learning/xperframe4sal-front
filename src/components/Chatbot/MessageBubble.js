/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
    Box,
    Typography,
    Avatar
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const useStyles = makeStyles((theme) => ({
    messageContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        '&.user': {
            flexDirection: 'row-reverse',
        },
    },
    avatar: {
        width: '32px',
        height: '32px',
        '&.bot': {
            backgroundColor: '#4285f4',
        },
        '&.user': {
            backgroundColor: '#34a853',
        },
    },
    messageContent: {
        maxWidth: '70%',
        '&.user': {
            alignItems: 'flex-end',
        },
    },
    messageBubble: {
        padding: '12px 16px',
        borderRadius: '18px',
        wordWrap: 'break-word',
        '&.bot': {
            backgroundColor: '#f1f3f4',
            color: '#202124',
            borderBottomLeftRadius: '4px',
        },
        '&.user': {
            backgroundColor: '#4285f4',
            color: '#ffffff',
            borderBottomRightRadius: '4px',
        },
    },
    messageText: {
        fontSize: '14px',
        lineHeight: '1.4',
        margin: '0 !important',
    },
    timestamp: {
        fontSize: '12px',
        color: '#5f6368',
        marginTop: '4px',
        margin: '4px 0 0 0 !important',
    },
}));

const MessageBubble = ({ message }) => {
    const classes = useStyles();
    const isUser = message.sender === 'user';

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Box className={`${classes.messageContainer} ${isUser ? 'user' : 'bot'}`}>
            <Avatar className={`${classes.avatar} ${isUser ? 'user' : 'bot'}`}>
                {isUser ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>

            <Box className={`${classes.messageContent} ${isUser ? 'user' : 'bot'}`}>
                <Box className={`${classes.messageBubble} ${isUser ? 'user' : 'bot'}`}>
                    <Typography className={classes.messageText}>
                        <div dangerouslySetInnerHTML={{ __html: message.text }} />
                    </Typography>
                </Box>
                <Typography className={classes.timestamp}>
                    {formatTime(message.timestamp)}
                </Typography>
            </Box>
        </Box>
    );
};

export { MessageBubble };
