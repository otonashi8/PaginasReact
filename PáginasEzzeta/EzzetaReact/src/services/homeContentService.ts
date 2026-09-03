import categories from '../data/homeCategories.json';
import { getActiveBanners, getBannerRotationSeconds, type Banner } from '../admin/Marketing/Banners/bannersStorage';
import type { Product } from '../types';
import { getProducts as getUnifiedProducts } from './contentService';
import { getCategoriasVisuales } from '../admin/Inventario/categorías/categoriasStorage';

export type HomeSlide = {
  img: string;
  imgDesktop: string;
  imgMobile: string;
  title: string;
};

export const getHomeSlides = (): HomeSlide[] => {
  return getActiveBanners().map((banner: Banner) => ({
    img: banner.imagenDesktop || banner.imagenMobile,
    imgDesktop: banner.imagenDesktop || banner.imagenMobile,
    imgMobile: banner.imagenMobile || banner.imagenDesktop,
    title: banner.nombre,
  }));
};

export const getHomeBannerRotationSeconds = () => getBannerRotationSeconds();
export const getHomeCategories = () => {
  const configuradas = getCategoriasVisuales();
  const guardadas = configuradas.filter((categoria) => categoria.activo && categoria.imagen);
  if (configuradas.length) return guardadas;
  return categories.map((categoria) => ({
    categoria: categoria.name,
    imagen: categoria.img,
    descripcion: categoria.description,
    activo: true,
  }));
};
export const getHomeProducts = (): Product[] => getUnifiedProducts();
export const getTopFeaturedProducts = (): Product[] =>
  getUnifiedProducts().filter((product) => product.featured).slice(0, 12);
export const getBestSellers = (): Product[] =>
  getUnifiedProducts().slice(0, 16);
