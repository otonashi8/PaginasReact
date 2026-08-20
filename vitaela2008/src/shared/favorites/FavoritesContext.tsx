import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface FavoritesContextValue {
  favoriteIds: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)
const STORAGE_KEY = 'vitaella_favorites'

function readStoredFavorites(): string[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(readStoredFavorites)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const isFavorite = (id: string) => favoriteIds.includes(id)

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) => (current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]))
  }

  const value = useMemo(() => ({ favoriteIds, isFavorite, toggleFavorite, favoritesCount: favoriteIds.length }), [favoriteIds])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites debe usarse dentro de FavoritesProvider')
  return context
}