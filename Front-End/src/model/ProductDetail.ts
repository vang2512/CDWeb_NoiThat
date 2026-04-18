export interface SubImage {
  id: number;
  image: string;
}

export interface ProductSpecification {
  id: number;
  material: string;
  origin: string;
  standard: string;
  dimensions: string;
}

export interface ProductDetails {
  id: number;
  name: string;
  price: number;
  discount: number;
  description: string;
  quantity: number;
  quantitySold: number;
  img: string;
  createdAt: string;

  // quan hệ
  subImages: SubImage[];
  specification: ProductSpecification;
}