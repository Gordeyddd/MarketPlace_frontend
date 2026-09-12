/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { ChatRoom } from './pages/ChatRoom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
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
                <div className="p-4 flex flex-col gap-4">
                  <h1 className="text-xl font-bold text-slate-900">Мои чаты</h1>
                  <Link to="/chats/123" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop" className="w-12 h-12 rounded-full object-cover" alt="Avatar"/>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm">Александр М.</h3>
                      <p className="text-xs text-slate-500 truncate">Около $25, займет пару часов.</p>
                    </div>
                  </Link>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="p-4 font-bold text-slate-700">Профиль</div>
              </ProtectedRoute>
            } />
          </Route>

          {/* ChatRoom вынесен за MainLayout, чтобы на мобилках занимать весь экран без таббара */}
          <Route path="/chats/:id" element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
