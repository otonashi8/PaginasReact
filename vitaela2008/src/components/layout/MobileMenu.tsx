import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logo_vitaella.png'
import CommonButton from '../common/CommonButton'
import { Button } from '../ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { COMPRAR_AHORA_CLASS, NAV_LINKS, VER_PRODUCTO_CLASS } from './headerData'

interface MobileMenuProps {
  onBuyNow: () => void
  favoritesCount: number
}

function MobileMenu({ onBuyNow }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full text-vino-oscuro md:hidden" aria-label="Abrir menú">
          <Menu className="size-5.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-4/5 bg-crema sm:max-w-xs">
        <SheetHeader>
          <SheetTitle asChild>
            <img src={logo} alt="Vitaella" className="h-8 w-auto self-start" />
          </SheetTitle>
        </SheetHeader>
        <ul className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <SheetClose asChild>
                <Link to={link.href} className="block rounded-lg px-2 py-3 font-semibold text-vino-oscuro hover:bg-vino-suave">
                  {link.label}
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-3 p-4">
          <SheetClose asChild>
            <CommonButton asChild variant="outline" className={VER_PRODUCTO_CLASS}>
              <Link to="/#producto">Ver producto</Link>
            </CommonButton>
          </SheetClose>
          <SheetClose asChild>
            <CommonButton type="button" onClick={onBuyNow} className={COMPRAR_AHORA_CLASS}>
              Comprar ahora
            </CommonButton>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileMenu
