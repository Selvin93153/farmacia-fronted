import axios from 'axios'

import api from '../../services/api'

export type EstadoTraslado =
  | 'SOLICITADO'
  | 'ENVIADO'
  | 'RECIBIDO'
  | 'CANCELADO'

export interface DepartamentoTraslado {
  id_departamento?: number
  nombre: string
}

export interface MunicipioTraslado {
  id_municipio?: number
  nombre: string
  departamento?: DepartamentoTraslado
}

export interface SucursalTraslado {
  id_sucursal: number
  codigo: string
  nombre: string
  direccion?: string
  estado?: string
  municipio?: MunicipioTraslado
}

export interface RolTraslado {
  codigo?: string
  nombre?: string
}

export interface UsuarioTraslado {
  id_usuario: number
  nombre: string
  apellido: string
  correo?: string
  rol?: RolTraslado
}

export interface MedicamentoTraslado {
  id_medicamento: number
  codigo: string
  nombre: string
  principio_activo?: string
  concentracion?: string
  presentacion?: string
  laboratorio?: string
  precio_venta?: number
  estado: string
}

export interface DetalleTraslado {
  id_detalle_traslado: number
  id_traslado: number
  id_medicamento: number
  cantidad_solicitada: number
  cantidad_enviada: number | null
  cantidad_recibida: number | null
  medicamento: MedicamentoTraslado
}

export interface Traslado {
  id_traslado: number
  id_sucursal_origen: number
  id_sucursal_destino: number
  id_usuario_solicita: number
  id_usuario_envia: number | null
  id_usuario_recibe: number | null
  fecha_solicitud: string
  fecha_envio: string | null
  fecha_recepcion: string | null
  estado: EstadoTraslado
  observaciones: string | null
  sucursal_origen: SucursalTraslado
  sucursal_destino: SucursalTraslado
  usuario_solicita: UsuarioTraslado
  usuario_envia: UsuarioTraslado | null
  usuario_recibe: UsuarioTraslado | null
  detalles: DetalleTraslado[]
}

export interface CrearTraslado {
  id_sucursal_destino: number
  observaciones?: string
}

export interface ActualizarTraslado {
  id_sucursal_destino?: number
  observaciones?: string
}

export interface EnviarDetalleTraslado {
  id_detalle_traslado: number
  cantidad_enviada: number
}

export interface RecibirDetalleTraslado {
  id_detalle_traslado: number
  cantidad_recibida: number
}

export function obtenerMensajeError(
  error: unknown,
  predeterminado: string,
): string {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message

    if (Array.isArray(mensaje)) {
      return mensaje.join(', ')
    }

    if (typeof mensaje === 'string') {
      return mensaje
    }

    if (error.response) {
      return `El backend respondió con error HTTP ${error.response.status}.`
    }

    return 'No se pudo establecer comunicación con el servidor.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return predeterminado
}

// Obtiene todos los traslados registrados.
export async function obtenerTraslados(): Promise<Traslado[]> {
  const respuesta = await api.get<Traslado[]>('/traslados')
  return Array.isArray(respuesta.data) ? respuesta.data : []
}

// Obtiene un traslado específico.
export async function obtenerTraslado(id: number): Promise<Traslado> {
  const respuesta = await api.get<Traslado>(`/traslados/${id}`)
  return respuesta.data
}

// Crea un traslado usando la sucursal del usuario autenticado como origen.
export async function crearTraslado(
  datos: CrearTraslado,
): Promise<Traslado> {
  const respuesta = await api.post<Traslado>('/traslados', datos)
  return respuesta.data
}

// Modifica destino u observaciones mientras el traslado está solicitado.
export async function actualizarTraslado(
  id: number,
  datos: ActualizarTraslado,
): Promise<Traslado> {
  const respuesta = await api.patch<Traslado>(
    `/traslados/${id}`,
    datos,
  )
  return respuesta.data
}

// Cancela un traslado solicitado.
export async function cancelarTraslado(
  id: number,
): Promise<Traslado> {
  const respuesta = await api.patch<Traslado>(
    `/traslados/${id}/cancelar`,
  )
  return respuesta.data
}

// Envía el traslado y descuenta inventario de la sucursal origen.
export async function enviarTraslado(
  id: number,
  detalles: EnviarDetalleTraslado[],
): Promise<Traslado> {
  const respuesta = await api.patch<Traslado>(
    `/traslados/${id}/enviar`,
    { detalles },
  )
  return respuesta.data
}

// Recibe el traslado y aumenta inventario de la sucursal destino.
export async function recibirTraslado(
  id: number,
  detalles: RecibirDetalleTraslado[],
): Promise<Traslado> {
  const respuesta = await api.patch<Traslado>(
    `/traslados/${id}/recibir`,
    { detalles },
  )
  return respuesta.data
}

// Obtiene los medicamentos de un traslado.
export async function obtenerDetallesTraslado(
  idTraslado: number,
): Promise<DetalleTraslado[]> {
  const respuesta = await api.get<DetalleTraslado[]>(
    `/detalles-traslado/traslado/${idTraslado}`,
  )
  return Array.isArray(respuesta.data) ? respuesta.data : []
}

// Agrega un medicamento a un traslado solicitado.
export async function agregarDetalleTraslado(
  idTraslado: number,
  idMedicamento: number,
  cantidadSolicitada: number,
): Promise<DetalleTraslado> {
  const respuesta = await api.post<DetalleTraslado>(
    '/detalles-traslado',
    {
      id_traslado: idTraslado,
      id_medicamento: idMedicamento,
      cantidad_solicitada: cantidadSolicitada,
    },
  )
  return respuesta.data
}

// Modifica la cantidad solicitada de un medicamento.
export async function actualizarDetalleTraslado(
  idDetalle: number,
  cantidadSolicitada: number,
): Promise<DetalleTraslado> {
  const respuesta = await api.patch<DetalleTraslado>(
    `/detalles-traslado/${idDetalle}`,
    {
      cantidad_solicitada: cantidadSolicitada,
    },
  )
  return respuesta.data
}

// Elimina un medicamento de un traslado solicitado.
export async function eliminarDetalleTraslado(
  idDetalle: number,
): Promise<void> {
  await api.delete(`/detalles-traslado/${idDetalle}`)
}

// Catálogo de sucursales para seleccionar el destino.
export async function obtenerSucursalesTraslado(): Promise<
  SucursalTraslado[]
> {
  const respuesta = await api.get<SucursalTraslado[]>('/sucursales')
  return Array.isArray(respuesta.data) ? respuesta.data : []
}

// Catálogo de medicamentos para preparar el traslado.
export async function obtenerMedicamentosTraslado(): Promise<
  MedicamentoTraslado[]
> {
  const respuesta = await api.get<MedicamentoTraslado[]>(
    '/medicamentos',
  )
  return Array.isArray(respuesta.data) ? respuesta.data : []
}
