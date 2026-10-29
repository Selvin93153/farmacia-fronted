import api from '../../services/api'

export interface UsuarioAutenticado {
  id_usuario: number
  nombre: string
  apellido: string
  correo: string
  id_rol: number
  id_sucursal: number | null
}

export interface LoginResponse {
  message: string
  usuario: UsuarioAutenticado
}

export interface UsuarioSesion {
  id_usuario: number
  id_rol: number
  id_sucursal: number | null
  nombre: string
  apellido: string
  correo: string
  telefono: string
  estado: string

  rol?: {
    codigo: string
    nombre: string
    descripcion?: string
  }

  sucursal?: {
    id_sucursal: number
    codigo: string
    nombre: string
  } | null
}

export interface CambiarPassword {
  password_actual: string
  password_nueva: string
  confirmar_password: string
}

export interface CambiarPasswordResponse {
  message: string
}

export async function iniciarSesion(
  correo: string,
  password: string,
): Promise<LoginResponse> {
  const respuesta = await api.post<LoginResponse>(
    '/auth/login',
    {
      correo,
      password,
    },
  )

  return respuesta.data
}

export async function obtenerSesion(): Promise<UsuarioSesion> {
  const respuesta =
    await api.get<UsuarioSesion>('/auth/me')

  return respuesta.data
}

// Cambia la contraseña del usuario que tiene la sesión actual.
export async function cambiarPassword(
  datos: CambiarPassword,
): Promise<CambiarPasswordResponse> {
  const respuesta =
    await api.patch<CambiarPasswordResponse>(
      '/usuarios/cambiar-password',
      datos,
    )

  return respuesta.data
}

export async function cerrarSesion(): Promise<void> {
  await api.post('/auth/logout')
}