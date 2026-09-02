import { MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
    children: ReactNode;
    align?: "left" | "right";
};

export const TablaAcciones = ({ children, align = "right" }: Props) => {
    const [abierto, setAbierto] = useState(false);
    const [posicion, setPosicion] = useState({ top: 0, left: 0 });
    const botonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!abierto) return;

        const actualizarPosicion = () => {
            const boton = botonRef.current;
            if (!boton) return;
            const rect = boton.getBoundingClientRect();
            setPosicion({
                top: rect.bottom + 4,
                left: align === "left" ? rect.left : rect.right,
            });
        };

        const cerrarAlHacerClickFuera = (event: PointerEvent) => {
            const objetivo = event.target as Node;
            if (!botonRef.current?.contains(objetivo) && !menuRef.current?.contains(objetivo)) {
                setAbierto(false);
            }
        };

        actualizarPosicion();
        document.addEventListener("pointerdown", cerrarAlHacerClickFuera);
        window.addEventListener("resize", actualizarPosicion);
        window.addEventListener("scroll", actualizarPosicion, true);
        return () => {
            document.removeEventListener("pointerdown", cerrarAlHacerClickFuera);
            window.removeEventListener("resize", actualizarPosicion);
            window.removeEventListener("scroll", actualizarPosicion, true);
        };
    }, [abierto, align]);

    return (
        <>
            <button
                ref={botonRef}
                type="button"
                onClick={() => setAbierto((actual) => !actual)}
                aria-label="Mostrar acciones"
                title="Mostrar acciones"
                aria-expanded={abierto}
                className="inline-flex h-9 w-9 items-center justify-center rounded-none border border-zinc-300 bg-white text-zinc-600 transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            >
                <MoreVertical size={18} />
            </button>
            {abierto && createPortal(
                <div
                    ref={menuRef}
                    className={`fixed z-[100] min-w-36 border border-zinc-200 bg-white p-1 text-left shadow-lg ${align === "right" ? "-translate-x-full" : ""}`}
                    style={{ top: posicion.top, left: posicion.left }}
                    onClick={() => setAbierto(false)}
                >
                    {children}
                </div>,
                document.body,
            )}
        </>
    );
};
