type PropiedadesCarruselMiniImagenes = {
	miniImagenes: string[];
	actualizarMiniImagenes: (miniImagenes: string[]) => void;
};

export const CarruselMiniImagenes = ({
	miniImagenes,
	actualizarMiniImagenes,
}: PropiedadesCarruselMiniImagenes) => {
	const items = miniImagenes.length > 0 ? miniImagenes : [''];

	const leerArchivoComoDataUrl = (
		archivo: File,
		callback: (url: string) => void
	) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result === 'string') {
				callback(reader.result);
			}
		};

		reader.readAsDataURL(archivo);
	};

	const actualizarMiniImagen = (indice: number, valor: string) => {
		const nuevasMiniImagenes = [...items];
		nuevasMiniImagenes[indice] = valor;

		actualizarMiniImagenes(
			nuevasMiniImagenes.filter((item) => item.trim() !== '')
		);
	};

	const agregarMiniImagen = () => {
		actualizarMiniImagenes([...items, '']);
	};

	const eliminarMiniImagen = (indice: number) => {
		if (items.length <= 1) {
			actualizarMiniImagenes([]);
			return;
		}

		const nuevasMiniImagenes = items.filter(
			(_, itemIndice) => itemIndice !== indice
		);

		actualizarMiniImagenes(
			nuevasMiniImagenes.filter((item) => item.trim() !== '')
		);
	};

	const seleccionarImagenDesdePC = (
		indice: number,
		archivo?: File
	) => {
		if (!archivo) {
			return;
		}

		if (!archivo.type.startsWith('image/')) {
			return;
		}

		leerArchivoComoDataUrl(archivo, (url) => {
			actualizarMiniImagen(indice, url);
		});
	};

	return (
		<section className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
			{/* CABECERA */}
			<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h3 className="text-base font-semibold text-zinc-950">
						Mini imágenes del producto
					</h3>

					<p className="mt-1 text-sm text-zinc-500">
						Agrega imágenes secundarias mediante una URL o seleccionándolas
						directamente desde tu PC.
					</p>
				</div>

				<button
					type="button"
					onClick={agregarMiniImagen}
					className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-50 md:w-auto"
				>
					+ Agregar imagen
				</button>
			</div>

			{/* MINI IMÁGENES */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{items.map((miniImagen, indice) => (
					<div
						key={`${miniImagen}-${indice}`}
						className="overflow-hidden border border-zinc-200 bg-white"
					>
						{/* PREVISUALIZACIÓN */}
						<div className="flex h-72 w-full items-center justify-center overflow-hidden border-b border-zinc-200 bg-zinc-50 p-3">
							{miniImagen ? (
								<img
									src={miniImagen}
									alt={`Mini imagen ${indice + 1}`}
									className="h-full w-full object-contain"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-center text-sm text-zinc-400">
									Sin mini imagen
								</div>
							)}
						</div>

						{/* INFORMACIÓN */}
						<div className="p-3">
							<div className="mb-3 flex items-center justify-between gap-2">
								<span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
									Imagen {indice + 1}
								</span>

								{items.length > 1 ? (
									<button
										type="button"
										onClick={() => eliminarMiniImagen(indice)}
										className="text-xs font-medium text-red-600 transition hover:text-red-700"
									>
										Eliminar
									</button>
								) : null}
							</div>

							{/* OPCIÓN 1: SELECCIONAR DESDE PC */}
							<label className="block text-sm text-zinc-700">
								<span className="mb-2 block font-medium">
									Imagen desde tu PC
								</span>

								<div className="relative cursor-pointer border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-center transition hover:border-zinc-900 hover:bg-zinc-100">
									<input
										type="file"
										accept="image/*"
										onChange={(event) => {
											const archivo =
												event.target.files?.[0];

											seleccionarImagenDesdePC(
												indice,
												archivo
											);

											// Permite volver a seleccionar el mismo archivo
											event.target.value = '';
										}}
										className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
									/>

									<div className="pointer-events-none">
										<p className="text-sm font-medium text-zinc-700">
											Seleccionar imagen
										</p>

										<p className="mt-1 text-xs text-zinc-400">
											JPG, PNG, WEBP, GIF, etc.
										</p>
									</div>
								</div>
							</label>

							{/* SEPARADOR */}
							<div className="my-3 flex items-center gap-2">
								<div className="h-px flex-1 bg-zinc-200" />

								<span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
									o
								</span>

								<div className="h-px flex-1 bg-zinc-200" />
							</div>

							{/* OPCIÓN 2: URL */}
							<label className="block text-sm text-zinc-700">
								<span className="mb-2 block font-medium">
									URL de la imagen
								</span>

								<input
									type="text"
									value={
										miniImagen.startsWith('data:')
											? ''
											: miniImagen
									}
									onChange={(event) =>
										actualizarMiniImagen(
											indice,
											event.target.value
										)
									}
									placeholder="https://..."
									className="w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
								/>
							</label>

							{/* INDICADOR */}
							{miniImagen ? (
								<div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
									<span className="h-2 w-2 rounded-full bg-emerald-500" />
									Imagen cargada
								</div>
							) : null}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};