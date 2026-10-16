import api from '../../services/api'

export type EstadoEntrega = 'PENDIENTE' | 'ASIGNADA' | 'EN_RUTA' | 'ENTREGADA'

export interface DepartamentoEntrega {
  id_departamento?: number
  nombre: string
}

export interface MunicipioEntrega {
  id_municipio?: number
  nombre: string
  departamento?: DepartamentoEntrega
}

export interface SucursalEntrega {
  id_sucursal: number
  codigo: string
  nombre: string
  direccion: string
  latitud?: string
  longitud?: string
  municipio?: MunicipioEntrega
}

export interface ClienteEntrega {
  id_cliente: number
  nombres: string
  apellidos: string | null
  telefono: string
  correo: string | null
}

export interface FormaPagoEntrega {
  id_forma_pago?: number
  nombre: string
}

export interface RolRepartidor {
  id?: number
  codigo?: string
  nombre: string
}

export interface RepartidorEntrega {
  id_usuario: number
  id_sucursal: number | null
  nombre: string
  apellido: string
  correo: string
  telefono: string
  estado: string
  rol?: RolRepartidor
  sucursal?: SucursalEntrega | null
}

export interface PedidoEntrega {
  id_pedido: number
  id_cliente: number
  id_sucursal_asignada: number | null
  id_forma_pago: number | null
  id_usuario_registra: number | null
  fecha: string
  direccion_entrega: string
  latitud_entrega: string
  longitud_entrega: string
  canal: string
  total: number
  estado: string
  cliente: ClienteEntrega
  sucursal_asignada: SucursalEntrega | null
  forma_pago: FormaPagoEntrega | null
}

export interface Entrega {
  id_entrega: number
  id_pedido: number
  id_repartidor: number | null
  fecha_asignacion: string | null
  fecha_salida: string | null
  fecha_entrega: string | null
  tiempo_estimado_min: number
  estado: EstadoEntrega
  observaciones: string | null
  pedido: PedidoEntrega
  repartidor: RepartidorEntrega | null
}

export interface MedicamentoDetallePedido {
  id_medicamento: number
  codigo?: string
  nombre: string
  principio_activo?: string
  concentracion?: string
  presentacion?: string
}

export interface DetallePedidoEntrega {
  id_detalle_pedido: number
  id_pedido: number
  id_medicamento: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  medicamento: MedicamentoDetallePedido
}

export interface CrearEntrega {
  id_pedido: number
}

export interface ActualizarEntrega {
  observaciones?: string
}

export interface AsignarRepartidor {
  id_repartidor: number
}

// Obtiene todas las entregas registradas con sus relaciones principales.
export async function obtenerEntregas(): Promise<Entrega[]> {
  const respuesta = await api.get<Entrega[]>('/entregas')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend no devolvió una lista de entregas.')
  }

  return respuesta.data
}

// Obtiene una entrega específica.
export async function obtenerEntrega(idEntrega: number): Promise<Entrega> {
  const respuesta = await api.get<Entrega>(`/entregas/${idEntrega}`)
  return respuesta.data
}

// Crea una entrega para un pedido confirmado y descuenta su inventario.
export async function crearEntrega(datos: CrearEntrega): Promise<Entrega> {
  const respuesta = await api.post<Entrega>('/entregas', datos)
  return respuesta.data
}

// Actualiza las observaciones de una entrega no completada.
export async function actualizarEntrega(
  idEntrega: number,
  datos: ActualizarEntrega,
): Promise<Entrega> {
  const respuesta = await api.patch<Entrega>(`/entregas/${idEntrega}`, datos)
  return respuesta.data
}

// Asigna o cambia el repartidor antes de iniciar el recorrido.
export async function asignarRepartidor(
  idEntrega: number,
  datos: AsignarRepartidor,
): Promise<Entrega> {
  const respuesta = await api.patch<Entrega>(
    `/entregas/${idEntrega}/asignar-repartidor`,
    datos,
  )
  return respuesta.data
}

// Inicia el recorrido de una entrega previamente asignada.
export async function iniciarEntrega(idEntrega: number): Promise<Entrega> {
  const respuesta = await api.patch<Entrega>(`/entregas/${idEntrega}/iniciar`)
  return respuesta.data
}

// Completa una entrega en ruta.
export async function completarEntrega(idEntrega: number): Promise<Entrega> {
  const respuesta = await api.patch<Entrega>(`/entregas/${idEntrega}/completar`)
  return respuesta.data
}

// Obtiene los pedidos para identificar cuáles están listos para crear una entrega.
export async function obtenerPedidosParaEntrega(): Promise<PedidoEntrega[]> {
  const respuesta = await api.get<PedidoEntrega[]>('/pedidos')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend no devolvió una lista de pedidos.')
  }

  return respuesta.data
}

// Obtiene los medicamentos asociados al pedido mostrado en el detalle.
export async function obtenerDetallesPedido(
  idPedido: number,
): Promise<DetallePedidoEntrega[]> {
  const respuesta = await api.get<DetallePedidoEntrega[]>(
    `/detalles-pedido/pedido/${idPedido}`,
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend no devolvió los detalles del pedido.')
  }

  return respuesta.data
}
