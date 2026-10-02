import api from '../../services/api'

import type { Sucursal } from '../sucursales/sucursalesService'

export type EstadoCaja = 'ACTIVA' | 'INACTIVA'

export interface DepartamentoCaja {
  id_departamento?: number
  nombre: string
}

export interface MunicipioCaja {
  id_municipio?: number
  nombre: string
  departamento?: DepartamentoCaja
}

export interface SucursalCaja extends Sucursal {
  municipio?: MunicipioCaja
}

export interface Caja {
  id_caja: number
  id_sucursal: number
  nombre: string
  estado: EstadoCaja
  sucursal: SucursalCaja
}

export interface CrearCaja {
  id_sucursal: number
  nombre: string
}

export interface ActualizarCaja {
  nombre?: string
  estado?: EstadoCaja
}

// Obtiene todas las cajas junto con la información relacionada de su sucursal.
export async function obtenerCajas(): Promise<Caja[]> {
  const respuesta = await api.get<Caja[]>('/cajas')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de cajas.',
    )
  }

  return respuesta.data
}

export async function obtenerCaja(id: number): Promise<Caja> {
  const respuesta = await api.get<Caja>(`/cajas/${id}`)
  return respuesta.data
}

export async function crearCaja(datos: CrearCaja): Promise<Caja> {
  const respuesta = await api.post<Caja>('/cajas', datos)
  return respuesta.data
}

export async function actualizarCaja(
  id: number,
  datos: ActualizarCaja,
): Promise<Caja> {
  const respuesta = await api.patch<Caja>(`/cajas/${id}`, datos)
  return respuesta.data
}