import { Star } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

export interface ServiceCardProps {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  provider: {
    name: string;
    avatarUrl: string;
  };
}

export function ServiceCard({
  title,
  price,
  rating,
  reviewsCount,
  imageUrl,
  provider,
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col active:scale-95 transition-transform duration-200 cursor-pointer">
      <div className="h-32 bg-slate-100 relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-900 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)} <span className="text-slate-400 font-normal">({reviewsCount})</span>
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">{title}</h3>
        </div>
        
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-2">
            <img 
              src={provider.avatarUrl} 
              alt={provider.name} 
              className="w-6 h-6 rounded-full bg-slate-200 object-cover"
            />
            <span className="text-xs text-slate-500 font-medium truncate max-w-[80px]">{provider.name}</span>
          </div>
          <span className="text-blue-600 font-bold text-sm whitespace-nowrap">от ${price}</span>
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-3 flex-1 flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}
