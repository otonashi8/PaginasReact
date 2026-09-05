type PropiedadesGaleriaImagenes = {
	imagenes: string[];
	actualizarImagenes: (imagenes: string[]) => void;
};

const leerArchivoComoDataUrl = (
	archivo: File,
	callback: (url: string) => void,
) => {
	const lector = new FileReader();
	lector.onload = () => callback(String(lector.result ?? ''));
	lector.readAsDataURL(archivo);
};

export const GaleriaImagenes = ({
	imagenes,
	actualizarImagenes,
}: PropiedadesGaleriaImagenes) => {
	const items = imagenes.length > 0 ? imagenes : [''];

	const actualizarImagen = (indice: number, valor: string) => {
		const nuevasImagenes = [...items];
		nuevasImagenes[indice] = valor;
		actualizarImagenes(nuevasImagenes.filter((imagen) => imagen.trim() !== ''));
	};

	const agregarImagen = () => actualizarImagenes([...items, '']);

	const eliminarImagen = (indice: number) => {
		actualizarImagenes(
			items.filter((_, itemIndice) => itemIndice !== indice).filter(Boolean),
		);
	};

	return (
		<section className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
			<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h3 className="text-base font-semibold text-zinc-950">Galeria</h3>
					<p className="mt-1 text-sm text-zinc-500">
						La primera imagen es la principal y la segunda se muestra al pasar el mouse sobre el producto.
					</p>
				</div>
				<button
					type="button"
					onClick={agregarImagen}
					className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-50 md:w-auto"
				>
					+ Agregar imagen
				</button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{items.map((imagen, indice) => (
					<div key={`${imagen}-${indice}`} className="overflow-hidden border border-zinc-200 bg-white">
						<div className="flex h-72 w-full items-center justify-center overflow-hidden border-b border-zinc-200 bg-zinc-50 p-3">
							{imagen ? (
								<img src={imagen} alt={`Imagen ${indice + 1}`} className="h-full w-full object-contain" />
							) : (
								<div className="flex h-full w-full items-center justify-center text-center text-sm text-zinc-400">
									Sin imagen
								</div>
							)}
						</div>

						<div className="p-3">
							<div className="mb-3 flex items-center justify-between gap-2">
								<div className="flex flex-wrap gap-1.5">
									<span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
										Imagen {indice + 1}
									</span>
									{indice === 0 ? <span className="bg-zinc-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Principal</span> : null}
									{indice === 1 ? <span className="bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Hover</span> : null}
								</div>
								<button
									type="button"
									onClick={() => eliminarImagen(indice)}
									className="text-xs font-medium text-red-600 transition hover:text-red-700"
								>
									Eliminar
								</button>
							</div>

							<label className="block text-sm text-zinc-700">
								<span className="mb-2 block font-medium">Imagen desde tu PC</span>
								<div className="relative cursor-pointer border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-center transition hover:border-zinc-900 hover:bg-zinc-100">
									<input
										type="file"
										accept="image/*"
										onChange={(event) => {
											const archivo = event.target.files?.[0];
											if (archivo?.type.startsWith('image/')) {
												leerArchivoComoDataUrl(archivo, (url) => actualizarImagen(indice, url));
											}
										event.target.value = '';
									}}
										className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
									/>
									<p className="pointer-events-none text-sm font-medium text-zinc-700">Seleccionar imagen</p>
									<p className="pointer-events-none mt-1 text-xs text-zinc-400">JPG, PNG, WEBP, GIF, etc.</p>
								</div>
							</label>

							<div className="my-3 flex items-center gap-2">
								<div className="h-px flex-1 bg-zinc-200" />
								<span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">o</span>
								<div className="h-px flex-1 bg-zinc-200" />
							</div>

							<label className="block text-sm text-zinc-700">
								<span className="mb-2 block font-medium">URL de la imagen</span>
								<input
									type="text"
									value={imagen.startsWith('data:') ? '' : imagen}
									onChange={(event) => actualizarImagen(indice, event.target.value)}
									placeholder="https://..."
									className="w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
								/>
							</label>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};
