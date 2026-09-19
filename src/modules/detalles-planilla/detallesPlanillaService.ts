import api from '../../services/api'

import type { Empleado } from '../empleados/empleadosService'
import type { Planilla } from '../planillas/planillasService'

export interface DetallePlanilla {
  id_detalle_planilla: number
  id_planilla: number
  id_empleado: number
  salario_base: number
  bonificaciones: number
  descuentos: number
  total_pagado: number
  planilla: Planilla
  empleado: Empleado
}

export interface CrearDetallePlanilla {
  id_planilla: number
  id_empleado: number
  bonificaciones?: number
  descuentos?: number
}

export interface ActualizarDetallePlanilla {
  bonificaciones?: number
  descuentos?: number
}

export async function obtenerDetallesPlanilla(): Promise<DetallePlanilla[]> {
  const respuesta = await api.get<DetallePlanilla[]>('/detalles-planilla')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de detalles de planilla.',
    )
  }

  return respuesta.data
}

export async function obtenerDetallePlanilla(
  id: number,
): Promise<DetallePlanilla> {
  const respuesta = await api.get<DetallePlanilla>(
    `/detalles-planilla/${id}`,
  )

  return respuesta.data
}

export async function crearDetallePlanilla(
  datos: CrearDetallePlanilla,
): Promise<DetallePlanilla> {
  const respuesta = await api.post<DetallePlanilla>(
    '/detalles-planilla',
    datos,
  )

  return respuesta.data
}

export async function actualizarDetallePlanilla(
  id: number,
  datos: ActualizarDetallePlanilla,
): Promise<DetallePlanilla> {
  const respuesta = await api.patch<DetallePlanilla>(
    `/detalles-planilla/${id}`,
    datos,
  )

  return respuesta.data
}