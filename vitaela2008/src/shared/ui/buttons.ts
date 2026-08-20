// h-auto overrides shadcn Button's fixed h-8/h-9 when these are used via CommonButton,
// so py-4 (not the size variant) determines the button's height.
const BTN_BASE =
  "inline-flex h-auto items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-8 py-4 text-[0.95rem] font-bold transition-transform duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)]"

export const BTN_PRIMARIO_CLASS = `${BTN_BASE} bg-linear-to-br from-vino to-vino-oscuro text-crema shadow-[0_14px_30px_-10px_rgba(76,21,38,0.55)] hover:-translate-y-0.75 hover:scale-[1.02] hover:shadow-[0_20px_36px_-12px_rgba(76,21,38,0.6)]`

export const BTN_SECUNDARIO_CLASS = `inline-flex h-auto items-center justify-center gap-2.5 whitespace-nowrap rounded-full border-[1.5px] border-vino bg-transparent px-8 py-4 text-[0.95rem] font-bold text-vino transition-[transform,background,color] duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.75 hover:bg-vino hover:text-crema`

export const BTN_DORADO_CLASS = `${BTN_BASE} bg-linear-to-br from-dorado to-[#b48a34] text-vino-oscuro shadow-[0_14px_26px_-10px_rgba(201,162,75,0.6)] hover:-translate-y-0.75 hover:scale-[1.02]`
