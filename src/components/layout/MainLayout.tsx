import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 relative">
          <Outlet />
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
