import api from '../../services/api'

export type TipoMovimientoAuditoria = 'INGRESO' | 'EGRESO'
export type OrigenMovimientoAuditoria = 'VENTA' | 'MANUAL'

export interface FiltrosAuditoriaEfectivo {
  fecha_desde?: string
  fecha_hasta?: string
  id_sucursal?: number
  id_caja?: number
  tipo_movimiento?: TipoMovimientoAuditoria
  origen?: OrigenMovimientoAuditoria
}

export interface ResumenAuditoriaEfectivo {
  total_movimientos: number
  total_ingresos: number
  total_egresos: number
  flujo_neto: number
  movimientos_venta: number
  movimientos_manuales: number
}

export interface DepartamentoAuditoria {
  id_departamento?: number
  nombre: string
}

export interface MunicipioAuditoria {
  id_municipio?: number
  nombre: string
  departamento?: DepartamentoAuditoria
}

export interface SucursalAuditoria {
  id_sucursal: number
  codigo: string
  nombre: string
  direccion?: string
  municipio?: MunicipioAuditoria
}

export interface CajaAuditoria {
  id_caja: number
  id_sucursal: number
  nombre: string
  estado?: string
  sucursal: SucursalAuditoria
}

export interface RolAuditoria {
  id?: number
  codigo?: string
  nombre: string
}

export interface UsuarioAuditoria {
  id_usuario: number
  nombre: string
  apellido: string
  correo?: string
  rol?: RolAuditoria
}

export interface FormaPagoAuditoria {
  id_forma_pago?: number
  nombre: string
}

export interface VentaAuditoria {
  id_venta: number
  total: number
  estado: string
  forma_pago?: FormaPagoAuditoria
}

export interface MovimientoAuditoriaEfectivo {
  id_movimiento_caja: number
  id_caja: number
  id_usuario: number
  id_venta: number | null
  tipo_movimiento: TipoMovimientoAuditoria
  concepto: string
  monto: number
  fecha: string
  caja: CajaAuditoria
  usuario: UsuarioAuditoria
  venta: VentaAuditoria | null
}

export interface ResumenSucursalAuditoria {
  id_sucursal: number
  codigo: string
  sucursal: string
  total_movimientos: number
  ingresos: number
  egresos: number
  flujo_neto: number
}

function crearParametros(filtros: FiltrosAuditoriaEfectivo): URLSearchParams {
  const parametros = new URLSearchParams()

  if (filtros.fecha_desde) {
    parametros.set('fecha_desde', filtros.fecha_desde)
  }

  if (filtros.fecha_hasta) {
    parametros.set('fecha_hasta', filtros.fecha_hasta)
  }

  if (filtros.id_sucursal) {
    parametros.set('id_sucursal', String(filtros.id_sucursal))
  }

  if (filtros.id_caja) {
    parametros.set('id_caja', String(filtros.id_caja))
  }

  if (filtros.tipo_movimiento) {
    parametros.set('tipo_movimiento', filtros.tipo_movimiento)
  }

  if (filtros.origen) {
    parametros.set('origen', filtros.origen)
  }

  return parametros
}

// Obtiene los indicadores consolidados del flujo de efectivo.
export async function obtenerResumenAuditoria(
  filtros: FiltrosAuditoriaEfectivo,
): Promise<ResumenAuditoriaEfectivo> {
  const parametros = crearParametros(filtros)
  const respuesta = await api.get<ResumenAuditoriaEfectivo>(
    `/auditoria-efectivo/resumen?${parametros.toString()}`,
  )

  return respuesta.data
}

// Obtiene los movimientos detallados que coinciden con los filtros aplicados.
export async function obtenerMovimientosAuditoria(
  filtros: FiltrosAuditoriaEfectivo,
): Promise<MovimientoAuditoriaEfectivo[]> {
  const parametros = crearParametros(filtros)
  const respuesta = await api.get<MovimientoAuditoriaEfectivo[]>(
    `/auditoria-efectivo/movimientos?${parametros.toString()}`,
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió una lista de movimientos de auditoría.',
    )
  }

  return respuesta.data
}

// Obtiene el consolidado financiero agrupado por sucursal.
export async function obtenerResumenPorSucursal(
  filtros: FiltrosAuditoriaEfectivo,
): Promise<ResumenSucursalAuditoria[]> {
  const parametros = crearParametros(filtros)
  const respuesta = await api.get<ResumenSucursalAuditoria[]>(
    `/auditoria-efectivo/por-sucursal?${parametros.toString()}`,
  )

  if (!Array.isArray(respuesta.data)) {
    throw new Error(
      'El backend respondió, pero no devolvió el consolidado por sucursal.',
    )
  }

  return respuesta.data
}
