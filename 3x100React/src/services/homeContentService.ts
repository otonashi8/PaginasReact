import categories from '../data/homeCategories.json';
import { getActiveBanners, getBannerRotationSeconds, type Banner } from '../admin/Marketing/Banners/bannersStorage';
import type { Product } from '../types';
import { getProducts as getUnifiedProducts } from './contentService';

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
export const getHomeCategories = () => categories;
export const getHomeProducts = (): Product[] => getUnifiedProducts();
export const getTopFeaturedProducts = (): Product[] =>
  getUnifiedProducts().filter((product) => product.featured).slice(0, 12);
export const getBestSellers = (): Product[] =>
  getUnifiedProducts().slice(0, 16);
