import type { Pedido } from '../TiposPedidos';

export type VentaPorDia = {
  fecha: string;
  label: string;
  ventas: number;
};

const parseDateOnly = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (dateKey: string): string => {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}`;
};

const dateIsWithinRange = (dateKey: string, fechaInicio: string, fechaFin: string): boolean => {
  const inicio = parseDateOnly(fechaInicio);
  const fin = parseDateOnly(fechaFin);
  const current = new Date(`${dateKey}T00:00:00`);

  if (inicio && current < inicio) {
    return false;
  }

  if (fin && current > new Date(`${fechaFin}T23:59:59`)) {
    return false;
  }

  return true;
};

export const buildVentasPorDia = (
  pedidos: Pedido[],
  fechaInicio: string = '',
  fechaFin: string = '',
): VentaPorDia[] => {
  const ventasPorFecha = new Map<string, number>();
  const pedidosValidos = pedidos.filter((pedido) => {
    const fechaPedido = new Date(pedido.fechaPedido);
    return pedido.estado !== 'cancelado' && !Number.isNaN(fechaPedido.getTime());
  });

  if (pedidosValidos.length === 0) {
    if (!fechaInicio && !fechaFin) {
      return [];
    }

    const inicio = parseDateOnly(fechaInicio) ?? parseDateOnly(fechaFin) ?? new Date();
    const fin = parseDateOnly(fechaFin) ?? inicio;
    const cursor = new Date(inicio);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(fin);
    end.setHours(0, 0, 0, 0);

    const rows: VentaPorDia[] = [];
    while (cursor <= end) {
      const dayKey = cursor.toISOString().slice(0, 10);
      rows.push({ fecha: dayKey, label: formatDateLabel(dayKey), ventas: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return rows;
  }

  const fechas = pedidosValidos.map((pedido) => new Date(pedido.fechaPedido)).map((date) => date.toISOString().slice(0, 10));
  const earliest = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : new Date(`${fechas.reduce((a, b) => (a < b ? a : b))}T00:00:00`);
  const latest = fechaFin ? new Date(`${fechaFin}T00:00:00`) : new Date(`${fechas.reduce((a, b) => (a > b ? a : b))}T00:00:00`);

  pedidosValidos.forEach((pedido) => {
    const fechaPedido = new Date(pedido.fechaPedido);
    const dateKey = fechaPedido.toISOString().slice(0, 10);

    if (!dateIsWithinRange(dateKey, fechaInicio, fechaFin)) {
      return;
    }

    ventasPorFecha.set(dateKey, (ventasPorFecha.get(dateKey) ?? 0) + Number(pedido.total ?? 0));
  });

  const startDate = new Date(earliest);
  const endDate = new Date(latest);
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const rows: VentaPorDia[] = [];

  while (cursor <= endDate) {
    const dateKey = cursor.toISOString().slice(0, 10);
    rows.push({
      fecha: dateKey,
      label: formatDateLabel(dateKey),
      ventas: ventasPorFecha.get(dateKey) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return rows;
};
