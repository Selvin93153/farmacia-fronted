import api from '../../services/api'

import type { Medicamento } from '../medicamentos/medicamentosService'

export interface DetalleVenta {
  id_detalle_venta: number
  id_venta: number
  id_medicamento: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  medicamento: Medicamento
}

export interface CrearDetalleVenta {
  id_venta: number
  id_medicamento: number
  cantidad: number
}

export interface ActualizarDetalleVenta {
  cantidad: number
}

// Obtiene únicamente los medicamentos correspondientes a una venta.
export async function obtenerDetallesDeVenta(
  idVenta: number,
): Promise<DetalleVenta[]> {
  const respuesta = await api.get<DetalleVenta[]>(
    `/ventas/${idVenta}/detalles`,
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió los detalles de la venta.',
    )
  }

  return respuesta.data
}

// Agrega un medicamento a una venta en estado BORRADOR.
export async function crearDetalleVenta(
  datos: CrearDetalleVenta,
): Promise<DetalleVenta> {
  const respuesta = await api.post<DetalleVenta>(
    '/detalles-venta',
    datos,
  )

  return respuesta.data
}

// Modifica la cantidad de un medicamento agregado a la venta.
export async function actualizarDetalleVenta(
  id: number,
  datos: ActualizarDetalleVenta,
): Promise<DetalleVenta> {
  const respuesta = await api.patch<DetalleVenta>(
    `/detalles-venta/${id}`,
    datos,
  )

  return respuesta.data
}

// Retira un medicamento de una venta mientras permanezca en BORRADOR.
export async function eliminarDetalleVenta(id: number): Promise<void> {
  await api.delete(`/detalles-venta/${id}`)
}