import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { ImagePlaceholder } from '../ImagePlaceholder';
import QuantityInput from '../QuantityInput';
import { PermissionGate } from '../PermissionGate';
import { PERMISSIONS } from '../../utils/permissionCodes';
import type { Product } from '../../types';

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
      <div className="space-y-3">
          {items.map((item) => {
              const itemSubtotal = item.price * item.quantity;

              return (
                  <motion.div
                      key={`${item.id}-${item.size}`}
                      layout
                      whileHover={{ y: -1 }}
                      className="grid grid-cols-1 gap-3 border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 sm:grid-cols-3"
                  >
                      <div className="sm:col-span-1">
                          <div className="h-56 w-full overflow-hidden border border-zinc-200 bg-zinc-50 sm:h-54">
                              {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover"/>
                              ) : (
                                  <ImagePlaceholder label="Producto" className="h-full w-full"/>
                              )}
                          </div>
                      </div>
                      <div className="min-w-0 sm:col-span-2">
                          <div className="flex items-start justify-between gap-2">
                              <h3 className="break-words text-md font-semibold leading-5 text-zinc-900">{item.name}</h3>
                              <PermissionGate permission={PERMISSIONS.salesDelete}>
                                  <motion.button
                                      type="button"
                                      onClick={() =>
                                          setDeleteConfirm({
                                              productId: item.id,
                                              size: item.size,
                                          })
                                      }
                                      whileHover={{ scale: 1.04 }}
                                      whileTap={{ scale: 0.96 }}
                                      className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-200 text-zinc-400 transition hover:border-red-300 hover:text-red-600"
                                      aria-label="Eliminar producto"
                                  ><Trash2 size={13} />
                                  </motion.button>
                              </PermissionGate>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                              <span className="text-[14px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Talla</span>
                              <PermissionGate permission={PERMISSIONS.salesUpdate}>
                                  <select
                                      id={`cart-size-${item.id}-${item.size}`}
                                      value={item.size}
                                      onChange={(event) =>
                                          changeItemSize(
                                              item.id,
                                              item.size,
                                              event.target.value
                                          )
                                      }
                                      className="h-7 min-w-[4rem] border border-zinc-200 bg-white px-2 text-[14px] text-zinc-700 outline-none transition focus:border-zinc-500"
                                  >
                                      {item.sizes.map((sizeOption) => (
                                          <option
                                              key={sizeOption}
                                              value={sizeOption}
                                          >{sizeOption}
                                          </option>
                                      ))}
                                  </select>
                              </PermissionGate>
                          </div>
                              <div className="mt-2 flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                                  <span className="text-[14px] text-zinc-500">Precio</span>
                                  <span className="text-[14px] font-medium text-zinc-800">S/ {item.price.toFixed(2)}</span>
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                                  <span className="text-[14px] text-zinc-500">Cantidad</span>
                                  <PermissionGate permission={PERMISSIONS.salesUpdate}>
                                      <QuantityInput
                                          value={item.quantity}
                                          onChange={(v) =>
                                              updateQuantity(
                                                  item.id,
                                                  item.size,
                                                  v
                                              )
                                          }
                                      />
                                  </PermissionGate>
                              </div>
                          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                              <span className="text-[14px] font-semibold text-zinc-700">Subtotal</span>
                              <span className="text-[14px] font-bold text-red-600">S/ {itemSubtotal.toFixed(2)}</span>
                          </div>
                      </div>
                  </motion.div>
              );
          })}
      </div>
  );
}
