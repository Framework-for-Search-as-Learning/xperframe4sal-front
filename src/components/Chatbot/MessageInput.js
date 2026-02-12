/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SendIcon from '@mui/icons-material/Send';

const useStyles = makeStyles((theme) => ({
    inputContainer: {
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
    },
    inputPaper: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '24px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        '&:hover': {
            borderColor: '#4285f4',
        },
        '&:focus-within': {
            borderColor: '#4285f4',
            boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
        },
    },
    textField: {
        flex: 1,
        '& .MuiOutlinedInput-root': {
            border: 'none',
            borderRadius: '24px',
            '& fieldset': {
                border: 'none',
            },
            '&:hover fieldset': {
                border: 'none',
            },
            '&.Mui-focused fieldset': {
                border: 'none',
            },
        },
        '& .MuiInputBase-input': {
            padding: '12px 16px',
            fontSize: '14px',
            '&::placeholder': {
                color: '#5f6368',
                opacity: 1,
            },
        },
    },
    sendButton: {
        margin: '4px',
        padding: '8px',
        backgroundColor: '#4285f4',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#3367d6',
        },
        '&:disabled': {
            backgroundColor: '#f1f3f4',
            color: '#9aa0a6',
        },
    },
}));

const MessageInput = ({ onSendMessage }) => {
    const classes = useStyles();
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <Box className={classes.inputContainer}>
            <Paper className={classes.inputPaper} elevation={0}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
                    <TextField
                        className={classes.textField}
                        placeholder="Digite sua mensagem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        multiline
                        maxRows={4}
                        variant="outlined"
                    />
                    <IconButton
                        type="submit"
                        className={classes.sendButton}
                        disabled={!message.trim()}
                    >
                        <SendIcon />
                    </IconButton>
                </form>
            </Paper>
        </Box>
    );
};

export { MessageInput };
