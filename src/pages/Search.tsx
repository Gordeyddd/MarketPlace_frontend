import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Filters } from '../components/Filters';
import { ServiceCard, ServiceCardSkeleton, type ServiceCardProps } from '../components/ServiceCard';

const fetchSearchResults = async (
  q: string, 
  category: string | null, 
  minPrice: string | null, 
  maxPrice: string | null
): Promise<ServiceCardProps[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let results: ServiceCardProps[] = [
    {
      id: '1',
      title: 'Генеральная уборка квартиры',
      price: 45,
      rating: 4.9,
      reviewsCount: 124,
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop',
      provider: { name: 'Клининг Про', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop' }
    },
    {
      id: '2',
      title: 'Сборка мебели IKEA',
      price: 25,
      rating: 5.0,
      reviewsCount: 82,
      imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=400&auto=format&fit=crop',
      provider: { name: 'Мастер на час', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop' }
    },
    {
      id: '3',
      title: 'Химчистка дивана',
      price: 35,
      rating: 4.8,
      reviewsCount: 215,
      imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop',
      provider: { name: 'Чистый Дом', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop' }
    },
    {
      id: '4',
      title: 'Муж на час',
      price: 15,
      rating: 4.6,
      reviewsCount: 42,
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop',
      provider: { name: 'Иван И.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop' }
    }
  ];

  if (q) {
    results = results.filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
  }
  if (category) {
    // Mock category filter mapping, since we don't have real category ids on mock objects
    // we'll just return a subset
    if (category === '1') results = [results[0], results[2]];
    else if (category === '2') results = [results[1], results[3]];
    else results = [];
  }
  if (minPrice) {
    results = results.filter(r => r.price >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter(r => r.price <= Number(maxPrice));
  }
  
  return results;
};

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  
  const debouncedQuery = useDebounce(inputValue, 500);
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  };

  const clearSearch = () => {
    setInputValue('');
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    setSearchParams(params, { replace: true });
  };

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, category, minPrice, maxPrice],
    queryFn: () => fetchSearchResults(debouncedQuery, category, minPrice, maxPrice),
    placeholderData: (previousData) => previousData, // keepPreviousData approach in v5
  });

  const activeFiltersCount = [category, minPrice, maxPrice].filter(Boolean).length;

  return (
    <>
      <div className="sticky top-0 z-20 bg-[#F8F9FA] pb-4 pt-1 -mx-6 px-6 -mt-2">
        <div className="flex items-center gap-2">
          <div className="relative w-full flex-1 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <SearchIcon size={18} />
            </span>
            <input 
              type="text" 
              value={inputValue}
              onChange={handleSearchChange}
              placeholder="Поиск услуг..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              autoFocus
            />
            {inputValue && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700 relative active:scale-95 transition-transform"
          >
            <SlidersHorizontal size={20} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#F8F9FA]">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 pb-16 md:pb-0">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {isFetching && !results ? 'Поиск...' : `Найдено: ${results?.length || 0}`}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))
          ) : (
            results?.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))
          )}
          {!isLoading && results?.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Ничего не найдено</h3>
              <p className="text-sm text-slate-500">Попробуйте изменить запрос или фильтры</p>
            </div>
          )}
        </div>
      </div>

      <BottomSheet 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)}
        title="Фильтры"
      >
        <Filters onClose={() => setIsFiltersOpen(false)} />
      </BottomSheet>
    </>
  );
}
