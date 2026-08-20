import type { Usuario } from "../usuarios/TiposUsuarios";

type UsuarioApi = {
    id: number;
    nombres: string;
    usuario: string;
    correo: string;
    telefono: string;
    contraseña: string;
    rolId: number;
    protegido: boolean;
    estado: Usuario["estado"];
    ultimoAcceso: string;
    fechaCreacion: string;
    fechaActualizacion: string;
};

export const MapperUsuarios = {

    desdeApi(
        usuario: UsuarioApi
    ): Usuario {
        return {
            id: usuario.id,
            nombres: usuario.nombres,
            usuario: usuario.usuario,
            correo: usuario.correo,
            telefono: usuario.telefono,
            contraseña: usuario.contraseña,
            rolId: usuario.rolId,
            protegido: usuario.protegido,
            estado: usuario.estado,
            ultimoAcceso: usuario.ultimoAcceso,
            fechaCreacion: usuario.fechaCreacion,
            fechaActualizacion: usuario.fechaActualizacion
        };
    },
    haciaApi(
        usuario: Usuario
    ): UsuarioApi {

        return {
            id: usuario.id,
            nombres: usuario.nombres,
            usuario: usuario.usuario,
            correo: usuario.correo,
            telefono: usuario.telefono,
            contraseña: usuario.contraseña,
            rolId: usuario.rolId,
            protegido: usuario.protegido,
            estado: usuario.estado,
            ultimoAcceso: usuario.ultimoAcceso,
            fechaCreacion: usuario.fechaCreacion,
            fechaActualizacion: usuario.fechaActualizacion
        };
    }
};