import type { Permiso } from "../TiposUsuarios";
import { modulosSistema } from "../TiposUsuarios";

type Props = {
    permisos: Permiso[];
};

export const MatrizPermisosRol = ({
    permisos
}: Props) => {

    const accionesParaModulo = (mod: string) => {
        const permiso = permisos.find((p) => p.modulo === (mod as any));
        if (!permiso || !permiso.acciones.length) return '-';
        return permiso.acciones.join(', ');
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {modulosSistema.map((modulo) => (
                    <>
                        <div key={`m-${modulo}`} className="px-3 py-2 text-sm font-medium capitalize text-zinc-900">
                            {modulo}
                        </div>
                        <div key={`a-${modulo}`} className="px-3 py-2 text-sm text-zinc-700">
                            {accionesParaModulo(modulo)}
                        </div>
                    </>
                ))}
            </div>
        </div>
    );
};