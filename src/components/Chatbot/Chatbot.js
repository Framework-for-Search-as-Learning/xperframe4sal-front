/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useState, useEffect, useRef } from 'react';
import { Container, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChatHeader } from './ChatHeader';
import { ChatSessionSidebar } from './ChatSessionSidebar';
import { MessageArea } from './MessageArea';
import { MessageInput } from './MessageInput';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/searchat-behavior';

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    position: 'fixed',
    top: 56,
    [theme.breakpoints.up('sm')]: {
      top: 64,
    },
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
    padding: '0 !important',
    maxWidth: '100% !important',
    overflow: 'hidden',
  },
  chatPaper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '0 !important',
    backgroundColor: '#ffffff',
    minWidth: 0,
  },
}));

const BOT_NAME = 'Search Behavior Bot';

const buildWelcomeMessage = (t) => ({
  id: 'welcome',
  text: `${t('chatbot_wellcome_part1')} ${BOT_NAME} ${t('chatbot_wellcome_part2')}`,
  sender: 'bot',
  role: 'model',
  timestamp: new Date(),
});

const mapHistoryMessages = (apiMessages) =>
  apiMessages.map((msg) => ({
    id: msg.id,
    text: msg.role === 'model' ? marked(msg.content) : msg.content,
    sender: msg.role === 'user' ? 'user' : 'bot',
    role: msg.role,
    timestamp: new Date(msg.createdAt),
  }));

const Chatbot = ({ taskId, user }) => {
  const { t } = useTranslation();
  const style = useStyles();

  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(t)]);

  const sessionInitialized = useRef(false);
  const abortControllerRef = useRef(null);

  const loadSession = async (targetSessionId) => {
    try {
      const response = await fetch(`${API_URL}/llm-session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ taskId, userId: user.id, sessionId: targetSessionId }),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };

  const applySessionData = (data) => {
    setSessionId(data.id);
    if (data.messages && data.messages.length > 0) {
      setMessages([buildWelcomeMessage(t), ...mapHistoryMessages(data.messages)]);
    } else {
      setMessages([buildWelcomeMessage(t)]);
    }
  };

  useEffect(() => {
    if (sessionInitialized.current || !taskId || !user?.accessToken) return;
    sessionInitialized.current = true;

    const init = async () => {
      try {
        const listRes = await fetch(`${API_URL}/llm-session?userId=${user.id}&taskId=${taskId}`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        let sessionsList = [];
        if (listRes.ok) {
          sessionsList = await listRes.json();
          setSessions(sessionsList);
        }

        const latest = sessionsList[sessionsList.length - 1];
        const startBody = latest
          ? { taskId, userId: user.id, sessionId: latest.id }
          : { taskId, userId: user.id };

        const startRes = await fetch(`${API_URL}/llm-session/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(startBody),
        });

        if (startRes.ok) {
          const data = await startRes.json();
          applySessionData(data);
          if (sessionsList.length === 0) {
            setSessions([{ id: data.id, title: data.title, createdAt: data.createdAt }]);
          }
        } else {
          sessionInitialized.current = false;
        }
      } catch {
        sessionInitialized.current = false;
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, user]);

  const handleSelectSession = async (targetSessionId) => {
    if (targetSessionId === sessionId || isTyping) return;
    const data = await loadSession(targetSessionId);
    if (data) applySessionData(data);
  };

  const handleNewSession = async () => {
    if (isTyping) return;
    try {
      const response = await fetch(`${API_URL}/llm-session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ taskId, userId: user.id, forceNew: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessions((prev) => [
          ...prev,
          { id: data.id, title: data.title, createdAt: data.createdAt },
        ]);
        applySessionData(data);
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !sessionId) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/llm-session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ content: messageText, userId: user.id }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let fullResponse = '';
      let hasReceivedFirstChunk = false;
      const botMessageId = Date.now() + 1;

      setMessages((prev) => [
        ...prev,
        { id: botMessageId, text: '', sender: 'bot', role: 'model', timestamp: new Date() },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsTyping(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        if (!hasReceivedFirstChunk && fullResponse.length > 0) {
          hasReceivedFirstChunk = true;
          setIsTyping(false);
        }

        const renderedResponse = marked(fullResponse);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === botMessageId ? { ...msg, text: renderedResponse } : msg)),
        );
      }
    } catch (error) {
      setIsTyping(false);
      if (error.name === 'AbortError') return;
      console.error('Erro:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: 'Erro de conexão ou resposta interrompida.',
          sender: 'bot',
          role: 'model',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <Container className={style.chatContainer}>
      {sidebarOpen && (
        <ChatSessionSidebar
          sessions={sessions}
          activeSessionId={sessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          isTyping={isTyping}
        />
      )}
      <Paper className={style.chatPaper} elevation={0}>
        <ChatHeader bot_name={BOT_NAME} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <MessageArea messages={messages} isTyping={isTyping} />
        <MessageInput onSendMessage={handleSendMessage} />
      </Paper>
    </Container>
  );
};

export { Chatbot };
