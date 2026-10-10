import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Home, Search, MessageSquare, User as UserIcon, LogIn } from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/search', label: 'Поиск услуг', icon: Search },
    { path: '/chats', label: 'Чаты', icon: MessageSquare },
    { path: '/profile', label: 'Профиль', icon: UserIcon },
  ];

  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Пользователь';
  const roleName = user?.role === 'provider' ? 'Исполнитель' : 'Заказчик';

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
      <div className="p-6 flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">ServicePlace</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2">
          Меню
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors",
                isActive 
                  ? "text-blue-600 bg-blue-50 font-semibold" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        {isAuthenticated && user ? (
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
              <div className="text-xs text-slate-400">{roleName}</div>
            </div>
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors"
          >
            <LogIn size={16} />
            <span>Войти в аккаунт</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
