import { useMemo, useState } from 'react';
import { MapPinned, X } from 'lucide-react';
import { usePedidos } from '../pedidos/hooks/usePedidos';
import type { Pedido, ProductoPedido } from '../pedidos/TiposPedidos';
import { ExportButton } from '../../componentes/ExportButton';
import { buildCsv, downloadCsv, formatFilenameDateRange } from '../../utils/exportCsv';
import { registrarExportacion } from '../../../services/auditService';

type UbigeoRow = {
	ubicacion: string;
	departamento: string;
	provincia: string;
	distrito: string;
	pedidos: number;
	unidades: number;
	ventas: number;
	participacion: number;
};

type AggregationLevel = 'full' | 'departamento' | 'provincia' | 'distrito';

type ProductRanking = {
	nombre: string;
	categoria: string;
	unidades: number;
	ventas: number;
};

const normalize = (value: string | undefined): string => value?.trim() || 'Sin ubicación';

const isValidSale = (pedido: Pedido): boolean => pedido.estado !== 'cancelado';

const isWithinDateRange = (pedido: Pedido, fechaInicio: string, fechaFin: string): boolean => {
	const date = new Date(pedido.fechaPedido);
	if (Number.isNaN(date.getTime())) return false;

	if (fechaInicio && date < new Date(`${fechaInicio}T00:00:00`)) return false;
	if (fechaFin && date > new Date(`${fechaFin}T23:59:59.999`)) return false;
	return true;
};

const getLocationKey = (pedido: Pedido): string => [
	normalize(pedido.direccion.departamento),
	normalize(pedido.direccion.provincia),
	normalize(pedido.direccion.distrito),
].join(' / ');

const buildLocationRows = (pedidos: Pedido[], level: AggregationLevel = 'full'): UbigeoRow[] => {
	const rows = new Map<string, UbigeoRow>();

	pedidos.forEach((pedido) => {
		const departamento = normalize(pedido.direccion.departamento);
		const provincia = normalize(pedido.direccion.provincia);
		const distrito = normalize(pedido.direccion.distrito);
		const ubicacion = level === 'departamento'
			? departamento
			: level === 'provincia'
				? `${departamento} / ${provincia}`
				: level === 'distrito'
					? distrito
					: getLocationKey(pedido);
		const current = rows.get(ubicacion) ?? {
			ubicacion,
			departamento,
			provincia: level === 'departamento' ? 'Todos' : provincia,
			distrito: level === 'full' ? distrito : 'Todos',
			pedidos: 0,
			unidades: 0,
			ventas: 0,
			participacion: 0,
		};

		current.pedidos += 1;
		current.unidades += pedido.productos.reduce((total, producto) => total + producto.cantidad, 0);
		current.ventas += pedido.total;
		rows.set(ubicacion, current);
	});

	const totalVentas = Array.from(rows.values()).reduce((total, row) => total + row.ventas, 0);
	return Array.from(rows.values())
		.map((row) => ({
			...row,
			participacion: totalVentas > 0 ? Number(((row.ventas / totalVentas) * 100).toFixed(2)) : 0,
		}))
		.sort((a, b) => b.ventas - a.ventas);
};

const matchesRowScope = (pedido: Pedido, row: UbigeoRow): boolean => (
	normalize(pedido.direccion.departamento) === row.departamento
	&& (row.provincia === 'Todos' || normalize(pedido.direccion.provincia) === row.provincia)
	&& (row.distrito === 'Todos' || normalize(pedido.direccion.distrito) === row.distrito)
);

const buildProductRanking = (pedidos: Pedido[]): ProductRanking[] => {
	const products = new Map<string, ProductRanking>();

	pedidos.forEach((pedido) => {
		pedido.productos.forEach((producto: ProductoPedido) => {
			const current = products.get(producto.nombre) ?? {
				nombre: producto.nombre,
				categoria: producto.categoria || 'Sin categoría',
				unidades: 0,
				ventas: 0,
			};

			current.unidades += producto.cantidad;
			current.ventas += producto.subtotal;
			products.set(producto.nombre, current);
		});
	});

	return Array.from(products.values())
		.sort((a, b) => b.unidades - a.unidades || b.ventas - a.ventas)
		.slice(0, 10);
};

export const UbigeoAnalyticsPanel = () => {
	const { pedidos } = usePedidos();
	const [fechaInicio, setFechaInicio] = useState('');
	const [fechaFin, setFechaFin] = useState('');
	const [departamentoFiltro, setDepartamentoFiltro] = useState('');
	const [provinciaFiltro, setProvinciaFiltro] = useState('');
	const [distritoFiltro, setDistritoFiltro] = useState('');
	const [selectedLocation, setSelectedLocation] = useState<UbigeoRow | null>(null);

	const ventasValidas = useMemo(
		() => pedidos.filter((pedido) => isValidSale(pedido) && isWithinDateRange(pedido, fechaInicio, fechaFin)),
		[fechaFin, fechaInicio, pedidos],
	);
	const rows = useMemo(() => buildLocationRows(ventasValidas), [ventasValidas]);
	const departamentos = useMemo(() => Array.from(new Set(rows.map((row) => row.departamento))).sort(), [rows]);
	const provincias = useMemo(() => Array.from(new Set(rows.map((row) => row.provincia))).sort(), [rows]);
	const distritos = useMemo(() => Array.from(new Set(rows.map((row) => row.distrito))).sort(), [rows]);
	const filteredPedidos = useMemo(
		() => ventasValidas.filter((pedido) => (
			(!departamentoFiltro || normalize(pedido.direccion.departamento) === departamentoFiltro)
			&& (!provinciaFiltro || normalize(pedido.direccion.provincia) === provinciaFiltro)
			&& (!distritoFiltro || normalize(pedido.direccion.distrito) === distritoFiltro)
		)),
		[departamentoFiltro, distritoFiltro, provinciaFiltro, ventasValidas],
	);
	const aggregationLevel: AggregationLevel = departamentoFiltro && !provinciaFiltro && !distritoFiltro
		? 'departamento'
		: provinciaFiltro && !distritoFiltro
			? 'provincia'
			: distritoFiltro && !departamentoFiltro && !provinciaFiltro
				? 'distrito'
				: 'full';
	const filteredRows = useMemo(
		() => buildLocationRows(filteredPedidos, aggregationLevel).filter((row) => (
			(!departamentoFiltro || row.departamento === departamentoFiltro)
			&& (!provinciaFiltro || row.provincia === provinciaFiltro)
			&& (!distritoFiltro || row.distrito === distritoFiltro)
		)),
		[aggregationLevel, departamentoFiltro, distritoFiltro, filteredPedidos, provinciaFiltro],
	);
	const topProducts = useMemo(
		() => buildProductRanking(selectedLocation
			? ventasValidas.filter((pedido) => matchesRowScope(pedido, selectedLocation))
			: filteredPedidos),
		[selectedLocation, filteredPedidos, ventasValidas],
	);

	const clearFilters = () => {
		setFechaInicio('');
		setFechaFin('');
		setDepartamentoFiltro('');
		setProvinciaFiltro('');
		setDistritoFiltro('');
	};

	const exportRows = () => {
		if (!filteredRows.length) {
			window.alert('No hay ventas para exportar con los filtros actuales.');
			return;
		}

		const range = formatFilenameDateRange(fechaInicio, fechaFin);
		const csv = buildCsv<UbigeoRow>(filteredRows, [
			{ label: 'Ubicación', value: (row) => row.ubicacion },
			{ label: 'Departamento', value: (row) => row.departamento },
			{ label: 'Provincia', value: (row) => row.provincia },
			{ label: 'Distrito', value: (row) => row.distrito },
			{ label: 'Pedidos', value: (row) => row.pedidos },
			{ label: 'Unidades', value: (row) => row.unidades },
			{ label: 'Ventas', value: (row) => row.ventas.toFixed(2) },
			{ label: 'Participación', value: (row) => `${row.participacion.toFixed(2)}%` },
		]);
		downloadCsv(`ventas_ubigeo${range ? `_${range}` : `_${new Date().toISOString().slice(0, 10)}`}.csv`, csv);
		registrarExportacion('Ventas', 'Ubigeo', 'Ventas por ubicación', `Se exportaron ${filteredRows.length} ubicaciones.`, 'sales.ubigeo.export');
	};

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="flex items-center gap-3">
						<MapPinned className="text-zinc-700" size={22} />
						<h1 className="text-2xl font-semibold text-zinc-950">Ventas por Ubigeo</h1>
					</div>
					<p className="mt-2 text-sm text-zinc-500">Analiza las ventas reales según departamento, provincia y distrito.</p>
				</div>
				<ExportButton onExport={exportRows} />
			</div>

			<div className="grid gap-3 rounded-none border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-6">
				<label className="text-sm text-zinc-600"><span className="mb-1 block">Desde</span><input type="date" value={fechaInicio} onChange={(event) => setFechaInicio(event.target.value)} className="w-full rounded-none border border-zinc-300 px-3 py-2" /></label>
				<label className="text-sm text-zinc-600"><span className="mb-1 block">Hasta</span><input type="date" value={fechaFin} onChange={(event) => setFechaFin(event.target.value)} className="w-full rounded-none border border-zinc-300 px-3 py-2" /></label>
				<label className="text-sm text-zinc-600"><span className="mb-1 block">Departamento</span><select value={departamentoFiltro} onChange={(event) => setDepartamentoFiltro(event.target.value)} className="w-full rounded-none border border-zinc-300 px-3 py-2"><option value="">Todos</option>{departamentos.map((departamento) => <option key={departamento} value={departamento}>{departamento}</option>)}</select></label>
				<label className="text-sm text-zinc-600"><span className="mb-1 block">Provincia</span><select value={provinciaFiltro} onChange={(event) => setProvinciaFiltro(event.target.value)} className="w-full rounded-none border border-zinc-300 px-3 py-2"><option value="">Todas</option>{provincias.map((provincia) => <option key={provincia} value={provincia}>{provincia}</option>)}</select></label>
				<label className="text-sm text-zinc-600"><span className="mb-1 block">Distrito</span><select value={distritoFiltro} onChange={(event) => setDistritoFiltro(event.target.value)} className="w-full rounded-none border border-zinc-300 px-3 py-2"><option value="">Todos</option>{distritos.map((distrito) => <option key={distrito} value={distrito}>{distrito}</option>)}</select></label>
				<button type="button" onClick={clearFilters} className="self-end rounded-none border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:border-zinc-900">Quitar filtros</button>
			</div>

			<div className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm">
				<div className="mb-4 flex items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-zinc-950">Ventas por ubicación</h2>
						<p className="mt-1 text-sm text-zinc-500">Comparación de ingresos según los filtros actuales.</p>
					</div>
				</div>
				{filteredRows.length ? (
					<div className="flex h-56 items-end gap-3 overflow-x-auto pb-1">
						{(() => {
							const maxVentas = Math.max(...filteredRows.map((row) => row.ventas), 1);
							return filteredRows.map((row) => (
								<div key={row.ubicacion} className="flex h-full min-w-28 flex-1 flex-col items-center justify-end gap-2">
									<span className="text-xs font-semibold text-zinc-800">S/ {row.ventas.toFixed(2)}</span>
									<div className="flex h-40 w-full items-end rounded-t bg-zinc-100">
										<div className="w-full rounded-t bg-zinc-900 transition-all" style={{ height: `${(row.ventas / maxVentas) * 100}%` }} title={`${row.ubicacion}: ${row.participacion.toFixed(2)}%`} />
									</div>
									<span className="w-full truncate text-center text-[11px] text-zinc-500" title={row.ubicacion}>{row.ubicacion}</span>
								</div>
							));
						})()}
					</div>
				) : <p className="text-sm text-zinc-500">No hay ventas para graficar.</p>}
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-sm text-zinc-500">Ubicaciones</p><p className="mt-2 text-3xl font-semibold">{filteredRows.length}</p></div>
				<div className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-sm text-zinc-500">Pedidos válidos</p><p className="mt-2 text-3xl font-semibold">{ventasValidas.length}</p></div>
				<div className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-sm text-zinc-500">Ventas</p><p className="mt-2 text-3xl font-semibold">S/ {filteredRows.reduce((total, row) => total + row.ventas, 0).toFixed(2)}</p></div>
			</div>

			<div className="overflow-x-auto rounded-none border border-zinc-200 bg-white shadow-sm">
				<table className="min-w-full text-sm">
					<thead className="bg-zinc-50 text-left text-zinc-600"><tr><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Pedidos</th><th className="px-4 py-3">Unidades</th><th className="px-4 py-3">Ventas</th><th className="px-4 py-3">Participación</th><th className="px-4 py-3 text-right">Acción</th></tr></thead>
					<tbody className="divide-y divide-zinc-100">
						{filteredRows.length ? filteredRows.map((row) => <tr key={row.ubicacion}><td className="px-4 py-3 font-medium text-zinc-900">{row.ubicacion}</td><td className="px-4 py-3">{row.pedidos}</td><td className="px-4 py-3">{row.unidades}</td><td className="px-4 py-3">S/ {row.ventas.toFixed(2)}</td><td className="px-4 py-3">{row.participacion.toFixed(2)}%</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => setSelectedLocation(row)} className="rounded-none bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600">Detalles</button></td></tr>) : <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No hay ventas reales para los filtros seleccionados.</td></tr>}
					</tbody>
				</table>
			</div>

			{selectedLocation ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-none bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-zinc-950">Top 10 productos</h2><p className="mt-1 text-sm text-zinc-500">{selectedLocation.ubicacion}</p></div><button type="button" onClick={() => setSelectedLocation(null)} aria-label="Cerrar detalles" className="rounded-none border border-zinc-300 p-2 text-zinc-700 hover:border-zinc-900"><X size={18} /></button></div><div className="mt-5 overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-zinc-50 text-left text-zinc-600"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Producto</th><th className="px-3 py-2">Categoría</th><th className="px-3 py-2">Unidades</th><th className="px-3 py-2">Ventas</th></tr></thead><tbody className="divide-y divide-zinc-100">{topProducts.map((product, index) => <tr key={product.nombre}><td className="px-3 py-3">{index + 1}</td><td className="px-3 py-3 font-medium">{product.nombre}</td><td className="px-3 py-3">{product.categoria}</td><td className="px-3 py-3">{product.unidades}</td><td className="px-3 py-3">S/ {product.ventas.toFixed(2)}</td></tr>)}</tbody></table></div></div></div> : null}
		</section>
	);
};
