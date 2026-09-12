export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  parent: number | null;
};

export type ServiceProvider = {
  id: number;
  full_name: string;
  rating: string;
  rating_count: number;
  is_available: boolean;
};

export type ServiceImage = {
  id: number;
  image: string;
  is_primary: boolean;
  order: number;
};

export type Service = {
  id: number;
  title: string;
  description: string;
  price: string;
  is_active: boolean;
  category: Category;
  provider: ServiceProvider;
  images: ServiceImage[];
  created_at: string;
  rank?: number;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
