import { Heart, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '@/assets/logo_vitaella.png'
import { PRODUCTO_VITAELLA } from '@/modules/home/data'
import { useCart } from '@/shared/cart/CartContext'
import { useFavorites } from '@/shared/favorites/FavoritesContext'
import { useHeaderScroll } from '@/shared/hooks/useHeaderScroll'
import CommonButton from '../common/CommonButton'
import { Button } from '../ui/button'
import { COMPRAR_AHORA_CLASS, NAV_LINKS, VER_PRODUCTO_CLASS } from './headerData'
import MobileMenu from './MobileMenu'

interface HeaderProps {
  onOpenCart: () => void
}

function Header({ onOpenCart }: HeaderProps) {
  const headerScrolled = useHeaderScroll()
  const navigate = useNavigate()
  const { totalItems, addItem } = useCart()
  const { favoritesCount } = useFavorites()

  const handleBuyNow = () => {
    addItem(PRODUCTO_VITAELLA, 1)
    navigate('/checkout')
  }

  return (
    <header
      id="siteHeader"
      className={`fixed top-0 right-0 left-0 z-40 py-4.5 transition-[background,padding,box-shadow] duration-400 ease ${headerScrolled ? 'bg-[rgba(251,244,236,0.88)] py-3 shadow-[0_6px_24px_-14px_rgba(76,21,38,0.25)] backdrop-blur-[14px]' : ''
        }`}
    >
      <div className="mx-auto w-[min(1180px,92%)]">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Vitaella" className="h-10 w-auto max-[520px]:h-8" />
          </Link>

          <ul className="flex items-center gap-9 text-[0.92rem] font-semibold max-md:hidden">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="relative py-1 text-vino-oscuro after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-dorado after:transition-[width] after:duration-300 after:ease hover:text-vino hover:after:w-full"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative rounded-full text-vino-oscuro" onClick={onOpenCart} aria-label="Abrir carrito">
              <ShoppingBag className="size-5.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-dorado px-1 text-[0.65rem] font-bold text-vino-oscuro">
                  {totalItems}
                </span>
              )}
            </Button>

            <Button asChild variant="ghost" size="icon" className="relative rounded-full text-vino-oscuro" aria-label="Abrir favoritos">
              <Link to="/favoritos">
                <Heart className="size-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-vino px-1 text-[0.65rem] font-bold text-crema">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            </Button>

            <div className="flex items-center gap-4.5 max-md:hidden">
              <CommonButton
                asChild
                variant="outline"
                className={`px-6 ${VER_PRODUCTO_CLASS}`}>
                <Link to="/#producto">Ver producto</Link>
              </CommonButton>
              <CommonButton
                type="button"
                onClick={handleBuyNow}
                size="lg"
                className={`px-6 ${COMPRAR_AHORA_CLASS}`}
              >
                Comprar ahora
              </CommonButton>
            </div>

            <MobileMenu onBuyNow={handleBuyNow} favoritesCount={favoritesCount} />
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
