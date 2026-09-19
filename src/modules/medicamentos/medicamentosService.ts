import api from '../../services/api'

export interface Medicamento {
  id_medicamento: number
  codigo: string
  nombre: string
  principio_activo: string
  concentracion: string
  presentacion: string
  laboratorio: string
  precio_venta: number
  requiere_receta: boolean
  estado: string
  fecha_creacion: string
}

export interface CrearMedicamento {
  codigo: string
  nombre: string
  principio_activo: string
  concentracion: string
  presentacion: string
  laboratorio: string
  precio_venta: number
  requiere_receta: boolean
}

export interface ActualizarMedicamento extends Partial<CrearMedicamento> {
  estado?: 'ACTIVO' | 'INACTIVO'
}

export async function obtenerMedicamentos(): Promise<Medicamento[]> {
  const respuesta = await api.get<Medicamento[]>('/medicamentos')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de medicamentos.',
    )
  }

  return respuesta.data
}

export async function obtenerMedicamento(id: number): Promise<Medicamento> {
  const respuesta = await api.get<Medicamento>(`/medicamentos/${id}`)
  return respuesta.data
}

export async function crearMedicamento(
  datos: CrearMedicamento,
): Promise<Medicamento> {
  const respuesta = await api.post<Medicamento>('/medicamentos', datos)
  return respuesta.data
}

export async function actualizarMedicamento(
  id: number,
  datos: ActualizarMedicamento,
): Promise<Medicamento> {
  const respuesta = await api.patch<Medicamento>(
    `/medicamentos/${id}`,
    datos,
  )

  return respuesta.data
}