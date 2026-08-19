import type { ReglaPrecio } from "../TiposReglas";
import { ReglaProducto } from "./tipos/ReglaProducto";
import { ReglaCarrito } from "./tipos/ReglaCarrito";
import { ReglasCombo } from "./tipos/ReglasCombo";

type Props = {
    regla: ReglaPrecio;

    establecerRegla: React.Dispatch<
        React.SetStateAction<ReglaPrecio>
    >;
};

export const RenderizadorTipoRegla = ({
    regla,
    establecerRegla
}: Props) => {
        switch (regla.tipo) {

        case "producto":

            return (
                <ReglaProducto
                    regla={regla}
                    establecerRegla={establecerRegla}
                />
            );

        case "carrito":

            return (
                <ReglaCarrito
                    regla={regla}
                    establecerRegla={establecerRegla}
                />
            );

        case "combo":

            return (
                <ReglasCombo
                    regla={regla}
                    establecerRegla={establecerRegla}
                />
            );

        default:

            return null;

    }

};