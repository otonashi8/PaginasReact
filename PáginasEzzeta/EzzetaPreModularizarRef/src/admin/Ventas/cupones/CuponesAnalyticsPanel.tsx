import { useEffect, useMemo, useState } from 'react';
import { obtenerPedidos, suscribirsePedidosCambios } from '../pedidos/DatosPedidos';
import type { Pedido } from '../pedidos/TiposPedidos';
import { obtenerReglas } from '../../Sistema/reglas-precios/DatosReglas';
import type { ReglaPrecio } from '../../Sistema/reglas-precios/TiposReglas';
import { obtenerPromoCodes, type PromoCode } from '../../../data/promoCodes';

type CupónRow = {
  codigo: string;
  usos: number;
  generado: number;
  descontado: number;
  estado: boolean;
};

const moneda = (value: number) => `S/ ${value.toFixed(2)}`;
const normalizarCodigo = (value: unknown) => String(value ?? '').trim().toUpperCase();
const isWithinDateRange = (fecha: string, fechaInicio: string, fechaFin: string) => {
  const date = new Date(fecha);
  if (fechaInicio && date < new Date(`${fechaInicio}T00:00:00`)) return false;
  if (fechaFin && date > new Date(`${fechaFin}T23:59:59.999`)) return false;
  return true;
};

export const CuponesAnalyticsPanel = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(obtenerPedidos());
  const [reglas, setReglas] = useState<ReglaPrecio[]>([]);
  const [cupones, setCupones] = useState<PromoCode[]>(() => obtenerPromoCodes());
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    const cargarPedidos = () => setPedidos(obtenerPedidos());
    cargarPedidos();
    setReglas(obtenerReglas());
    const actualizarCupones = () => setCupones(obtenerPromoCodes());
    window.addEventListener('maxeta:promo-codes-changed', actualizarCupones);
    const cancelarPedidos = suscribirsePedidosCambios(() => void cargarPedidos());
    return () => {
      window.removeEventListener('maxeta:promo-codes-changed', actualizarCupones);
      cancelarPedidos();
    };
  }, []);

  const pedidosRango = useMemo(() => pedidos.filter((pedido) => isWithinDateRange(pedido.fechaPedido, fechaInicio, fechaFin)), [pedidos, fechaInicio, fechaFin]);

  const rows = useMemo<CupónRow[]>(() => {
    const configurados = new Map<string, boolean>();
    cupones.forEach((cupon) => configurados.set(normalizarCodigo(cupon.code), cupon.active));
    reglas.forEach((regla) => {
      const codigo = normalizarCodigo(regla.configuracion.cupon);
      if (codigo) configurados.set(codigo, regla.estado);
    });
    pedidos.forEach((pedido) => {
      const codigo = normalizarCodigo(pedido.couponCode ?? pedido.descuentos.find((descuento) => descuento.codigo)?.codigo);
      if (codigo && !configurados.has(codigo)) configurados.set(codigo, true);
    });

    return [...configurados.entries()].filter(([codigo]) => codigo).map(([codigo, estado]) => {
      const usos = pedidosRango.filter((pedido) => pedido.estado !== 'cancelado' && normalizarCodigo(pedido.couponCode ?? pedido.descuentos.find((descuento) => descuento.codigo)?.codigo) === codigo);
      return {
        codigo,
        usos: usos.length,
        generado: Number(usos.reduce((total, pedido) => total + Number(pedido.total ?? 0), 0).toFixed(2)),
        descontado: Number(usos.reduce((total, pedido) => total + Number(pedido.couponDiscountAmount ?? pedido.descuentos.find((descuento) => descuento.codigo)?.monto ?? 0), 0).toFixed(2)),
        estado,
      };
    });
  }, [cupones, pedidos, pedidosRango, reglas]);

  const visibles = rows.filter((row) => row.codigo.toLowerCase().includes(busqueda.toLowerCase()));
  const totalGenerado = visibles.reduce((total, row) => total + row.generado, 0);
  const totalDescontado = visibles.reduce((total, row) => total + row.descontado, 0);

  return ( 
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Ventas</p>
          <h1 className="mt-1 text-2xl font-bold">Cupones</h1>
          <p className="mt-1 text-sm text-zinc-500">Ventas y descuentos de pedidos no cancelados.</p>
        </div>
        <input aria-label="Buscar cupón o regla" className="border border-zinc-300 px-3 py-2 text-sm" placeholder="Buscar cupón o regla..." value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
      </div>
      <div className="grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
        <div className="bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Generado</p>
          <p className="mt-2 text-2xl font-semibold">{moneda(totalGenerado)}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Descontado</p>
          <p className="mt-2 text-2xl font-semibold text-red-700">{moneda(totalDescontado)}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Uso de cupones</p>
          <p className="mt-2 text-2xl font-semibold">{visibles.reduce((total, row) => total + row.usos, 0)}</p>
        </div>
      </div>
      <div className="grid gap-3 border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm text-zinc-600">
          <span className="mb-1 block">Desde</span>
          <input type="date" value={fechaInicio} onChange={(event) => setFechaInicio(event.target.value)} className="w-full border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm text-zinc-600">
          <span className="mb-1 block">Hasta</span>
          <input type="date" value={fechaFin} onChange={(event) => setFechaFin(event.target.value)} className="w-full border border-zinc-300 px-3 py-2" />
        </label>
        <button type="button" onClick={() => { setFechaInicio(''); setFechaFin(''); }} className="border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100">Limpiar</button>
      </div>
      <div className="overflow-x-auto border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-3">Cupón</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3 text-right">Generado</th>
              <th className="px-4 py-3 text-right">Descontado</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  No hay cupones que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              visibles.map((row) => (
                <tr key={row.codigo} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-mono text-xs">{row.codigo}</td>
                  <td className="px-4 py-3">{row.usos}</td>
                  <td className="px-4 py-3 text-right font-medium">{moneda(row.generado)}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-700">{moneda(row.descontado)}</td>
                  <td className="px-4 py-3">{row.estado ? 'Activa' : 'Inactiva'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};