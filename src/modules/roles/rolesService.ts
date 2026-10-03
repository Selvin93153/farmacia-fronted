import api from '../../services/api'

export interface Rol {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  activo: boolean
  creado_en: string
  actualizado_en: string
}

// Obtiene los roles registrados en el sistema.
export async function obtenerRoles(): Promise<Rol[]> {
  const respuesta = await api.get<Rol[]>('/roles')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('La respuesta de roles no tiene el formato esperado.')
  }

  return respuesta.data
}