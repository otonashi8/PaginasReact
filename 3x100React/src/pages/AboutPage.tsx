export const AboutPage = () => {
  return (
    <section className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-black/50">NUESTRA VISIÓN Y MISIÓN</p>
        <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.18em] text-black sm:text-4xl lg:text-5xl">
          NUESTRA VISIÓN Y MISIÓN
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-zinc-100 shadow-sm">
          <img
            src="https://3x100.pe/wp-content/uploads/2025/11/polo-negro-basico-unisex-1.jpg.webp"
            alt="polo negro para hombre"
            className="h-[510px] w-full object-cover"
          />
        </div>

        <div className="space-y-7 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-[0.16em] text-orange-500">Visión</h2>
            <p className="text-sm leading-8 text-black/75">
              <span className="block text-base font-semibold text-black">Por qué existimos:</span>
              Destruir el mito de que el buen estilo deportivo es un lujo. Existimos para darte la libertad de multiplicar tus outfits con el respaldo textil de Ezzeta Company, bajo una regla transparente y sin vueltas: 3 prendas, 100 soles. Hacemos que vestir con actitud sea un derecho diario, no un gasto planeado.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-[0.16em] text-orange-500">Misión</h2>
            <p className="text-sm leading-8 text-black/75">
              <span className="block text-base font-semibold text-black">Hacia dónde vamos:</span>
              Convertirnos en el epicentro indiscutible del <em>smart shopping</em> deportivo en el Perú. No aspiramos a ser una opción más; nos proyectamos como el estándar nacional donde el rendimiento, la estética urbana y la economía inteligente se fusionan, permitiendo que cada peruano renueve su motivación y su armario sin mirar el precio.
            </p>
          </div>

        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-zinc-100 shadow-sm">
          <img
            src="https://3x100.pe/wp-content/uploads/2025/11/camisa-plomo-catttivo-hombre-3-819x1024.jpg.webp"
            alt="camisa plomo para hombre"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-zinc-100 shadow-sm">
          <img
            src="https://3x100.pe/wp-content/uploads/2025/11/Polo-Blanco-Skull-Bet-819x1024.jpg"
            alt="Polo Blanco Skull Bet para hombre"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-zinc-100 shadow-sm">
          <img
            src="https://3x100.pe/wp-content/uploads/2025/11/Polo-Gargola-Vintage-Hombre-1-819x1024.jpg"
            alt="Polo Gargola Vintage para Hombre"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-zinc-100 shadow-sm">
          <img
            src="https://3x100.pe/wp-content/uploads/2025/11/Polo-gargola-CRPT-1.jpg"
            alt="Polo Gargola CRPT"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-zinc-100 shadow-sm">
          <img
            src="https://3x100.pe/wp-content/uploads/2026/01/polo-negro-street-money-1.jpg"
            alt="Polo Negro Street Money para Hombre"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
        <div className="max-w-4xl space-y-6">
          <h2 className="text-3xl font-bold uppercase tracking-[0.16em] text-orange-500">Acerca de Nosotros</h2>
          <p className="text-base leading-8 text-black/75">
            Llevamos el sello y la garantía de Ezzeta Company a un nuevo nivel de accesibilidad. <strong>3×100</strong> es el espacio donde las tendencias urbanas y la estrategia inteligente se unen para transformar tu forma de comprar moda. Una cuidada selección de prendas diseñada para quienes valoran la calidad, exigen variedad y eligen multiplicar sus posibilidades todos los días.
          </p>
          <a
            href="/tienda"
            className="inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-orange-600"
          >
            ver Catálogo
          </a>
        </div>
      </div>
    </section>
  );
};
