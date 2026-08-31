import { describe, expect, it, beforeEach } from 'vitest';
import { getPageVisibility, isPageVisible, savePageVisibility } from '../admin/Paginas/paginasStorage';

describe('page visibility', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps the visibility state in localStorage so disabled pages render in maintenance', () => {
    const baseVisibility = getPageVisibility();
    savePageVisibility({ ...baseVisibility, store: false, checkout: false });

    expect(isPageVisible('store')).toBe(false);
    expect(isPageVisible('checkout')).toBe(false);
    expect(getPageVisibility().store).toBe(false);
    expect(getPageVisibility().checkout).toBe(false);
  });
});
