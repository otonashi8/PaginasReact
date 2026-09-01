type PropiedadesImagenPrincipal = {
	nombreProducto: string;
	imagen: string;
	actualizarImagen: (imagen: string) => void;
};

const leerArchivoComoDataUrl = (
	archivo: File,
	callback: (url: string) => void,
) => {
	const lector = new FileReader();
	lector.onload = () => {
		callback(String(lector.result ?? ''));
	};
	lector.readAsDataURL(archivo);
};

export const ImagenPrincipal = ({
	nombreProducto,
	imagen,
	actualizarImagen,
}: PropiedadesImagenPrincipal) => {
	return (
		<section className="rounded-none border border-zinc-200 bg-white p-3 shadow-sm">
			<div className="mb-3 border-b border-zinc-100 pb-3">
				<h3 className="text-sm font-semibold text-zinc-950">
					Imagen principal
				</h3>
				<p className="mt-1 text-xs text-zinc-500">
					Vista previa y URL de la imagen del producto.
				</p>
			</div>

			<div className="grid gap-3 lg:grid-cols-[280px_1fr]">
				{/* PREVISUALIZACIÓN */}
				<div className="overflow-hidden border border-zinc-200 bg-zinc-50">
					{imagen ? (
						<div className="flex h-56 w-full items-center justify-center p-2">
							<img
								src={imagen}
								alt={nombreProducto || "Producto sin nombre"}
								className="h-full w-full object-contain"
							/>
						</div>
					) : (
						<div className="flex h-56 items-center justify-center px-4 text-center text-xs text-zinc-400">
							Sin imagen principal
						</div>
					)}
				</div>

				{/* CONTROLES */}
				<div className="flex min-w-0 flex-col justify-center gap-3">
					<label className="block">
						<span className="mb-1.5 block text-xs font-semibold text-zinc-800">
							URL de la imagen
						</span>

						<input
							type="text"
							value={imagen}
							onChange={(event) =>
								actualizarImagen(event.target.value)
							}
							placeholder="https://..."
							className="w-full rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
						/>
					</label>

					<label className="block">
						<span className="mb-1.5 block text-xs font-semibold text-zinc-800">
							Carga local temporal
						</span>

						<input
							type="file"
							accept="image/*"
							onChange={(event) => {
								const archivo = event.target.files?.[0];

								if (!archivo) {
									return;
								}

								leerArchivoComoDataUrl(
									archivo,
									actualizarImagen
								);
							}}
							className="block w-full rounded-none border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-600 outline-none transition file:mr-3 file:rounded-none file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:border-zinc-500"
						/>

						<p className="mt-1 text-[11px] text-zinc-400">
							La carga local es temporal y se convierte en Data URL.
						</p>
					</label>
				</div>
			</div>
		</section>
	);
};
