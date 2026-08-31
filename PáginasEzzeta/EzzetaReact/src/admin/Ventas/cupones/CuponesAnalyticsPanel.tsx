import { useEffect, useMemo, useState } from 'react';
import { obtenerPedidos, obtenerPedidosDesdeApi, suscribirsePedidosCambios } from '../pedidos/DatosPedidos';
import type { DescuentoPedido, Pedido } from '../pedidos/TiposPedidos';
import { obtenerReglas } from '../../Sistema/reglas-precios/DatosReglas';
import type { ReglaPrecio } from '../../Sistema/reglas-precios/TiposReglas';
import { FiltrosFechaRango } from '../../componentes/FiltrosFechaRango';
import { isWithinDateRange } from '../../utils/dateRange';

type CupónRow = {
  id: number;
  nombre: string;
  codigo: string;
  tipo: string;
  usos: number;
  generado: number;
  descontado: number;
  estado: boolean;
};

const moneda = (value: number) => `S/ ${value.toFixed(2)}`;
const descuentoRegla = (descuento: DescuentoPedido, regla: ReglaPrecio) => (
  Number(descuento.reglaId) === regla.id
  || descuento.nombre?.toLowerCase() === regla.nombre.toLowerCase()
  || descuento.codigo?.toUpperCase() === String(regla.configuracion.cupon ?? '').toUpperCase()
);

export const CuponesAnalyticsPanel = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(obtenerPedidos());
  const [reglas, setReglas] = useState<ReglaPrecio[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setPedidos(await obtenerPedidosDesdeApi());
      } catch {
        setPedidos(obtenerPedidos());
      }
    };

    void cargarPedidos();
    void obtenerReglas().then(setReglas).catch(() => setReglas([]));
    return suscribirsePedidosCambios(() => void cargarPedidos());
  }, []);

  const pedidosRango = useMemo(() => pedidos.filter((pedido) => isWithinDateRange(pedido.fechaPedido, fechaInicio, fechaFin)), [pedidos, fechaInicio, fechaFin]);

  const rows = useMemo<CupónRow[]>(() => reglas.map((regla) => {
      const usos = pedidosRango.filter((pedido) => pedido.estado !== 'cancelado')
        .flatMap((pedido) => pedido.descuentos.map((descuento) => ({ pedido, descuento })))
        .filter(({ descuento }) => descuentoRegla(descuento, regla));
      const generadoDesdePedidos = usos.reduce((total, { pedido, descuento }) => total + Number(descuento.generado ?? pedido.subtotal ?? 0), 0);
      return {
        id: regla.id,
        nombre: regla.nombre,
        codigo: String(regla.configuracion.cupon ?? 'No Cupon'),
        tipo: regla.tipo,
        usos: usos.length,
        generado: Number((usos.length > 0 ? generadoDesdePedidos : Number(regla.generado ?? 0)).toFixed(2)),
        descontado: Number(usos.reduce((total, { pedido, descuento }) => total + Number(descuento.monto ?? descuento.valor ?? pedido.descuentoTotal ?? 0), 0).toFixed(2)),
        estado: regla.estado,
      };
    }), [pedidosRango, reglas]);

  const visibles = rows.filter((row) => `${row.nombre} ${row.codigo}`.toLowerCase().includes(busqueda.toLowerCase()));
  const totalGenerado = visibles.reduce((total, row) => total + row.generado, 0);
  const totalDescontado = visibles.reduce((total, row) => total + row.descontado, 0);

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Ventas</p><h1 className="mt-1 text-2xl font-bold">Cupones y reglas</h1><p className="mt-1 text-sm text-zinc-500">Rendimiento calculado sobre pedidos no cancelados.</p></div>
      <input aria-label="Buscar cupón o regla" className="border border-zinc-300 px-3 py-2 text-sm" placeholder="Buscar cupón o regla..." value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
    </div>
    <div className="grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
      <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Generado</p><p className="mt-2 text-2xl font-semibold">{moneda(totalGenerado)}</p></div>
      <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Descontado</p><p className="mt-2 text-2xl font-semibold text-red-700">{moneda(totalDescontado)}</p></div>
      <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Uso de cupones</p><p className="mt-2 text-2xl font-semibold">{visibles.reduce((total, row) => total + row.usos, 0)}</p></div>
    </div>
    <FiltrosFechaRango
      fechaInicio={fechaInicio}
      fechaFin={fechaFin}
      onFechaInicioChange={setFechaInicio}
      onFechaFinChange={setFechaFin}
      onLimpiar={() => {
        setFechaInicio('');
        setFechaFin('');
      }}
    />
    <div className="overflow-x-auto border border-zinc-200 bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-zinc-100"><tr><th className="px-4 py-3">Regla</th><th className="px-4 py-3">Cupón</th><th className="px-4 py-3">Usos</th><th className="px-4 py-3 text-right">Generado</th><th className="px-4 py-3 text-right">Descontado</th><th className="px-4 py-3">Estado</th></tr></thead><tbody>
      {visibles.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">No hay reglas que coincidan con la búsqueda.</td></tr> : visibles.map((row) => <tr key={row.id} className="border-t border-zinc-200"><td className="px-4 py-3"><p className="font-medium">{row.nombre}</p><p className="text-xs text-zinc-500">{row.tipo}</p></td><td className="px-4 py-3 font-mono text-xs">{row.codigo}</td><td className="px-4 py-3">{row.usos}</td><td className="px-4 py-3 text-right font-medium">{moneda(row.generado)}</td><td className="px-4 py-3 text-right font-medium text-red-700">{moneda(row.descontado)}</td><td className="px-4 py-3">{row.estado ? 'Activa' : 'Inactiva'}</td></tr>)}</tbody></table></div>
  </div>;
};