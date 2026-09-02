import { useMemo } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/contentService';
import { getCheckoutLinePricing, obtenerPrecioMayorista, usePricingRules } from '../services/pricingService';

export default function useCart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    restoreCartItem,
    updateQuantity,
    changeItemSize,
    clearCart,
    isCartOpen,
    closeCart,
    toggleCart,
  } = useWishlist();
  const { isAuthenticated } = useAuth();
  const pricingRules = usePricingRules();

  const items = useMemo(() => {
    const productos = cart.map((item) => {
    const product = getProducts().find((entry) => entry.id === item.productId);
    if (!product) {
      return {
        id: item.productId,
        productId: item.productId,
        name: 'Producto',
        image: '',
        unitPrice: 0,
        quantity: item.quantity,
        size: item.size,
        subtotal: 0,
        originalSubtotal: 0,
        subtotalBeforeWholesale: 0,
        product: undefined,
      };
    }

    const pricing = getCheckoutLinePricing(product, item.quantity, { cantidad: item.quantity }, pricingRules);

    return {
      id: item.productId,
      productId: item.productId,
      name: product.name,
      image: product.image,
      unitPrice: pricing.unitPrice,
      quantity: item.quantity,
      size: item.size,
      subtotal: pricing.subtotal,
      originalSubtotal: pricing.originalSubtotal,
      subtotalBeforeWholesale: pricing.subtotal,
      category: product.category,
      subcategory: product.subcategory,
      product,
    };
    });
    const cantidades = new Map<string, number>();
    productos.forEach((item) => {
      const clave = `${item.category}::${item.subcategory}`;
      cantidades.set(clave, (cantidades.get(clave) ?? 0) + item.quantity);
    });
    return productos.map((item) => {
      const precioMayorista = isAuthenticated && item.product
        ? obtenerPrecioMayorista(item.product, cantidades.get(`${item.category}::${item.subcategory}`) ?? 0)
        : null;
      if (precioMayorista === null) return item;
      return { ...item, unitPrice: precioMayorista, subtotal: Number((precioMayorista * item.quantity).toFixed(2)) };
    });
  }, [cart, isAuthenticated, pricingRules]);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items],
  );

  const totalPriceBeforeWholesale = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotalBeforeWholesale, 0),
    [items],
  );

  return {
    cart,
    items,
    totalPrice,
    totalPriceBeforeWholesale,
    addToCart,
    removeFromCart,
    restoreCartItem,
    updateQuantity,
    changeItemSize,
    clearCart,
    isCartOpen,
    closeCart,
    toggleCart,
  };
}
