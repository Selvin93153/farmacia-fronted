import api from '../../services/api'

import type { Medicamento } from '../medicamentos/medicamentosService'
import type { Sucursal } from '../sucursales/sucursalesService'

export interface Inventario {
  id_inventario: number
  id_sucursal: number
  id_medicamento: number
  stock_actual: number
  stock_minimo: number
  fecha_actualizacion: string
  sucursal: Sucursal
  medicamento: Medicamento
}

export interface CrearInventario {
  id_sucursal: number
  id_medicamento: number
  stock_actual?: number
  stock_minimo: number
}

export interface ActualizarInventario {
  stock_minimo?: number
}

export async function obtenerInventarios(): Promise<Inventario[]> {
  const respuesta = await api.get<Inventario[]>('/inventarios')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de inventarios.',
    )
  }

  return respuesta.data
}

export async function obtenerInventario(id: number): Promise<Inventario> {
  const respuesta = await api.get<Inventario>(`/inventarios/${id}`)
  return respuesta.data
}

export async function crearInventario(
  datos: CrearInventario,
): Promise<Inventario> {
  const respuesta = await api.post<Inventario>('/inventarios', datos)
  return respuesta.data
}

export async function actualizarInventario(
  id: number,
  datos: ActualizarInventario,
): Promise<Inventario> {
  const respuesta = await api.patch<Inventario>(`/inventarios/${id}`, datos)
  return respuesta.data
}