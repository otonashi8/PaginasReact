import { useState } from 'react'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CommonButton from '@/components/common/CommonButton'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/shared/cart/CartContext'
import { BTN_DORADO_CLASS, BTN_SECUNDARIO_CLASS } from '@/shared/ui/buttons'
import { REVEAL_CLASS } from '@/shared/ui/reveal'
import { PRODUCTO_VITAELLA } from './data'

const CARACTERISTICAS = ['Colágeno tipo I y III', 'Vitamina C', 'Biotina', 'Ácido hialurónico']

function ProductoDestacado() {
  const [quantity, setQuantity] = useState(1)
  const { addItem, announceAdded } = useCart()
  const navigate = useNavigate()

  const handleAddToCart = () => {
    addItem(PRODUCTO_VITAELLA, quantity)
    announceAdded(PRODUCTO_VITAELLA.name)
  }

  const handleBuyNow = () => {
    addItem(PRODUCTO_VITAELLA, quantity)
    navigate('/checkout')
  }

  return (
    <section id="producto" className="py-22.5">
      <div className="relative mx-auto w-[min(1180px,92%)] overflow-hidden rounded-[40px] bg-[linear-gradient(180deg,var(--color-crema-2),var(--color-crema))]">
        <div className="grid w-full grid-cols-[0.9fr_1.1fr] items-center gap-15 py-17.5 max-[980px]:grid-cols-1 max-[980px]:py-12.5 max-[520px]:py-10">
          <div className={`reveal relative flex justify-center ${REVEAL_CLASS}`}>
            <div className="absolute inset-0 m-auto h-[340px] w-[340px] animate-[girar_40s_linear_infinite] rounded-full border-[1.5px] border-dashed border-[rgba(201,162,75,0.5)] max-[520px]:h-[280px] max-[520px]:w-[280px]" />
            <img
              src={PRODUCTO_VITAELLA.image}
              alt={PRODUCTO_VITAELLA.name}
              className="relative z-2 h-[400px] w-[320px] rounded-[28px] object-cover shadow-marca max-[720px]:h-auto max-[720px]:w-[min(280px,100%)] max-[520px]:w-full max-[520px]:max-w-[260px]"
            />
          </div>

          <div className={`reveal ${REVEAL_CLASS}`}>
            <Badge className="mb-4.5 h-auto gap-1.5 rounded-full border-transparent bg-[rgba(110,143,107,0.14)] px-4 py-2 text-[0.78rem] font-bold text-verde">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Joya de la Naturaleza
            </Badge>
            <h2 className="font-serif leading-[1.05] font-semibold tracking-[-0.01em]">{PRODUCTO_VITAELLA.name}</h2>
            <p className="max-w-115 leading-[1.7] text-[#6b4750]">
              Fórmula en polvo de fácil disolución, potenciada con vitamina C, biotina y ácido hialurónico para resultados visibles desde la primera caja.
            </p>
            <ul className="mt-6.5 mb-8 flex flex-wrap gap-2.5">
              {CARACTERISTICAS.map((item) => (
                <li key={item}>
                  <Badge className="h-auto rounded-full border-transparent bg-vino-suave px-4 py-2 text-[0.82rem] font-bold text-vino-oscuro">{item}</Badge>
                </li>
              ))}
            </ul>
            <div className="mb-7.5 flex items-baseline gap-3.5">
              <span className="font-serif text-[2.4rem] font-semibold text-vino-oscuro">S/ {PRODUCTO_VITAELLA.unitPrice.toFixed(2)}</span>
              <span className="text-[1.1rem] text-[#9a7a82] line-through">S/ 129.90</span>
            </div>

            <div className="mb-6 flex items-center gap-3.5">
              <CommonButton
                className="h-11 w-11 rounded-[16px] bg-vino p-0 text-[1.2rem] text-crema hover:bg-vino-oscuro"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </CommonButton>
              <span className="min-w-8 text-center font-bold">{quantity}</span>
              <CommonButton
                className="h-11 w-11 rounded-[16px] bg-vino p-0 text-[1.2rem] text-crema hover:bg-vino-oscuro"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </CommonButton>
            </div>

            <div className="mb-9.5 flex flex-wrap gap-4 max-[980px]:justify-center">
              <CommonButton className={BTN_SECUNDARIO_CLASS} onClick={handleAddToCart}>
                Agregar al carrito
              </CommonButton>
              <CommonButton className={BTN_DORADO_CLASS} onClick={handleBuyNow}>
                Comprar ahora
              </CommonButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductoDestacado
