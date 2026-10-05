import api from '../../services/api'

export type EstadoVenta = 'BORRADOR' | 'COMPLETADA'

export interface DepartamentoVenta {
  id_departamento: number
  nombre: string
  estado: string
}

export interface MunicipioVenta {
  id_municipio: number
  id_departamento: number
  nombre: string
  estado: string
  departamento: DepartamentoVenta
}

export interface SucursalVenta {
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
  municipio: MunicipioVenta
}

export interface CajaVenta {
  id_caja: number
  id_sucursal: number
  nombre: string
  estado: string
}

export interface RolVenta {
  id: number
  codigo?: string
  nombre: string
  descripcion: string
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface UsuarioVenta {
  id_usuario: number
  id_rol: number
  id_sucursal: number | null
  nombre: string
  apellido: string
  correo: string
  telefono: string
  estado: string
  fecha_creacion: string
  rol: RolVenta
}

export interface FormaPagoVenta {
  id_forma_pago: number
  nombre: string
  estado: string
}

export interface Venta {
  id_venta: number
  id_sucursal: number
  id_caja: number
  id_usuario: number
  id_forma_pago: number
  fecha: string
  subtotal: number
  descuento: number
  total: number
  estado: EstadoVenta
  sucursal: SucursalVenta
  caja: CajaVenta
  usuario: UsuarioVenta
  forma_pago: FormaPagoVenta
}

export interface CrearVenta {
  id_caja: number
  id_forma_pago: number
}

export interface ActualizarVenta {
  id_forma_pago?: number
  descuento?: number
}

// Obtiene todas las ventas para una sesión con alcance general.
export async function obtenerVentas(): Promise<Venta[]> {
  const respuesta = await api.get<Venta[]>('/ventas')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend respondió, pero no devolvió una lista de ventas.')
  }

  return respuesta.data
}

// Obtiene únicamente las ventas de la sucursal asociada a la sesión.
export async function obtenerVentasMiSucursal(): Promise<Venta[]> {
  const respuesta = await api.get<Venta[]>('/ventas/mi-sucursal')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend respondió, pero no devolvió una lista de ventas.')
  }

  return respuesta.data
}

// Obtiene una venta específica con su información general.
export async function obtenerVenta(id: number): Promise<Venta> {
  const respuesta = await api.get<Venta>(`/ventas/${id}`)
  return respuesta.data
}

// Crea una nueva venta en estado BORRADOR.
export async function crearVenta(datos: CrearVenta): Promise<Venta> {
  const respuesta = await api.post<Venta>('/ventas', datos)
  return respuesta.data
}

// Modifica los datos permitidos de una venta en estado BORRADOR.
export async function actualizarVenta(
  id: number,
  datos: ActualizarVenta,
): Promise<Venta> {
  const respuesta = await api.patch<Venta>(`/ventas/${id}`, datos)
  return respuesta.data
}

// Finaliza la venta y ejecuta el proceso de inventario y caja en el backend.
export async function finalizarVenta(id: number): Promise<Venta> {
  const respuesta = await api.post<Venta>(`/ventas/${id}/finalizar`)
  return respuesta.data
}

// Cancela una venta que todavía se encuentra en estado BORRADOR.
export async function cancelarVenta(id: number): Promise<void> {
  await api.delete(`/ventas/${id}`)
}
