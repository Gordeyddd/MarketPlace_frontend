import { Star, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';
import type { Service } from '../types/api';

export function getMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const backendBase = (import.meta.env.VITE_API_URL || 'https://stubborn-utilize-stunning.ngrok-free.dev').replace(/\/+$/, '');
  return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

export type ServiceCardProps = Service & {
  key?: string | number | null;
};

export function ServiceCard(props: ServiceCardProps) {
  const { title, price, provider, images } = props;
  const primaryImageRaw = images?.find(img => img.is_primary)?.image || images?.[0]?.image;
  const primaryImage = getMediaUrl(primaryImageRaw);

  const ratingVal = provider?.rating ? parseFloat(provider.rating) : 5.0;
  const ratingText = !isNaN(ratingVal) ? ratingVal.toFixed(1) : '5.0';
  const ratingCount = provider?.rating_count ?? 0;
  const providerName = provider?.full_name || 'Мастер';
  const providerInitial = providerName.charAt(0).toUpperCase() || 'M';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col active:scale-95 transition-transform duration-200 cursor-pointer">
      <div className="h-32 bg-slate-100 relative flex items-center justify-center overflow-hidden">
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={title} 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-slate-300" />
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-900 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {ratingText} <span className="text-slate-400 font-normal">({ratingCount})</span>
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">{title}</h3>
        </div>
        
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
              {providerInitial}
            </div>
            <span className="text-xs text-slate-500 font-medium truncate max-w-[80px]">{providerName}</span>
          </div>
          <span className="text-blue-600 font-bold text-sm whitespace-nowrap ml-2">от ${price}</span>
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
