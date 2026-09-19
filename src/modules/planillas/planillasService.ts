import api from '../../services/api'

import type { Sucursal } from '../sucursales/sucursalesService'

export type EstadoPlanilla = 'BORRADOR' | 'GENERADA' | 'PAGADA'

export interface Planilla {
  id_planilla: number
  id_sucursal: number
  mes: number
  anio: number
  fecha_generacion: string
  total_planilla: number
  estado: EstadoPlanilla
  sucursal: Sucursal
}

export interface CrearPlanilla {
  id_sucursal: number
  mes: number
  anio: number
}

export interface ActualizarPlanilla {
  estado?: EstadoPlanilla
}

export async function obtenerPlanillas(): Promise<Planilla[]> {
  const respuesta = await api.get<Planilla[]>('/planillas')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de planillas.',
    )
  }

  return respuesta.data
}

export async function obtenerPlanilla(id: number): Promise<Planilla> {
  const respuesta = await api.get<Planilla>(`/planillas/${id}`)
  return respuesta.data
}

export async function crearPlanilla(
  datos: CrearPlanilla,
): Promise<Planilla> {
  const respuesta = await api.post<Planilla>('/planillas', datos)
  return respuesta.data
}

export async function actualizarPlanilla(
  id: number,
  datos: ActualizarPlanilla,
): Promise<Planilla> {
  const respuesta = await api.patch<Planilla>(`/planillas/${id}`, datos)
  return respuesta.data
}