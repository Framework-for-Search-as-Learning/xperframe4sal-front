/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() => ({
  sidebar: {
    width: '240px',
    minWidth: '240px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '16px 12px 8px',
  },
  newButton: {
    borderRadius: '8px !important',
    textTransform: 'none !important',
    justifyContent: 'flex-start !important',
    padding: '8px 12px !important',
    color: '#202124 !important',
    border: '1px solid #e0e0e0 !important',
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#f1f3f4 !important',
    },
  },
  sessionList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#c1c1c1',
      borderRadius: '4px',
    },
  },
  sessionItem: {
    borderRadius: '8px !important',
    marginBottom: '2px !important',
    '&.Mui-selected': {
      backgroundColor: '#e8f0fe !important',
      '&:hover': {
        backgroundColor: '#d2e3fc !important',
      },
    },
    '&:hover': {
      backgroundColor: '#f1f3f4 !important',
    },
  },
  sessionTitle: {
    fontSize: '14px !important',
    fontWeight: '400 !important',
    color: '#202124',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sessionDate: {
    fontSize: '12px !important',
    color: '#5f6368 !important',
  },
  sectionLabel: {
    fontSize: '11px !important',
    fontWeight: '600 !important',
    color: '#5f6368',
    padding: '8px 12px 4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const ChatSessionSidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  isTyping,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.sidebar}>
      <Box className={classes.sidebarHeader}>
        <Button
          className={classes.newButton}
          startIcon={<AddIcon fontSize="small" />}
          onClick={onNewSession}
          disabled={isTyping}
          fullWidth
          variant="outlined"
        >
          {t('chat_new_conversation')}
        </Button>
      </Box>

      <Divider />

      <Typography className={classes.sectionLabel}>{t('chat_conversations')}</Typography>

      <List className={classes.sessionList} disablePadding>
        {sessions.map((session) => (
          <ListItemButton
            key={session.id}
            className={classes.sessionItem}
            selected={session.id === activeSessionId}
            onClick={() => onSelectSession(session.id)}
          >
            <ListItemText
              primary={
                <Typography className={classes.sessionTitle}>
                  {session.title || t('chat_conversation_default')}
                </Typography>
              }
              secondary={
                <Typography className={classes.sessionDate}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </Typography>
              }
              disableTypography
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export { ChatSessionSidebar };
