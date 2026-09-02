import { useMemo, useState } from 'react';
import type { Producto } from '../TiposProductos';

type PropiedadesSelectorRelacionados = {
	productoActualId: number;
	relacionados: number[];
	productosExistentes: Producto[];
	actualizarRelacionados: (relacionados: number[]) => void;
};

export const SelectorRelacionados = ({
	productoActualId,
	relacionados,
	productosExistentes,
	actualizarRelacionados,
}: PropiedadesSelectorRelacionados) => {
	const [busquedaRelacionados, setBusquedaRelacionados] = useState('');

	const productosDisponibles = useMemo(() => {
		const texto = busquedaRelacionados.trim().toLowerCase();

		return productosExistentes
			.filter((producto) => producto.id !== productoActualId)
			.filter((producto) => {
				if (!texto) {
					return true;
				}

				return [producto.nombre, producto.slug, producto.categoria, producto.subcategoria]
					.join(' ')
					.toLowerCase()
					.includes(texto);
			});
	}, [busquedaRelacionados, productoActualId, productosExistentes]);

	const alternarRelacionado = (idProductoRelacionado: number) => {
		if (relacionados.includes(idProductoRelacionado)) {
			actualizarRelacionados(relacionados.filter((idRelacionado) => idRelacionado !== idProductoRelacionado));
			return;
		}

		actualizarRelacionados([...relacionados, idProductoRelacionado]);
	};

	return (
		<section className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm sm:p-4">
		{/* CABECERA */}
		<div className="mb-4">
			<h3 className="text-base font-semibold text-zinc-950">
				Productos relacionados
			</h3>

			<p className="mt-1 text-sm text-zinc-500">
				Selecciona los productos que deseas mostrar como relacionados.
				Solo se guardarán sus IDs.
			</p>
		</div>

		{/* BUSCADOR */}
		<div className="relative mb-4">
			<input
				type="text"
				value={busquedaRelacionados}
				onChange={(event) =>
					setBusquedaRelacionados(event.target.value)
				}
				placeholder="Buscar productos relacionados..."
				className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
			/>

			{busquedaRelacionados && (
				<button
					type="button"
					onClick={() => setBusquedaRelacionados('')}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 transition hover:text-red-600"
					aria-label="Limpiar búsqueda"
				>
					✕
				</button>
			)}
		</div>

		{/* PRODUCTOS */}
		<div className="max-h-80 space-y-2 overflow-y-auto pr-1">
			{productosDisponibles.length === 0 ? (
				<div className="rounded-none border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
					No hay productos disponibles para relacionar.
				</div>
			) : (
				productosDisponibles.map((producto) => {
					const seleccionado = relacionados.includes(producto.id);

					return (
						<label
							key={producto.id}
							className={`group flex cursor-pointer items-center gap-3 border p-2.5 transition ${
								seleccionado
									? 'border-zinc-900 bg-zinc-900 text-white'
									: 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'
							}`}
						>
							{/* CHECKBOX */}
							<input
								type="checkbox"
								checked={seleccionado}
								onChange={() =>
									alternarRelacionado(producto.id)
								}
								className="h-4 w-4 shrink-0 rounded border-zinc-300 accent-red-600"
							/>

							{/* IMAGEN */}
							<div
								className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border ${
									seleccionado
										? 'border-white/20 bg-white'
										: 'border-zinc-200 bg-zinc-50'
								}`}
							>
								{producto.imagen ? (
									<img
										src={producto.imagen}
										alt={producto.nombre}
										className="h-full w-full object-contain p-1"
									/>
								) : (
									<div
										className={`flex h-full w-full items-center justify-center text-[10px] ${
											seleccionado
												? 'text-zinc-400'
												: 'text-zinc-400'
										}`}
									>
										Sin imagen
									</div>
								)}
							</div>

							{/* INFORMACIÓN */}
							<div className="min-w-0 flex-1">
								<p
									className={`truncate text-sm font-medium ${
										seleccionado
											? 'text-white'
											: 'text-zinc-950'
									}`}
								>
									{producto.nombre}
								</p>

								<p
									className={`mt-0.5 truncate text-xs ${
										seleccionado
											? 'text-zinc-300'
											: 'text-zinc-500'
									}`}
								>
									{producto.categoria}
									{producto.subcategoria
										? ` / ${producto.subcategoria}`
										: ''}
								</p>

								<p
									className={`mt-1 text-xs font-semibold ${
										seleccionado
											? 'text-red-300'
											: 'text-red-600'
									}`}
								>
									S/ {producto.precio.toFixed(2)}
								</p>
							</div>

							{/* ESTADO */}
							{seleccionado && (
								<span className="shrink-0 bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
									Seleccionado
								</span>
							)}
						</label>
					);
				})
			)}
		</div>

		{/* RESUMEN */}
		{relacionados.length > 0 && (
			<div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
				<p className="text-xs text-zinc-500">
					Productos relacionados seleccionados
				</p>

				<span className="bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white">
					{relacionados.length}
				</span>
			</div>
		)}
	</section>
	);
};
