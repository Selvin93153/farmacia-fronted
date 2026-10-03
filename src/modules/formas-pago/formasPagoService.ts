import api from '../../services/api'

export interface FormaPago {
  id_forma_pago: number
  nombre: string
  estado: string
}

// Obtiene las formas de pago registradas en el sistema.
export async function obtenerFormasPago(): Promise<FormaPago[]> {
  const respuesta = await api.get<FormaPago[]>('/formas-pago')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de formas de pago.',
    )
  }

  return respuesta.data
}