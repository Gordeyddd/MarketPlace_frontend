import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { Category } from '../types/api';

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/api/v1/categories/');
  return data;
};

interface FiltersProps {
  onClose: () => void;
}

export function Filters({ onClose }: FiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  
  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as string;
    const minPrice = formData.get('minPrice') as string;
    const maxPrice = formData.get('maxPrice') as string;

    const params = new URLSearchParams(searchParams);
    
    if (category) params.set('category', category);
    else params.delete('category');
    
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    setSearchParams(params, { replace: true });
    onClose();
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('minPrice');
    params.delete('maxPrice');
    setSearchParams(params, { replace: true });
    onClose();
  };

  return (
    <form onSubmit={handleApply} className="flex flex-col gap-6">
      <div>
        <h3 className="font-bold text-slate-900 mb-3">Категория</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              name="category" 
              value="" 
              defaultChecked={currentCategory === ''}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Все категории</span>
          </label>
          {isLoading ? (
            <div className="text-sm text-slate-400">Загрузка категорий...</div>
          ) : (
            categories?.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="category" 
                  value={cat.slug} 
                  defaultChecked={currentCategory === cat.slug}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-3">Цена, $</h3>
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            name="minPrice" 
            placeholder="От" 
            defaultValue={currentMinPrice}
            className="w-full px-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="text-slate-400">-</span>
          <input 
            type="number" 
            name="maxPrice" 
            placeholder="До" 
            defaultValue={currentMaxPrice}
            className="w-full px-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 mt-2">
        <button 
          type="button" 
          onClick={handleReset}
          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
        >
          Сбросить
        </button>
        <button 
          type="submit" 
          className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors active:scale-95"
        >
          Применить
        </button>
      </div>
    </form>
  );
}
