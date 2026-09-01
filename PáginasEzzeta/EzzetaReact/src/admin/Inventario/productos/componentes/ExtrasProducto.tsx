import { useMemo, useState } from 'react';
import { obtenerClasificacionesProductos } from '../DatosProductos';

type PropiedadesExtrasProducto = {
	extras: string[];
	actualizarExtras: (extras: string[]) => void;
};

const beneficiosBase = [
	'Pago seguro',
	'Entrega en todo Perú',
	'Envío gratis desde S/300',
	'Devoluciones fáciles',
	'Garantía de calidad',
	'Stock disponible',
];

export const ExtrasProducto = ({
	extras,
	actualizarExtras,
}: PropiedadesExtrasProducto) => {
	const [nuevoBeneficio, setNuevoBeneficio] = useState('');
	const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
	const { beneficiosDisponibles } = obtenerClasificacionesProductos();
	const beneficiosSugeridos = useMemo(
		() => Array.from(new Set([...beneficiosBase, ...beneficiosDisponibles])),
		[beneficiosDisponibles],
	);

	const guardarBeneficio = () => {
		const beneficioNormalizado = nuevoBeneficio.trim();

		if (!beneficioNormalizado) {
			return;
		}

		if (indiceEdicion === null) {
			actualizarExtras([...extras, beneficioNormalizado]);
		} else {
			actualizarExtras(
				extras.map((extra, indice) => (indice === indiceEdicion ? beneficioNormalizado : extra)),
			);
		}

		setNuevoBeneficio('');
		setIndiceEdicion(null);
	};

	const editarBeneficio = (indice: number) => {
		setNuevoBeneficio(extras[indice] ?? '');
		setIndiceEdicion(indice);
	};

	const eliminarBeneficio = (indice: number) => {
		actualizarExtras(extras.filter((_, indiceActual) => indiceActual !== indice));

		if (indiceEdicion === indice) {
			setNuevoBeneficio('');
			setIndiceEdicion(null);
		}
	};

	const agregarBeneficioSugerido = (beneficio: string) => {
		if (extras.includes(beneficio)) {
			return;
		}
		actualizarExtras([...extras, beneficio]);
	};

	return (
		<section className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm">
			<div className="mb-4">
				<p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-600">Características</p>
				<h3 className="mt-1 text-base font-semibold text-zinc-950">Beneficios del producto</h3>
				<p className="mt-1 text-sm text-zinc-500">Selecciona un beneficio sugerido o crea uno personalizado.</p>
			</div>
			<div className="flex flex-col gap-2 sm:flex-row">
				<input
					type="text"
					value={nuevoBeneficio}
					onChange={(event) =>
						setNuevoBeneficio(event.target.value)
					}
					placeholder="Ej. Envío seguro a todo el Perú"
					className="min-w-0 flex-1 rounded-none border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
				/>
				<button
					type="button"
					onClick={guardarBeneficio}
					className="rounded-none bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 sm:shrink-0"
				>
					{indiceEdicion === null
						? 'Agregar beneficio'
						: 'Guardar beneficio'}
				</button>
			</div>
			{beneficiosSugeridos.length > 0 ? (
				<div className="mt-4">
					<div className="mb-2 flex items-center justify-between gap-3">
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Sugeridos</p>
						<span className="text-[0.65rem] text-zinc-400">Selecciona para agregar</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{beneficiosSugeridos.map((beneficio) => {
							const activo = extras.includes(beneficio);

							return (
								<button
									type="button"
									key={beneficio}
									onClick={() =>
										agregarBeneficioSugerido(beneficio)
									}
									className={`rounded-none border px-3 py-1.5 text-xs font-medium transition ${
										activo
											? 'border-red-600 bg-red-600 text-white'
											: 'border-zinc-300 bg-white text-zinc-700 hover:border-red-600 hover:text-red-600'
									}`}
								>
									{activo ? '✓ ' : '+ '}
									{beneficio}
								</button>
							);
						})}
					</div>
				</div>
			) : null}
			<div className="mt-5 border-t border-zinc-200 pt-4">
				<div className="mb-3 flex items-center justify-between">
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Beneficios seleccionados</p>
					{extras.length > 0 ? (
						<span className="text-xs font-medium text-zinc-400">
							{extras.length}{' '}
							{extras.length === 1
								? 'beneficio'
								: 'beneficios'}
						</span>
					) : null}
				</div>
				{extras.length === 0 ? (
					<div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-7 text-center">
						<p className="text-sm font-medium text-zinc-500">Aún no hay beneficios registrados.</p>
						<p className="mt-1 text-xs text-zinc-400">Selecciona uno de los sugeridos o agrega uno personalizado.</p>
					</div>
				) : (
					<div className="space-y-2">
						{extras.map((extra, indice) => (
							<div
								key={`${extra}-${indice}`}
								className="flex flex-col gap-3 border border-zinc-200 bg-white px-3 py-3 transition hover:border-zinc-300 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex min-w-0 items-start gap-3">
									<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-red-600 text-[0.65rem] font-bold text-white">✓</span>
									<p className="min-w-0 text-sm text-zinc-700">{extra}</p>
								</div>

								<div className="flex shrink-0 gap-2">
									<button
										type="button"
										onClick={() =>
											editarBeneficio(indice)
										}
										className="rounded-none border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
									>Editar
									</button>

									<button
										type="button"
										onClick={() =>
											eliminarBeneficio(indice)
										}
										className="rounded-none border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
									>Eliminar
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
};
