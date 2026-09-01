import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { PermissionAccess } from "../../hooks/usePermissions";
import { useUsuarios } from "./hooks/useUsuarios";
import { TablaUsuarios } from "./usuarios/TablaUsuarios";
import { ModalUsuario } from "./usuarios/ModalUsuario";
import { FiltrosUsuarios } from "./usuarios/FiltrosUsuarios";
import { Permiso } from "../../componentes/Permiso";
import { ResumenUsuarios } from "./usuarios/ResumenUsuarios";
import { PaginacionClientes } from "../../componentes/Paginacion";

type Props = {
    access: PermissionAccess;
};

export const UsuariosCrudPanel = ({
    access
}: Props) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 10;

    const {
        usuariosFiltrados,
        roles,
        busqueda,
        setBusqueda,
        usuarioActual,
        setUsuarioActual,
        modalAbierto,
        modoEdicion,
        abrirNuevoUsuario,
        abrirEdicion,
        cerrarModal,
        guardarUsuario,
        borrarUsuario,
        cambiarEstadoUsuario,
        estadoFiltro,
        setEstadoFiltro
    } = useUsuarios();

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, estadoFiltro, usuariosFiltrados.length]);

    const paginaUsuarios = useMemo(() => {
        const inicio = (paginaActual - 1) * elementosPorPagina;
        return usuariosFiltrados.slice(inicio, inicio + elementosPorPagina);
    }, [paginaActual, usuariosFiltrados]);

    const paginaTope = Math.max(1, Math.ceil(usuariosFiltrados.length / elementosPorPagina));

    const puedeGuardar =
        modoEdicion
            ? Boolean(access.actions.update)
            : Boolean(access.actions.create);

    return (

        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Usuarios</h1>
                    <p className="text-zinc-500">Administración de usuarios del sistema.</p>
                </div>
                <Permiso permiso={access.actions.create}>
                    <button
                        type="button"
                        onClick={abrirNuevoUsuario}
                        className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white transition hover:bg-zinc-800"
                    ><Plus size={18} />
                        Nuevo usuario
                    </button>
                </Permiso>
            </div>
            {/* Resumen */}
            <ResumenUsuarios
                usuarios={usuariosFiltrados}
            />
            <FiltrosUsuarios
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                estado={estadoFiltro}
                onEstadoChange={setEstadoFiltro}
            />
            <TablaUsuarios
                usuarios={paginaUsuarios}
                roles={roles}
                access={access}
                editar={abrirEdicion}
                eliminar={borrarUsuario}
                cambiarEstado={cambiarEstadoUsuario}
            />
            <PaginacionClientes
                paginaActual={paginaActual}
                paginaTope={paginaTope}
                onPaginaChange={setPaginaActual}
            />
            <ModalUsuario
                abierto={modalAbierto}
                usuario={usuarioActual}
                establecerUsuario={setUsuarioActual}
                roles={roles}
                guardar={guardarUsuario}
                cerrar={cerrarModal}
                modoEdicion={modoEdicion}
                puedeGuardar={puedeGuardar}
            />
        </div>

    );

};