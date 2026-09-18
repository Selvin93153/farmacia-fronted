import api from '../../services/api'

export interface Sucursal {
  id_sucursal: number
  id_municipio: number
  codigo: string
  nombre: string
  tipo_sucursal: string
  direccion: string
  latitud: string
  longitud: string
  telefono: string
  estado: string
  fecha_creacion: string
}

export async function obtenerSucursales(): Promise<Sucursal[]> {
  const respuesta = await api.get<Sucursal[]>('/sucursales')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de sucursales.',
    )
  }

  return respuesta.data
}