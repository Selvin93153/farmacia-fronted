import api from '../../services/api'

export type EstadoPedido =
  | 'BORRADOR'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'EN_ENTREGA'
  | 'ENTREGADO'

export type CanalPedido = 'CALL_CENTER' | 'PORTAL_WEB' | 'TELEFONO'

export interface ClientePedido {
  id_cliente: number
  nombres: string
  apellidos: string | null
  telefono: string
  correo: string | null
}

export interface FormaPagoPedido {
  id_forma_pago: number
  nombre: string
  estado?: string
}

export interface DepartamentoPedido {
  id_departamento?: number
  nombre: string
}

export interface MunicipioPedido {
  id_municipio?: number
  nombre: string
  departamento?: DepartamentoPedido
}

export interface SucursalPedido {
  id_sucursal: number
  codigo: string
  nombre: string
  tipo_sucursal?: string
  direccion: string
  municipio?: MunicipioPedido
}

export interface UsuarioRegistraPedido {
  id_usuario: number
  nombre: string
  apellido: string
}

export interface Pedido {
  id_pedido: number
  id_cliente: number
  id_sucursal_origen: number | null
  id_sucursal_asignada: number | null
  id_forma_pago: number | null
  id_usuario_registra: number | null
  fecha: string
  direccion_entrega: string
  latitud_entrega: string
  longitud_entrega: string
  canal: CanalPedido | string
  total: number
  estado: EstadoPedido | string
  cliente: ClientePedido
  sucursal_origen: SucursalPedido | null
  sucursal_asignada: SucursalPedido | null
  forma_pago: FormaPagoPedido | null
  usuario_registra?: UsuarioRegistraPedido | null
}

export interface MedicamentoPedido {
  id_medicamento: number
  codigo: string
  nombre: string
  principio_activo?: string
  concentracion?: string
  presentacion?: string
  laboratorio?: string
  precio_venta: number
  requiere_receta?: boolean
  estado: string
}

export interface DetallePedido {
  id_detalle_pedido: number
  id_pedido: number
  id_medicamento: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  medicamento: MedicamentoPedido
}

export interface SucursalDisponible {
  id_sucursal: number
  codigo: string
  nombre: string
  tipo_sucursal: string
  direccion: string
  municipio: string
  departamento: string
  distancia_km: number
  tiempo_estimado_min: number
}

export interface CrearPedido {
  id_cliente: number
  id_forma_pago?: number
  direccion_entrega: string
  latitud_entrega: string
  longitud_entrega: string
  canal: CanalPedido
}

export interface ActualizarPedido {
  id_cliente?: number
  id_forma_pago?: number
  direccion_entrega?: string
  latitud_entrega?: string
  longitud_entrega?: string
  canal?: CanalPedido
}

export interface CrearClientePedido {
  nombres: string
  apellidos?: string
  telefono: string
  correo?: string
}

// Obtiene todos los pedidos con sus relaciones principales.
export async function obtenerPedidos(): Promise<Pedido[]> {
  const respuesta = await api.get<Pedido[]>('/pedidos')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend no devolvió una lista de pedidos.')
  }

  return respuesta.data
}

// Obtiene únicamente los pedidos registrados desde la sucursal del usuario autenticado.
export async function obtenerPedidosMiSucursal(): Promise<Pedido[]> {
  const respuesta = await api.get<Pedido[]>('/pedidos/mi-sucursal')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend no devolvió una lista de pedidos de la sucursal.',
    )
  }

  return respuesta.data
}

// Registra un pedido nuevo en estado BORRADOR.
export async function crearPedido(
  datos: CrearPedido,
): Promise<Pedido> {
  const respuesta = await api.post<Pedido>('/pedidos', datos)

  return respuesta.data
}

// Actualiza un pedido mientras permanezca en BORRADOR.
export async function actualizarPedido(
  idPedido: number,
  datos: ActualizarPedido,
): Promise<Pedido> {
  const respuesta = await api.patch<Pedido>(
    `/pedidos/${idPedido}`,
    datos,
  )

  return respuesta.data
}

// Elimina un pedido mientras permanezca en BORRADOR.
export async function eliminarPedido(
  idPedido: number,
): Promise<void> {
  await api.delete(`/pedidos/${idPedido}`)
}

// Obtiene los medicamentos agregados a un pedido.
export async function obtenerDetallesPedido(
  idPedido: number,
): Promise<DetallePedido[]> {
  const respuesta = await api.get<DetallePedido[]>(
    `/detalles-pedido/pedido/${idPedido}`,
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend no devolvió los detalles del pedido.',
    )
  }

  return respuesta.data
}

// Agrega un medicamento a un pedido en BORRADOR.
export async function agregarDetallePedido(
  idPedido: number,
  idMedicamento: number,
  cantidad: number,
): Promise<DetallePedido> {
  const respuesta = await api.post<DetallePedido>(
    '/detalles-pedido',
    {
      id_pedido: idPedido,
      id_medicamento: idMedicamento,
      cantidad,
    },
  )

  return respuesta.data
}

// Modifica la cantidad de un medicamento del pedido.
export async function actualizarDetallePedido(
  idDetallePedido: number,
  cantidad: number,
): Promise<DetallePedido> {
  const respuesta = await api.patch<DetallePedido>(
    `/detalles-pedido/${idDetallePedido}`,
    {
      cantidad,
    },
  )

  return respuesta.data
}

// Elimina un medicamento del pedido en BORRADOR.
export async function eliminarDetallePedido(
  idDetallePedido: number,
): Promise<void> {
  await api.delete(`/detalles-pedido/${idDetallePedido}`)
}

// Busca sucursales capaces de surtir completamente el pedido.
export async function obtenerSucursalesDisponibles(
  idPedido: number,
): Promise<SucursalDisponible[]> {
  const respuesta = await api.get<SucursalDisponible[]>(
    `/pedidos/${idPedido}/sucursales-disponibles`,
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend no devolvió las sucursales disponibles.',
    )
  }

  return respuesta.data
}

// Asigna la sucursal seleccionada y confirma el pedido.
export async function asignarSucursalPedido(
  idPedido: number,
  idSucursal: number,
): Promise<Pedido> {
  const respuesta = await api.patch<Pedido>(
    `/pedidos/${idPedido}/asignar-sucursal`,
    {
      id_sucursal: idSucursal,
    },
  )

  return respuesta.data
}

// Obtiene los clientes disponibles para registrar un pedido.
export async function obtenerClientesPedido(): Promise<
  ClientePedido[]
> {
  const respuesta = await api.get<ClientePedido[]>('/clientes')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend no devolvió una lista de clientes.',
    )
  }

  return respuesta.data
}

// Registra un cliente sin abandonar el flujo de creación del pedido.
export async function crearClientePedido(
  datos: CrearClientePedido,
): Promise<ClientePedido> {
  const respuesta = await api.post<ClientePedido>(
    '/clientes',
    datos,
  )

  return respuesta.data
}

// Obtiene las formas de pago configuradas.
export async function obtenerFormasPagoPedido(): Promise<
  FormaPagoPedido[]
> {
  const respuesta = await api.get<FormaPagoPedido[]>(
    '/formas-pago',
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend no devolvió las formas de pago.',
    )
  }

  return respuesta.data
}

// Obtiene los medicamentos disponibles para agregarlos al pedido.
export async function obtenerMedicamentosPedido(): Promise<
  MedicamentoPedido[]
> {
  const respuesta = await api.get<MedicamentoPedido[]>(
    '/medicamentos',
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend no devolvió una lista de medicamentos.',
    )
  }

  return respuesta.data
}