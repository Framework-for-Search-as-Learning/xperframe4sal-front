/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
    Box,
    Avatar
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { LoadingEffect } from '../Loading';

const useStyles = makeStyles((theme) => ({
    typingContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
    },
    avatar: {
        width: '32px',
        height: '32px',
        backgroundColor: '#4285f4',
    },
    typingBubble: {
        backgroundColor: '#f1f3f4',
        borderRadius: '18px',
        borderBottomLeftRadius: '4px',
        padding: '12px 16px',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#5f6368',
        animation: 'bounce 1.4s infinite',
        '&:nth-child(1)': {
            animationDelay: '0s',
        },
        '&:nth-child(2)': {
            animationDelay: '0.2s',
        },
        '&:nth-child(3)': {
            animationDelay: '0.4s',
        },
    },
    '@keyframes bounce': {
        '0%, 60%, 100%': {
            transform: 'translateY(0)',
        },
        '30%': {
            transform: 'translateY(-8px)',
        },
    },
}));

const TypingIndicator = () => {
    const classes = useStyles();

    return (
        <Box className={classes.typingContainer}>
            <Avatar className={classes.avatar}>
                <SmartToyIcon />
            </Avatar>

            <Box className={classes.typingBubble}>
                <LoadingEffect />
            </Box>
        </Box>
    );
};

export { TypingIndicator };
