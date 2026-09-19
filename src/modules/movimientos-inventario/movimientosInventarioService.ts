import api from '../../services/api'

import type { Inventario } from '../inventarios/inventariosService'

export type TipoMovimiento = 'ENTRADA' | 'SALIDA'

export type MotivoMovimiento =
  | 'COMPRA'
  | 'VENTA'
  | 'TRASLADO'
  | 'AJUSTE'
  | 'DEVOLUCION'

export interface RolMovimiento {
  id_rol?: number
  nombre: string
  descripcion?: string
}

export interface UsuarioMovimiento {
  id_usuario: number
  nombre: string
  apellido: string
  correo: string
  rol?: RolMovimiento
}

export interface MovimientoInventario {
  id_movimiento: number
  id_inventario: number
  id_usuario: number
  tipo_movimiento: TipoMovimiento
  motivo: MotivoMovimiento
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  referencia: string | null
  observacion: string | null
  fecha: string
  inventario: Inventario
  usuario: UsuarioMovimiento
}

export interface CrearMovimientoInventario {
  id_inventario: number
  tipo_movimiento: TipoMovimiento
  motivo: MotivoMovimiento
  cantidad: number
  referencia?: string
  observacion?: string
}

export async function obtenerMovimientosInventario(): Promise<
  MovimientoInventario[]
> {
  const respuesta = await api.get<MovimientoInventario[]>(
    '/movimientos-inventario',
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de movimientos.',
    )
  }

  return respuesta.data
}

export async function obtenerMovimientoInventario(
  id: number,
): Promise<MovimientoInventario> {
  const respuesta = await api.get<MovimientoInventario>(
    `/movimientos-inventario/${id}`,
  )

  return respuesta.data
}

export async function crearMovimientoInventario(
  datos: CrearMovimientoInventario,
): Promise<MovimientoInventario> {
  const respuesta = await api.post<MovimientoInventario>(
    '/movimientos-inventario',
    datos,
  )

  return respuesta.data
}