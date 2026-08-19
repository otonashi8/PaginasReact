import type { ModuloSistema, Rol } from "../TiposUsuarios";
import { accionesDisponibles, modulosSistema } from "../TiposUsuarios";

type Props = {
    rol: Rol;
    establecerRol: React.Dispatch<React.SetStateAction<Rol>>;
};

export const PermisosRol = ({
    rol,
    establecerRol
}: Props) => {

    function tieneAcceso(modulo: ModuloSistema) {
        const permiso = rol.permisos.find(
            p => p.modulo === modulo
        );

        return Boolean(permiso && permiso.acciones.length > 0);
    }

    function alternarModulo(modulo: ModuloSistema) {
        establecerRol(prev => ({
            ...prev,
            permisos: prev.permisos.map((permiso) => {
                if (permiso.modulo !== modulo) {
                    return permiso;
                }

                const tieneAccesoActual = permiso.acciones.length > 0;

                return {
                    ...permiso,
                    acciones: tieneAccesoActual
                        ? []
                        : [...accionesDisponibles]
                };
            })
        }));
    }

    return (
        <section className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">
                    Permisos por módulo
                </h3>

                <p className="text-sm text-zinc-500">
                    Activa o desactiva el acceso completo a cada módulo con un solo botón.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {modulosSistema.map((modulo) => {
                    const acceso = tieneAcceso(modulo);

                    return (
                        <div
                            key={modulo}
                            className="flex items-center justify-between gap-4 border border-zinc-200 bg-white px-4 py-3"
                        >
                            <span className="text-sm font-medium capitalize text-zinc-900">
                                {modulo}
                            </span>

                            <button
                                type="button"
                                onClick={() => alternarModulo(modulo)}
                                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                    acceso
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "border-zinc-300 bg-white text-zinc-700"
                                }`}
                            >
                                {acceso ? "Con acceso" : "Sin acceso"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};