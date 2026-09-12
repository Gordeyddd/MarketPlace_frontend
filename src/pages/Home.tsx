import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ServiceCard, ServiceCardSkeleton } from '../components/ServiceCard';
import api from '../api/axios';
import type { Category, Service, PaginatedResponse } from '../types/api';

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/api/v1/categories/');
  return data;
};

const fetchPopularServices = async (): Promise<Service[]> => {
  const { data } = await api.get<PaginatedResponse<Service>>('/api/v1/services/', {
    params: { limit: 10, ordering: '-created_at' }
  });
  return data.results;
};

export function Home() {
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: popularServices, isLoading: isLoadingServices, error: servicesError } = useQuery({
    queryKey: ['popularServices'],
    queryFn: fetchPopularServices,
  });

  return (
    <>
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-20 bg-[#F8F9FA] pb-4 pt-1 -mx-6 px-6 -mt-2">
        <Link to="/search" className="block relative w-full group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
            <Search size={18} />
          </span>
          <div className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-sm text-slate-400 text-left cursor-text">
            Поиск услуг, категорий или мастеров...
          </div>
        </Link>
      </div>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[28px] p-6 text-white relative shrink-0 overflow-hidden shadow-lg mt-2">
        <div className="relative z-10 max-w-md">
          <h1 className="text-2xl font-bold mb-1">Весенняя уборка <span className="font-light italic opacity-90">со скидкой 20%</span></h1>
          <p className="text-blue-100 text-xs mb-5 max-w-[250px]">Проверенные клинеры. Страховка включена в каждый заказ.</p>
          <button className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform">
            Смотреть акции
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </section>
      
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Категории</h2>
          <Link to="/search" className="text-blue-600 text-xs font-bold hover:underline">Все</Link>
        </div>
        
        {/* Horizontal scroll for categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-6 px-6 snap-x">
          {isLoadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[72px] h-[76px] bg-white rounded-2xl border border-slate-100 animate-pulse snap-center"></div>
            ))
          ) : categoriesError ? (
            <div className="text-sm text-red-500 p-2">Ошибка загрузки категорий</div>
          ) : categories?.length === 0 ? (
            <div className="text-sm text-slate-500 p-2">Нет доступных категорий</div>
          ) : (
            categories?.map((cat) => (
              <Link 
                to={`/search?category=${cat.slug}`} 
                key={cat.id} 
                className="flex-shrink-0 bg-white w-[72px] p-3 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform snap-center"
              >
                <div className="text-2xl leading-none">
                  {cat.icon ? <img src={cat.icon} alt={cat.name} className="w-8 h-8 object-contain" /> : '📁'}
                </div>
                <span className="text-[10px] font-bold text-slate-700 w-full text-center truncate">{cat.name}</span>
              </Link>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-2 flex flex-col gap-4 flex-1 pb-16 md:pb-0">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Популярные услуги</h2>
        </div>
        
        {servicesError ? (
          <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl">Ошибка загрузки услуг</div>
        ) : popularServices?.length === 0 ? (
          <div className="text-sm text-slate-500 bg-white border border-slate-100 p-8 text-center rounded-xl">
            Пока нет доступных услуг
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {isLoadingServices ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))
            ) : (
              popularServices?.map((service) => (
                <ServiceCard key={service.id} {...service} />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

