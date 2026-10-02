import api from '../../services/api'

export interface DepartamentoMunicipio {
  id_departamento: number
  nombre: string
  estado: string
}

export interface Municipio {
  id_municipio: number
  id_departamento: number
  nombre: string
  estado: string
  departamento: DepartamentoMunicipio
}

// Obtiene los municipios junto con la información de su departamento.
export async function obtenerMunicipios(): Promise<Municipio[]> {
  const respuesta = await api.get<Municipio[]>('/municipios')

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de municipios.',
    )
  }

  return respuesta.data
}