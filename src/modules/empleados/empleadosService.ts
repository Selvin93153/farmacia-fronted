import api from '../../services/api'

export interface DepartamentoEmpleado {
  id_departamento: number
  nombre: string
}

export interface MunicipioEmpleado {
  id_municipio: number
  id_departamento: number
  nombre: string
  departamento?: DepartamentoEmpleado
}

export interface SucursalEmpleado {
  id_sucursal: number
  codigo: string
  nombre: string
  direccion: string
  municipio?: MunicipioEmpleado
}

export interface Empleado {
  id_empleado: number
  id_sucursal: number
  codigo_empleado: string
  nombres: string
  apellidos: string
  telefono: string
  puesto: string
  salario_base: number
  fecha_ingreso: string
  estado: string
  fecha_creacion: string
  sucursal: SucursalEmpleado
}

export interface CrearEmpleado {
  id_sucursal: number
  codigo_empleado: string
  nombres: string
  apellidos: string
  telefono: string
  puesto: string
  salario_base: number
  fecha_ingreso: string
}

export interface ActualizarEmpleado extends Partial<CrearEmpleado> {
  estado?: 'ACTIVO' | 'INACTIVO'
}

export async function obtenerEmpleados(): Promise<Empleado[]> {
  const respuesta = await api.get<Empleado[]>('/empleados')

  if (!Array.isArray(respuesta.data)) {
    throw new Error('El backend respondió, pero no devolvió una lista de empleados.')
  }

  return respuesta.data
}

export async function obtenerEmpleado(id: number): Promise<Empleado> {
  const respuesta = await api.get<Empleado>(`/empleados/${id}`)
  return respuesta.data
}

export async function crearEmpleado(datos: CrearEmpleado): Promise<Empleado> {
  const respuesta = await api.post<Empleado>('/empleados', datos)
  return respuesta.data
}

export async function actualizarEmpleado(
  id: number,
  datos: ActualizarEmpleado,
): Promise<Empleado> {
  const respuesta = await api.patch<Empleado>(`/empleados/${id}`, datos)
  return respuesta.data
}


export async function eliminarEmpleado(id: number): Promise<void> {
  await api.delete(`/empleados/${id}`)
}

