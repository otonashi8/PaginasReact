import { createContext, useEffect, useContext, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { StorageKeys, storageManager } from '../storage';

type CartItem = {
  productId: number;
  quantity: number;
  size: string;
};

type WishlistContextType = {
  favorites: number[];
  cart: CartItem[];
  isCartOpen: boolean;
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  addToCart: (productId: number, size: string, quantity?: number) => void;
  removeFromCart: (productId: number, size: string) => void;
  restoreCartItem: (item: CartItem) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  changeItemSize: (productId: number, oldSize: string, newSize: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  const wishlistKey = useMemo(
    () => (user?.id ? `${StorageKeys.WISHLIST}.${user.id}` : StorageKeys.WISHLIST),
    [user?.id],
  );

  const cartKey = useMemo(
    () => (user?.id ? `${StorageKeys.CART}.${user.id}` : StorageKeys.CART),
    [user?.id],
  );

  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedFavorites = isAuthenticated
      ? storageManager.get<number[]>(wishlistKey) || []
      : [];
    setFavorites(loadedFavorites);

    try {
      const storedCart = (storageManager.get<CartItem[]>(cartKey) as CartItem[]) || [];
      const guestCart = isAuthenticated && cartKey !== StorageKeys.CART
        ? (storageManager.get<CartItem[]>(StorageKeys.CART) as CartItem[]) || []
        : [];
      const itemKey = (item: CartItem) => `${item.productId}::${item.size}`;
      const mergedItems = new Map<string, CartItem>();

      storedCart.forEach((item) => mergedItems.set(itemKey(item), { ...item }));
      guestCart.forEach((item) => {
        const key = itemKey(item);
        const current = mergedItems.get(key);
        mergedItems.set(key, current
          ? { ...current, quantity: current.quantity + item.quantity }
          : { ...item });
      });

      const loadedCart = Array.from(mergedItems.values());
      if (guestCart.length > 0) {
        storageManager.set(cartKey, loadedCart);
        storageManager.remove(StorageKeys.CART);
        storageManager.remove(`${StorageKeys.CART}.meta`);
        storageManager.remove(StorageKeys.WISHLIST_CART_LEGACY);
      }
      setCart(loadedCart);
    } catch {
      setCart([]);
    }

    setIsLoaded(true);
  }, [wishlistKey, cartKey, isAuthenticated]);

  useEffect(() => {
    if (!isLoaded || !isAuthenticated) return;

    try {
      storageManager.set(wishlistKey, favorites);
    } catch {
    }
  }, [favorites, wishlistKey, isLoaded, isAuthenticated]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      storageManager.set(cartKey, cart);
      window.dispatchEvent(new Event('maxeta:cart-changed'));
    } catch {
    }
  }, [cart, cartKey, isLoaded]);

  const toggleFavorite = (productId: number) => {
    if (!isAuthenticated) return;

    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  const addToCart = (productId: number, size: string, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId && item.size === size);

      if (existing) {
        return current.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...current, { productId, quantity, size }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, size: string) => {
    setCart((current) => current.filter((item) => !(item.productId === productId && item.size === size)));
  };

  const restoreCartItem = (item: CartItem) => {
    setCart((current) => {
      const existing = current.find((currentItem) => currentItem.productId === item.productId && currentItem.size === item.size);

      if (existing) {
        return current.map((currentItem) =>
          currentItem.productId === item.productId && currentItem.size === item.size
            ? { ...currentItem, quantity: currentItem.quantity + item.quantity }
            : currentItem,
        );
      }

      return [...current, item];
    });
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity } : item,
      ),
    );
  };

  const changeItemSize = (productId: number, oldSize: string, newSize: string) => {
    setCart((current) => {
      let oldQuantity = 0;
      const hasNewSize = current.some((item) => item.productId === productId && item.size === newSize);

      const updated = current
        .map((item) => {
          if (item.productId === productId && item.size === oldSize) {
            oldQuantity = item.quantity;
            return null;
          }
          if (hasNewSize && item.productId === productId && item.size === newSize) {
            return { ...item, quantity: item.quantity + oldQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      if (!hasNewSize && oldQuantity > 0) {
        return [...updated, { productId, size: newSize, quantity: oldQuantity }];
      }

      return updated;
    });
  };

  const clearCart = () => setCart([]);
  const toggleCart = () => setIsCartOpen((current) => !current);
  const closeCart = () => setIsCartOpen(false);

  const value = useMemo(
    () => ({
      favorites,
      cart,
      isCartOpen,
      toggleFavorite,
      isFavorite,
      addToCart,
      removeFromCart,
      restoreCartItem,
      updateQuantity,
      changeItemSize,
      clearCart,
      toggleCart,
      closeCart,
    }),
    [favorites, cart, isCartOpen],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
};
