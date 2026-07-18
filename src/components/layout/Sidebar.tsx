import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
      <div className="p-6 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">ServicePlace</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2">
          Marketplace
        </div>
        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-50 rounded-xl font-medium">
          <span>🏠</span> Home
        </Link>
        <Link to="/services" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
          <span>📦</span> All Services
        </Link>
        <Link to="/favorites" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
          <span>❤️</span> Favorites
        </Link>
        <Link to="/orders" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
          <span>📝</span> Orders
        </Link>
        
        <div className="mt-8 text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2">
          Settings
        </div>
        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
          <span>👤</span> Profile
        </Link>
        <Link to="/preferences" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
          <span>⚙️</span> Preferences
        </Link>
      </nav>
      
      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200"></div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Konstantin K.</div>
            <div className="text-xs text-slate-400 italic">Staff Engineer</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
