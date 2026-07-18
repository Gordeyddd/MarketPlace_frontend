export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search for service, category or pro..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
          <span className="text-xs font-semibold text-slate-900">Moscow, Russia</span>
        </div>
        <button className="p-2 bg-slate-100 rounded-full relative hover:bg-slate-200 transition-colors">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
