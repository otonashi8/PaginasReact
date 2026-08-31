import { useMemo } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../services/contentService';

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

  const items = useMemo(() => cart.map((item) => {
    const product = getProducts().find((entry) => entry.id === item.productId);

    return {
      id: item.productId,
      productId: item.productId,
      name: product?.name ?? 'Producto',
      image: product?.image ?? '',
      unitPrice: product?.price ?? 0,
      quantity: item.quantity,
      size: item.size,
      subtotal: (product?.price ?? 0) * item.quantity,
    };
  }), [cart]);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
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
