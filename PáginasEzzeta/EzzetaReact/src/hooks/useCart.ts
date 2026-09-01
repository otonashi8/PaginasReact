import { useMemo } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../services/contentService';
import { getCheckoutLinePricing, usePricingRules } from '../services/pricingService';

export default function useCart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    changeItemSize,
    clearCart,
    isCartOpen,
    closeCart,
    toggleCart,
  } = useWishlist();
  const pricingRules = usePricingRules();

  const items = useMemo(() => cart.map((item) => {
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
    };
  }), [cart, pricingRules]);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items],
  );

  return {
    cart,
    items,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    changeItemSize,
    clearCart,
    isCartOpen,
    closeCart,
    toggleCart,
  };
}
