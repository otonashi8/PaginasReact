import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { ImagePlaceholder } from './ImagePlaceholder';
import QuantityInput from './QuantityInput';
import { PermissionGate } from './PermissionGate';
import { PERMISSIONS } from '../utils/permissionCodes';
import type { Product } from '../types';

type CartProduct = Product & { quantity: number; size: string };

export default function CartItemsList({
  items,
  changeItemSize,
  updateQuantity,
  setDeleteConfirm,
}: {
  items: CartProduct[];
  changeItemSize: (id: number, oldSize: string, newSize: string) => void;
  updateQuantity: (id: number, size: string, q: number) => void;
  setDeleteConfirm: (payload: { productId: number; size: string } | null) => void;
}) {
  return (
    <div className="space-y-5">
      {items.map((item) => {
        const itemSubtotal = item.price * item.quantity;

        return (
          <motion.div
            key={`${item.id}-${item.size}`}
            layout
            whileHover={{ backgroundColor: '#fafafa' }}
            className="border-b border-black/10 bg-white py-5 transition-colors duration-200 hover:bg-neutral-50"
          >
            <div className="flex gap-4 sm:gap-5">
              <div className="h-28 w-20 sm:h-32 sm:w-24 shrink-0 overflow-hidden bg-neutral-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImagePlaceholder label="Producto" className="h-full w-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold uppercase tracking-wide text-black">{item.name}</h3>
                  </div>
                  <PermissionGate permission={PERMISSIONS.salesDelete}>
                  <motion.button
                    type="button"
                    onClick={() => setDeleteConfirm({ productId: item.id, size: item.size })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-neutral-400 transition duration-200 hover:text-orange-600"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                  </PermissionGate>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-black/50">Talla</span>
                  <PermissionGate permission={PERMISSIONS.salesUpdate}>
                  <select
                    id={`cart-size-${item.id}-${item.size}`}
                    value={item.size}
                    onChange={(event) => changeItemSize(item.id, item.size, event.target.value)}
                    className="min-w-[4.5rem] border border-black px-3 py-2 text-xs uppercase outline-none transition hover:border-orange-600"
                  >
                    {item.sizes.map((sizeOption) => (
                      <option key={sizeOption} value={sizeOption}>
                        {sizeOption}
                      </option>
                    ))}
                  </select>
                  </PermissionGate>
                </div>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-black/70">
                    <span>Precio</span>
                    <span className="font-medium">S/{item.price}</span>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-black/70">Cantidad</span>
                    <PermissionGate permission={PERMISSIONS.salesUpdate}>
                    <div className="border border-black">
                      <QuantityInput value={item.quantity} onChange={(v) => updateQuantity(item.id, item.size, v)} />
                    </div>
                    </PermissionGate>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-base font-semibold text-black">
                    <span>Subtotal</span>
                    <span className="text-orange-600">S/{itemSubtotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
