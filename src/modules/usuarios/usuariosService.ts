import api from '../../services/api'

export interface DepartamentoUsuario {
  id_departamento: number
  nombre: string
  estado: string
}

export interface MunicipioUsuario {
  id_municipio: number
  id_departamento: number
  nombre: string
  estado: string
  departamento: DepartamentoUsuario
}

export interface SucursalUsuario {
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
  municipio: MunicipioUsuario
}

export interface RolUsuario {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  activo: boolean
  creado_en: string
  actualizado_en: string
}

// Datos del empleado requeridos para vincular una cuenta.
export interface EmpleadoUsuario {
  id_empleado: number
  id_sucursal: number
  codigo_empleado: string
  nombres: string
  apellidos: string
  telefono: string
  puesto: string
  estado: string
}

export interface Usuario {
  id_usuario: number
  id_rol: number
  id_sucursal: number | null
  id_empleado: number | null
  nombre: string
  apellido: string
  correo: string
  telefono: string
  estado: 'ACTIVO' | 'INACTIVO'
  fecha_creacion: string
  rol: RolUsuario
  sucursal: SucursalUsuario | null
}

export interface CrearUsuario {
  id_rol: number
  id_sucursal?: number | null
  id_empleado?: number | null
  nombre: string
  apellido: string
  correo: string
  password: string
  telefono: string
}

export interface ActualizarUsuario {
  id_rol?: number
  id_sucursal?: number | null
  id_empleado?: number | null
  nombre?: string
  apellido?: string
  correo?: string
  telefono?: string
  estado?: 'ACTIVO' | 'INACTIVO'
}

// Obtiene todos los usuarios registrados.
export async function obtenerUsuarios(): Promise<Usuario[]> {
  const respuesta = await api.get<Usuario[]>('/usuarios')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('La respuesta de usuarios no tiene el formato esperado.')
  }

  return respuesta.data
}

// Consulta los empleados para asociarlos a las cuentas de usuario.
export async function obtenerEmpleadosParaUsuarios(): Promise<EmpleadoUsuario[]> {
  const respuesta = await api.get<EmpleadoUsuario[]>('/empleados')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('La respuesta de empleados no tiene el formato esperado.')
  }

  return respuesta.data
}

// Obtiene un usuario específico por su identificador.
export async function obtenerUsuario(idUsuario: number): Promise<Usuario> {
  const respuesta = await api.get<Usuario>(`/usuarios/${idUsuario}`)
  return respuesta.data
}

// Crea una nueva cuenta de usuario.
export async function crearUsuario(datos: CrearUsuario): Promise<Usuario> {
  const respuesta = await api.post<Usuario>('/usuarios', datos)
  return respuesta.data
}

// Actualiza los datos generales de un usuario.
export async function actualizarUsuario(
  idUsuario: number,
  datos: ActualizarUsuario,
): Promise<Usuario> {
  const respuesta = await api.patch<Usuario>(`/usuarios/${idUsuario}`, datos)
  return respuesta.data
}
