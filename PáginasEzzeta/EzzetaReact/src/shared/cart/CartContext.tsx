export const useCart = () => ({
  addItem: (_product: unknown, quantity = 1) => ({ quantity }),
  announceAdded: () => undefined,
});

export default useCart;
