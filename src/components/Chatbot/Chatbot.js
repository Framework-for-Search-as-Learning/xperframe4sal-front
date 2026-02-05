import { useState, useEffect, useRef } from 'react';
import { Container, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChatHeader } from './ChatHeader';
import { MessageArea } from './MessageArea';
import { MessageInput } from './MessageInput';
import { marked } from "marked";
import { useTranslation } from 'react-i18next';

// Configurações da API
const API_URL = 'http://localhost:3000/searching-as-learning'

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

const BOT_NAME = "XF4 Bot";

// Adicionei taskId como prop, pois precisamos saber qual experimento iniciar
const Chatbot = ({ taskId, user }) => { 
    const { t } = useTranslation();
    const style = useStyles();
    
    // Estado para guardar o ID da sessão atual criado pelo backend
    const [sessionId, setSessionId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);


    const sessionInitialized = useRef(false); // Trava para não duplicar sessão
    const abortControllerRef = useRef(null);  // Para cancelar requisição se necessário
    
    // Mensagem inicial estática (apenas visual)
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `${t('chatbot_wellcome_part1')} ${BOT_NAME} ${t('chatbot_wellcome_part2')}`,
            sender: "bot",
            role: "model",
            timestamp: new Date(),
            parts: [{ text: `Olá! Sou o assistente ${BOT_NAME}. Como posso te ajudar hoje?` }]
        }
    ]);

    // 1. Ao montar o componente, cria a sessão no Backend
    useEffect(() => {

        if(sessionInitialized.current || !taskId || !user || !user.accessToken) return;

        const initSession = async () => {
            sessionInitialized.current = true;
            try {
                const response = await fetch(`${API_URL}/llm-session/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.accessToken}` 
                    },
                    body: JSON.stringify({ taskId: taskId, userId: user.id })
                });

                if (response.ok) {
                    const data = await response.json();
                    setSessionId(data.id); // Guarda o ID da sessão para usar nas mensagens
                    console.log("Sessão iniciada:", data.id);
                    console.log("DataChat: ", data)
                    if(data.messages && data.messages.length > 0){
                       const history = data.messages.map(msg => ({
                            id: msg.id,
                            // Se for bot, já passamos o marked. Se for user, texto puro.
                            text: msg.role === 'model' ? marked(msg.content) : msg.content,
                            sender: msg.role === 'user' ? 'user' : 'bot',
                            role: msg.role,
                            timestamp: new Date(msg.createdAt)
                        }));

                        setMessages(prev => {
                            const welcome = prev.find(m => m.id === 1);
                            // Fallback de segurança caso não ache a msg de boas vindas
                            const initialMsg = welcome || prev[0]; 
                            return [initialMsg, ...history];
                        });
                    }
                    
                } else {
                    console.error("Falha ao iniciar sessão");
                    sessionInitialized.current = false;
                }
            } catch (error) {
                console.error("Erro ao conectar com backend:", error);
                sessionInitialized.current = false;
            }
        };

        if (taskId && user && user.accessToken) {
            initSession();
        }
    }, [taskId, user]);


    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || !sessionId) return;

        // Cancela requisição anterior se houver (evita bugs de digitação rápida)
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        // Adiciona mensagem do usuário na tela imediatamente
        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: "user",
            role: "user",
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const token = user.accessToken;

            // 2. Faz a requisição para o endpoint de Stream do seu Backend
            const response = await fetch(`${API_URL}/llm-session/${sessionId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: messageText, userId: user.id}),
                signal: abortControllerRef.current.signal
            });

            if (!response.body) throw new Error('ReadableStream not supported.');

            // 3. Configura a leitura do Stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            
            let fullResponse = "";
            const botMessageId = Date.now() + 1;

            // Cria o balão vazio do bot para começar a preencher
            setMessages(prev => [...prev, {
                id: botMessageId,
                text: "", 
                sender: "bot",
                role: "model",
                timestamp: new Date(),
            }]);

            // 4. Loop de leitura (enquanto houver dados chegando)
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;


                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === botMessageId 
                            ? { ...msg, text: marked(fullResponse) } 
                            : msg
                    )
                );

            }

        } catch (error) {
            if (error.name === 'AbortError') return; // Ignora se foi cancelado
            console.error('Erro:', error);
            
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                text: "Erro de conexão ou resposta interrompida.",
                sender: "bot",
                role: "model",
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsTyping(false);
            abortControllerRef.current = null;
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