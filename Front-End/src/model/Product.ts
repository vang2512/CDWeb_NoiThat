export interface Product {
  id: number;

  // category (backend là object → frontend nên flatten)
  category?: {
    id: number;
    categoryName: string;
  };

  name: string;
  price: number;
  discount: number;

  description?: string;

  quantity: number;
  quantitySold: number;

  img?: string;

  createdAt?: string;

  isDeleted?: boolean;

  salePrice?: number;
}