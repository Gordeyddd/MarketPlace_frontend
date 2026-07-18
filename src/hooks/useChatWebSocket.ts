import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export function useChatWebSocket(chatId: string, onMessageReceived: (message: ChatMessage) => void) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!chatId) return;

    // В реальном приложении здесь будет ваш WebSocket URL, например:
    // const wsUrl = `${import.meta.env.VITE_WS_URL}/chat/${chatId}?token=${accessToken}`;
    // Для демо используем публичный echo-сервер
    const wsUrl = `wss://echo.websocket.org/?chatId=${chatId}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Игнорируем эхо своих же сообщений в демо, чтобы не дублировать в UI
          if (data.type === 'chat_message' && data.senderId !== 'me') {
            onMessageReceived(data);
          }
        } catch (e) {
          console.warn('Failed to parse WebSocket message', e);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Логика реконнекта с экспоненциальной задержкой (максимум 5 секунд)
        const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 5000);
        
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        ws.current?.close(); // Принудительно закрываем для старта onclose реконнекта
      };
    } catch (err) {
      console.error('Failed to create WebSocket', err);
    }
  }, [chatId, accessToken, onMessageReceived]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null; // Отменяем авто-реконнект при размонтировании
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const msg = {
        type: 'chat_message',
        id: Date.now().toString(),
        text,
        senderId: 'me', // В реальности берем из Auth store
        createdAt: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  return { isConnected, sendMessage };
}
