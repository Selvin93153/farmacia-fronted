import api from '../../services/api'
import type { Caja } from '../caja/cajasService'

export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO'

export interface UsuarioMovimientoCaja {
  id_usuario: number
  nombre: string
  apellido: string
  correo: string
  rol?: {
    nombre: string
    codigo?: string
  }
}

export interface VentaMovimientoCaja {
  id_venta: number
  forma_pago?: {
    nombre: string
  }
}

export interface MovimientoCaja {
  id_movimiento_caja: number
  id_caja: number
  id_usuario: number
  id_venta: number | null
  tipo_movimiento: TipoMovimientoCaja
  concepto: string
  monto: number
  fecha: string
  caja: Caja
  usuario: UsuarioMovimientoCaja
  venta: VentaMovimientoCaja | null
}

export interface CrearMovimientoCaja {
  id_caja: number
  tipo_movimiento: TipoMovimientoCaja
  concepto: string
  monto: number
}

// Consulta los movimientos de caja para cuentas autorizadas con alcance nacional.
export async function obtenerMovimientosCaja(): Promise<MovimientoCaja[]> {
  const respuesta = await api.get<MovimientoCaja[]>('/movimientos-caja')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend no devolvió una lista de movimientos de caja.')
  }

  return respuesta.data
}

// Consulta exclusivamente movimientos de las cajas de la sucursal autenticada.
export async function obtenerMovimientosCajaMiSucursal(): Promise<MovimientoCaja[]> {
  const respuesta = await api.get<MovimientoCaja[]>('/movimientos-caja/mi-sucursal')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend no devolvió una lista de movimientos de caja.')
  }

  return respuesta.data
}

// Consulta el detalle completo de un movimiento de caja.
export async function obtenerMovimientoCaja(id: number): Promise<MovimientoCaja> {
  const respuesta = await api.get<MovimientoCaja>(`/movimientos-caja/${id}`)
  return respuesta.data
}

// Registra únicamente ingresos o egresos manuales; el backend asigna el usuario.
export async function crearMovimientoCaja(datos: CrearMovimientoCaja): Promise<MovimientoCaja> {
  const respuesta = await api.post<MovimientoCaja>('/movimientos-caja', datos)
  return respuesta.data
}
