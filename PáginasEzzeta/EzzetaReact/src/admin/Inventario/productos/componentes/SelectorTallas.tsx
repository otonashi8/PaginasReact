import { useState } from 'react';
import type { TallaProducto } from '../TiposProductos';
import { obtenerTallasPorTipo } from '../DatosProductos';

type PropiedadesSelectorTallas = {
	tallasSeleccionadas: TallaProducto[];
	actualizarTallas: (tallas: TallaProducto[]) => void;
};

const tiposTalla: Array<{
	tipo: 'letras' | 'numeros';
	titulo: string;
}> = [
	{ tipo: 'letras', titulo: 'Letras' },
	{ tipo: 'numeros', titulo: 'Números' },
];

export const SelectorTallas = ({
	tallasSeleccionadas,
	actualizarTallas,
}: PropiedadesSelectorTallas) => {
	const [tiposVisibles, setTiposVisibles] = useState<
		Record<'letras' | 'numeros', boolean>
	>({
		letras: true,
		numeros: true,
	});

	const alternarTalla = (talla: TallaProducto) => {
		const existeTalla = tallasSeleccionadas.includes(talla);

		if (existeTalla) {
			actualizarTallas(
				tallasSeleccionadas.filter(
					(tallaActual) => tallaActual !== talla
				)
			);
			return;
		}

		actualizarTallas([...tallasSeleccionadas, talla]);
	};

	const alternarTipoVisible = (
		tipo: 'letras' | 'numeros'
	) => {
		setTiposVisibles((actual) => ({
			...actual,
			[tipo]: !actual[tipo],
		}));
	};

	const renderizarGrupo = (
		tipo: 'letras' | 'numeros',
		titulo: string
	) => {
		if (!tiposVisibles[tipo]) {
			return null;
		}

		const tallas = obtenerTallasPorTipo(tipo);

		return (
			<div
				key={tipo}
				className="border border-zinc-200 bg-zinc-50 p-3"
			>
				{/* CABECERA DEL GRUPO */}
				<div className="mb-3 flex items-center justify-between gap-3">
					<h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
						{titulo}
					</h4>

					<span className="text-xs text-zinc-400">
						{tallas.length} opciones
					</span>
				</div>

				{/* TALLAS */}
				{tallas.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{tallas.map((talla) => {
							const seleccionada =
								tallasSeleccionadas.includes(
									talla as TallaProducto
								);

							return (
								<label
									key={talla}
									className={`
										inline-flex cursor-pointer
										items-center gap-2
										border px-3 py-2
										text-sm font-medium
										transition-all duration-150
										${
											seleccionada
												? 'border-zinc-900 bg-zinc-900 text-white'
												: 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-950'
										}
									`}
								>
									<input
										type="checkbox"
										checked={seleccionada}
										onChange={() =>
											alternarTalla(
												talla as TallaProducto
											)
										}
										className="h-4 w-4 rounded border-zinc-300 accent-red-600"
									/>

									<span>{talla}</span>
								</label>
							);
						})}
					</div>
				) : (
					<div className="border border-dashed border-zinc-300 bg-white px-4 py-5 text-center text-sm text-zinc-400">
						No hay tallas registradas.
					</div>
				)}
			</div>
		);
	};

	return (
		<section className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm">
			{/* CABECERA */}
			<div className="mb-4">
				<h3 className="text-base font-semibold text-zinc-950">
					Tallas disponibles
				</h3>

				<p className="mt-1 text-sm text-zinc-500">
					Selecciona las tallas disponibles para este producto.
				</p>
			</div>

			{/* SELECTOR DE TIPOS */}
			<div className="mb-4 flex flex-wrap gap-2">
				{tiposTalla.map(({ tipo, titulo }) => {
					const activo = tiposVisibles[tipo];

					return (
						<label
							key={tipo}
							className={`
								inline-flex cursor-pointer
								items-center gap-2
								border px-3 py-2
								text-sm font-medium
								transition
								${
									activo
										? 'border-zinc-900 bg-zinc-900 text-white'
										: 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900'
								}
							`}
						>
							<input
								type="checkbox"
								checked={activo}
								onChange={() =>
									alternarTipoVisible(tipo)
								}
								className="h-4 w-4 rounded border-zinc-300 accent-red-600"
							/>

							<span>{titulo}</span>
						</label>
					);
				})}
			</div>

			{/* GRUPOS */}
			<div className="space-y-3">
				{renderizarGrupo('letras', 'Letras')}
				{renderizarGrupo('numeros', 'Números')}

				{!tiposVisibles.letras &&
					!tiposVisibles.numeros && (
						<div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
							<p className="text-sm font-medium text-zinc-600">
								Selecciona un tipo de talla
							</p>

							<p className="mt-1 text-xs text-zinc-400">
								Puedes mostrar tallas de letras,
								números o ambas.
							</p>
						</div>
					)}
			</div>
		</section>
	);
};