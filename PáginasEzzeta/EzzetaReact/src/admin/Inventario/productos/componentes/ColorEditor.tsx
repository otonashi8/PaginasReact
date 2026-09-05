import { useEffect, useState } from 'react';
import type { Producto } from '../TiposProductos';

type Props = {
    producto: Producto;
    actualizarCampo: <K extends keyof Producto>(campo: K, valor: Producto[K]) => void;
};

export const ColorEditor = ({ producto, actualizarCampo }: Props) => {
    const colorGuardado = producto.colores?.[0] ?? '';
    const partesColor = colorGuardado.split('|');
    const valorGuardado = partesColor.length > 1
        ? partesColor.slice(1).join('|').trim()
        : colorGuardado.trim();
    const etiquetaGuardada = partesColor.length > 1 ? partesColor[0].trim() : '';
    const [value, setValue] = useState(valorGuardado);
    const [label, setLabel] = useState(etiquetaGuardada);

    useEffect(() => {
        setValue(valorGuardado);
        setLabel(etiquetaGuardada);
    }, [producto.id, colorGuardado]);

    const add = () => {
        const v = (value ?? '').trim();
        if (!v) return;
        const entry = label.trim() ? `${label.trim()}|${v}` : v;
        actualizarCampo('colores', [entry]);
    };

    return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        {/* VALOR */}
        <label className="min-w-0 flex-1 text-xs font-medium text-zinc-700">
            <span className="mb-1.5 block">Valor</span>
            <input
                type="text"
                placeholder="Hex, RGB, nombre o letra"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
            />
        </label>
        <label className="min-w-0 flex-1 text-xs font-medium text-zinc-700">
            <span className="mb-1.5 block">
                Etiqueta
                <span className="ml-1 font-normal text-zinc-400">(opcional)</span>
            </span>
            <input
                type="text"
                placeholder="Ej. Rojo, Negro, Azul..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
            />
        </label>
        <label className="shrink-0 text-xs font-medium text-zinc-700">
            <span className="mb-1.5 block">Color</span>
            <input
                type="color"
                value={
                    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
                        ? value
                        : '#ffffff'
                }
                onChange={(e) => setValue(e.target.value)}
                title="Seleccionar color"
                className="block h-[38px] w-[52px] cursor-pointer rounded-none border border-zinc-300 bg-white p-1 transition hover:border-zinc-950"
            />
        </label>
        <button
            type="button"
            onClick={add}
            className="h-[38px] shrink-0 rounded-none bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
        >Guardar
        </button>
    </div>
);
};

export default ColorEditor;
