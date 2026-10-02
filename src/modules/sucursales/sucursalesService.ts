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

export interface CrearSucursal {
  id_municipio: number
  codigo: string
  nombre: string
  tipo_sucursal: 'FARMACIA' | 'STAND'
  direccion: string
  latitud: string
  longitud: string
  telefono: string
}

// Obtiene todas las sucursales registradas.
export async function obtenerSucursales(): Promise<Sucursal[]> {
  const respuesta = await api.get<Sucursal[]>('/sucursales')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de sucursales.',
    )
  }

  return respuesta.data
}

// Registra una nueva sucursal en el sistema.
export async function crearSucursal(
  datos: CrearSucursal,
): Promise<Sucursal> {
  const respuesta = await api.post<Sucursal>(
    '/sucursales',
    datos,
  )

  return respuesta.data
}

export interface ActualizarSucursal {
  id_municipio?: number
  codigo?: string
  nombre?: string
  tipo_sucursal?: 'FARMACIA' | 'STAND'
  direccion?: string
  latitud?: string
  longitud?: string
  telefono?: string
  estado?: 'ACTIVA' | 'INACTIVA'
}

// Actualiza los datos de una sucursal existente.
export async function actualizarSucursal(
  id: number,
  datos: ActualizarSucursal,
): Promise<Sucursal> {
  const respuesta = await api.patch<Sucursal>(
    `/sucursales/${id}`,
    datos,
  )

  return respuesta.data
}