import { useEffect, useState } from 'react';

import type { ClasificacionesProductos, GuiaLavadoSubcategoria, GuiaTallasSubcategoria } from '../DatosProductos';
import {
    obtenerClasificacionesProductos,
    agregarCategoria as agregarCategoriaPersistida,
    agregarSubcategoria as agregarSubcategoriaPersistida,
    agregarGenero as agregarGeneroPersistida,
    agregarBeneficio as agregarBeneficioPersistida,
    agregarTalla as agregarTallaPersistida,
    eliminarCategoria as eliminarCategoriaPersistida,
    eliminarSubcategoria as eliminarSubcategoriaPersistida,
    eliminarGenero as eliminarGeneroPersistida,
    eliminarBeneficio as eliminarBeneficioPersistida,
    eliminarTalla as eliminarTallaPersistida,
    guardarSubcategoriaMetadata,
    obtenerSubcategoriaMetadata,
    crearGuiaTallasBase,
    type TallaTipo,
} from '../DatosProductos';

export const useClasificaciones = () => {
    const [clasificaciones, setClasificaciones] = useState<ClasificacionesProductos>(
        obtenerClasificacionesProductos(),
    );

    useEffect(() => {
        setClasificaciones(obtenerClasificacionesProductos());
    }, []);

    const recargarClasificaciones = () => {
        setClasificaciones(obtenerClasificacionesProductos());
    };

    const agregarCategoria = (categoria: string) => {
        agregarCategoriaPersistida(categoria);
        recargarClasificaciones();
    };

    const agregarSubcategoria = (categoria: string, subcategoria: string) => {
        agregarSubcategoriaPersistida(categoria, subcategoria);
        recargarClasificaciones();
    };

    const agregarGenero = (genero: string) => {
        agregarGeneroPersistida(genero);
        recargarClasificaciones();
    };

    const agregarBeneficio = (beneficio: string) => {
        agregarBeneficioPersistida(beneficio);
        recargarClasificaciones();
    };

    const agregarTalla = (talla: string, tipo?: TallaTipo) => {
        agregarTallaPersistida(talla, tipo);
        recargarClasificaciones();
    };

    const eliminarCategoria = (categoria: string) => {
        eliminarCategoriaPersistida(categoria);
        recargarClasificaciones();
    };

    const eliminarSubcategoria = (categoria: string, subcategoria: string) => {
        eliminarSubcategoriaPersistida(categoria, subcategoria);
        recargarClasificaciones();
    };

    const eliminarGenero = (genero: string) => {
        eliminarGeneroPersistida(genero);
        recargarClasificaciones();
    };

    const eliminarBeneficio = (beneficio: string) => {
        eliminarBeneficioPersistida(beneficio);
        recargarClasificaciones();
    };

    const eliminarTalla = (talla: string) => {
        eliminarTallaPersistida(talla);
        recargarClasificaciones();
    };

    const obtenerMetadataSubcategoria = (categoria: string, subcategoria: string) => {
        return obtenerSubcategoriaMetadata(categoria, subcategoria);
    };

    const guardarGuiaLavadoSubcategoria = (categoria: string, subcategoria: string, guia: GuiaLavadoSubcategoria) => {
        guardarSubcategoriaMetadata(categoria, subcategoria, { guiaLavado: guia });
        recargarClasificaciones();
    };

    const guardarGuiaTallasSubcategoria = (categoria: string, subcategoria: string, guiaTallas: GuiaTallasSubcategoria) => {
        guardarSubcategoriaMetadata(categoria, subcategoria, { guiaTallas });
        recargarClasificaciones();
    };

    return {
        clasificaciones,
        agregarCategoria,
        agregarSubcategoria,
        agregarGenero,
        agregarBeneficio,
        agregarTalla,
        eliminarCategoria,
        eliminarSubcategoria,
        eliminarGenero,
        eliminarBeneficio,
        eliminarTalla,
        obtenerMetadataSubcategoria,
        guardarGuiaLavadoSubcategoria,
        guardarGuiaTallasSubcategoria,
        crearGuiaTallasBase,
    };
};
