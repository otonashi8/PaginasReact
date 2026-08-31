import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const toggleCart = vi.fn();
const closeCart = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
    login: vi.fn(),
  }),
}));

vi.mock('../context/WishlistContext', () => ({
  useWishlist: () => ({
    favorites: [],
    cart: [],
    toggleCart,
  }),
}));

vi.mock('../hooks/useCart', () => ({
  default: () => ({
    isCartOpen: false,
    closeCart,
    cart: [],
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    changeItemSize: vi.fn(),
    clearCart: vi.fn(),
  }),
}));

vi.mock('../services/contentService', () => ({
  getProducts: () => [],
}));

vi.mock('../components/SearchDropdown', () => ({
  SearchDropdown: () => null,
}));

import { Header } from '../components/Header';
import CartDrawer from '../components/common/CartDrawer';

describe('header cart controls', () => {
  it('keeps only the icon cart visible in the header', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Carrito')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /carrito/i })).toBeInTheDocument();
  });

  it('does not break hook order when the cart drawer opens', () => {
    const { rerender } = render(
      <MemoryRouter>
        <CartDrawer open={false} />
      </MemoryRouter>,
    );

    expect(() =>
      rerender(
        <MemoryRouter>
          <CartDrawer open />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });
});
