import api from '../../services/api'

import type { Sucursal } from '../sucursales/sucursalesService'

export type EstadoActivoFijo = 'ACTIVO' | 'MANTENIMIENTO' | 'BAJA'

export interface ActivoFijo {
  id_activo: number
  id_sucursal: number
  codigo: string
  descripcion: string
  categoria: string
  fecha_adquisicion: string
  valor_adquisicion: number
  valor_actual: number
  estado: EstadoActivoFijo
  sucursal: Sucursal
}

export interface CrearActivoFijo {
  id_sucursal: number
  codigo: string
  descripcion: string
  categoria: string
  fecha_adquisicion: string
  valor_adquisicion: number
}

export interface ActualizarActivoFijo {
  codigo?: string
  descripcion?: string
  categoria?: string
  fecha_adquisicion?: string
  valor_actual?: number
  estado?: EstadoActivoFijo
}

// Consulta todos los activos fijos para usuarios con alcance general.
export async function obtenerActivosFijos(): Promise<ActivoFijo[]> {
  const respuesta = await api.get<ActivoFijo[]>('/activos-fijos')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de activos fijos.',
    )
  }

  return respuesta.data
}

// Consulta únicamente los activos de la sucursal del usuario autenticado.
export async function obtenerActivosFijosMiSucursal(): Promise<ActivoFijo[]> {
  const respuesta = await api.get<ActivoFijo[]>('/activos-fijos/mi-sucursal')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de activos fijos.',
    )
  }

  return respuesta.data
}

export async function obtenerActivoFijo(id: number): Promise<ActivoFijo> {
  const respuesta = await api.get<ActivoFijo>(`/activos-fijos/${id}`)
  return respuesta.data
}

export async function crearActivoFijo(
  datos: CrearActivoFijo,
): Promise<ActivoFijo> {
  const respuesta = await api.post<ActivoFijo>('/activos-fijos', datos)
  return respuesta.data
}

export async function actualizarActivoFijo(
  id: number,
  datos: ActualizarActivoFijo,
): Promise<ActivoFijo> {
  const respuesta = await api.patch<ActivoFijo>(`/activos-fijos/${id}`, datos)
  return respuesta.data
}
