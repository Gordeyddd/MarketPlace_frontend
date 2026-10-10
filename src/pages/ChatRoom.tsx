import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { useChatWebSocket, type ChatMessage } from '../hooks/useChatWebSocket';

// Честный фетчер истории сообщений без моковых пользователей и диалогов
const fetchChatHistory = async () => {
  return {
    messages: [] as ChatMessage[],
    nextPage: undefined,
  };
};

export function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);

  // 1. Загрузка истории
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['chat', id],
    queryFn: fetchChatHistory,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // 2. Обработка входящих real-time сообщений
  const handleNewMessage = useCallback((msg: ChatMessage) => {
    setRealtimeMessages(prev => [...prev, msg]);
  }, []);

  const { isConnected, sendMessage } = useChatWebSocket(id || 'default', handleNewMessage);

  // 3. Авто-скролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data, realtimeMessages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const sentMsg: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      senderId: 'me',
      createdAt: new Date().toISOString(),
    };
    
    setRealtimeMessages(prev => [...prev, sentMsg]);
    sendMessage(newMessage);
    setNewMessage('');
  };

  const historyMessages = data?.pages.slice().reverse().flatMap(page => page.messages) || [];
  const allMessages = [...historyMessages, ...realtimeMessages];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F8F9FA] fixed inset-0 z-[100] md:static md:h-[600px] md:rounded-3xl md:border md:border-slate-200 md:shadow-lg md:overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full md:hidden"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Чат #{id}</h2>
              <p className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                {isConnected ? 'В сети' : 'Подключение...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {hasNextPage && (
          <button 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 mx-auto bg-blue-50 px-4 py-2 rounded-full mb-2 active:scale-95 transition-transform"
          >
            {isFetchingNextPage ? 'Загрузка...' : 'Загрузить историю'}
          </button>
        )}
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">Загрузка...</div>
        ) : allMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Сообщений пока нет</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Отправьте первое сообщение, чтобы начать диалог.
            </p>
          </div>
        ) : (
          allMessages.map(msg => (
            <div 
              key={msg.id} 
              className={clsx(
                "max-w-[75%] rounded-2xl p-3 text-sm shadow-sm relative group",
                msg.senderId === 'me' 
                  ? "bg-blue-600 text-white self-end rounded-br-sm" 
                  : "bg-white border border-slate-100 text-slate-900 self-start rounded-bl-sm"
              )}
            >
              <p className="leading-relaxed">{msg.text}</p>
              <div 
                className={clsx(
                  "text-[9px] mt-1 text-right font-medium", 
                  msg.senderId === 'me' ? "text-blue-100" : "text-slate-400"
                )}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0 pb-safe">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" 
            placeholder="Ваше сообщение..." 
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()} 
            className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 active:scale-95 transition-transform shrink-0"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
