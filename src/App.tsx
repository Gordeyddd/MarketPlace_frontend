/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { ChatRoom } from './pages/ChatRoom';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MessageSquare, Search as SearchIcon } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              
              {/* Защищенные роуты */}
              <Route path="/chats" element={
                <ProtectedRoute>
                  <div className="p-4 flex flex-col gap-4 max-w-xl mx-auto w-full">
                    <h1 className="text-xl font-bold text-slate-900">Мои чаты</h1>
                    {/* Честное empty state без фиктивных пользователей */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center mt-4">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">У вас пока нет активных диалогов</h3>
                      <p className="text-xs text-slate-500 max-w-xs mb-6">
                        Диалоги с мастерами или заказчиками появятся здесь после обсуждения заказа.
                      </p>
                      <Link 
                        to="/search" 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                      >
                        <SearchIcon className="w-4 h-4" />
                        <span>Найти услуги</span>
                      </Link>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Route>

            {/* ChatRoom вынесен за MainLayout */}
            <Route path="/chats/:id" element={
              <ProtectedRoute>
                <ChatRoom />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
