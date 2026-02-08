/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    Divider
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const useStyles = makeStyles((theme) => ({
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        minHeight: '64px',
    },
    avatar: {
        backgroundColor: '#4285f4',
        marginRight: '12px',
        width: '40px',
        height: '40px',
    },
    titleContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        fontSize: '18px',
        fontWeight: '500',
        color: '#202124',
        margin: '0 !important',
    },
    subtitle: {
        fontSize: '14px',
        color: '#5f6368',
        margin: '0 !important',
    },
}));

const ChatHeader = ({ bot_name }) => {
    const classes = useStyles();

    return (
        <>
            <Box className={classes.header}>
                <Avatar className={classes.avatar}>
                    <SmartToyIcon />
                </Avatar>
                <Box className={classes.titleContainer}>
                    <Typography className={classes.title}>
                        {bot_name}
                    </Typography>
                    <Typography className={classes.subtitle}>
                        Assistente de IA
                    </Typography>
                </Box>
            </Box>
        </>
    );
};

export { ChatHeader };
