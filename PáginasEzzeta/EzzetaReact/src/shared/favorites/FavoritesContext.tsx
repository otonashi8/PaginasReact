export const useFavorites = () => ({
  isFavorite: (_id: number) => false,
  toggleFavorite: (_id: number) => undefined,
});

export default useFavorites;
