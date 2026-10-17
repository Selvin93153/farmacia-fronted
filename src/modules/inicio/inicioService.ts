import {
  obtenerResumenAuditoria,
  obtenerMovimientosAuditoria,
  type MovimientoAuditoriaEfectivo,
} from '../auditoria-efectivo/auditoriaEfectivoService'
import {
  obtenerInventarios,
  obtenerInventariosMiSucursal,
  type Inventario,
} from '../inventarios/inventariosService'
import {
  obtenerVentas,
  obtenerVentasMiSucursal,
  type Venta,
} from '../ventas/ventasService'
import {
  obtenerSesion,
  type UsuarioSesion,
} from '../auth/authService'

export interface PuntoVentaInicio {
  etiqueta: string
  fecha: string
  total: number
}

export interface PuntoFlujoInicio {
  etiqueta: string
  fecha: string
  ingresos: number
  egresos: number
}

export interface ResumenInventarioInicio {
  normal: number
  bajo: number
  sinStock: number
}

export interface DatosInicio {
  usuario: UsuarioSesion
  ventasDisponibles: boolean
  flujoDisponible: boolean
  inventarioDisponible: boolean
  ventasHoy: number
  flujoNetoHoy: number
  stockCritico: number
  ventasUltimos7Dias: PuntoVentaInicio[]
  flujoUltimos7Dias: PuntoFlujoInicio[]
  inventario: ResumenInventarioInicio
  advertencias: string[]
}

const rolesConVentas = [
  'ADMIN_SISTEMA',
  'ADMIN_SUCURSAL',
  'TRABAJADOR_SUCURSAL',
]

const rolesConFlujo = [
  'ADMIN_SISTEMA',
  'ADMIN_SUCURSAL',
]

const rolesConInventario = [
  'ADMIN_SISTEMA',
  'ADMIN_SUCURSAL',
  'INVENTARIO',
]

// Convierte una fecha local a YYYY-MM-DD sin desplazarla por zona horaria.
function convertirFechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

// Genera los siete días que alimentan las gráficas del dashboard.
function obtenerUltimos7Dias() {
  const dias: { fecha: string; etiqueta: string }[] = []
  const formateador = new Intl.DateTimeFormat('es-GT', {
    weekday: 'short',
    day: '2-digit',
  })

  for (let desplazamiento = 6; desplazamiento >= 0; desplazamiento -= 1) {
    const fecha = new Date()
    fecha.setHours(0, 0, 0, 0)
    fecha.setDate(fecha.getDate() - desplazamiento)

    dias.push({
      fecha: convertirFechaLocal(fecha),
      etiqueta: formateador.format(fecha).replace('.', ''),
    })
  }

  return dias
}

// Agrupa las ventas completadas por día para crear la gráfica de los últimos 7 días.
function crearSerieVentas(
  ventas: Venta[],
): PuntoVentaInicio[] {
  const dias = obtenerUltimos7Dias()

  return dias.map((dia) => {
    const total = ventas
      .filter(
        (venta) =>
          venta.estado === 'COMPLETADA' &&
          convertirFechaLocal(new Date(venta.fecha)) === dia.fecha,
      )
      .reduce(
        (acumulado, venta) =>
          acumulado + Number(venta.total),
        0,
      )

    return {
      ...dia,
      total,
    }
  })
}

// Agrupa ingresos y egresos diarios para construir la gráfica de flujo de efectivo.
function crearSerieFlujo(
  movimientos: MovimientoAuditoriaEfectivo[],
): PuntoFlujoInicio[] {
  const dias = obtenerUltimos7Dias()

  return dias.map((dia) => {
    const movimientosDia = movimientos.filter(
      (movimiento) =>
        convertirFechaLocal(new Date(movimiento.fecha)) ===
        dia.fecha,
    )

    const ingresos = movimientosDia
      .filter(
        (movimiento) =>
          movimiento.tipo_movimiento === 'INGRESO',
      )
      .reduce(
        (acumulado, movimiento) =>
          acumulado + Number(movimiento.monto),
        0,
      )

    const egresos = movimientosDia
      .filter(
        (movimiento) =>
          movimiento.tipo_movimiento === 'EGRESO',
      )
      .reduce(
        (acumulado, movimiento) =>
          acumulado + Number(movimiento.monto),
        0,
      )

    return {
      ...dia,
      ingresos,
      egresos,
    }
  })
}

// Clasifica cada registro de inventario en normal, stock bajo o sin existencia.
function crearResumenInventario(
  inventarios: Inventario[],
): ResumenInventarioInicio {
  return inventarios.reduce<ResumenInventarioInicio>(
    (resumen, inventario) => {
      const stockActual = Number(inventario.stock_actual)
      const stockMinimo = Number(inventario.stock_minimo)

      if (stockActual <= 0) {
        resumen.sinStock += 1
      } else if (stockActual <= stockMinimo) {
        resumen.bajo += 1
      } else {
        resumen.normal += 1
      }

      return resumen
    },
    {
      normal: 0,
      bajo: 0,
      sinStock: 0,
    },
  )
}

// Carga únicamente la información que el rol de la sesión está autorizado a consultar.
export async function obtenerDatosInicio(): Promise<DatosInicio> {
  const usuario = await obtenerSesion()
  const codigoRol = usuario.rol?.codigo ?? ''
  const advertencias: string[] = []

  const ventasDisponibles = rolesConVentas.includes(codigoRol)
  const flujoDisponible = rolesConFlujo.includes(codigoRol)
  const inventarioDisponible =
    rolesConInventario.includes(codigoRol)

  let ventas: Venta[] = []
  let movimientos: MovimientoAuditoriaEfectivo[] = []
  let inventarios: Inventario[] = []
  let flujoNetoHoy = 0

  const dias = obtenerUltimos7Dias()
  const fechaDesde = dias[0].fecha
  const fechaHasta = dias[dias.length - 1].fecha

  // Las consultas se ejecutan de forma independiente para que una gráfica no bloquee todo el Inicio.
  const tareas: Promise<void>[] = []

  if (ventasDisponibles) {
    tareas.push(
      (async () => {
        try {
          ventas =
            usuario.id_sucursal === null
              ? await obtenerVentas()
              : await obtenerVentasMiSucursal()
        } catch {
          advertencias.push(
            'No fue posible cargar la información de ventas.',
          )
        }
      })(),
    )
  }

  if (flujoDisponible) {
    tareas.push(
      (async () => {
        try {
          const filtrosBase = {
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
            ...(usuario.id_sucursal !== null
              ? { id_sucursal: usuario.id_sucursal }
              : {}),
          }

          const [movimientosRecibidos, resumenHoy] =
            await Promise.all([
              obtenerMovimientosAuditoria(filtrosBase),
              obtenerResumenAuditoria({
                fecha_desde: fechaHasta,
                fecha_hasta: fechaHasta,
                ...(usuario.id_sucursal !== null
                  ? { id_sucursal: usuario.id_sucursal }
                  : {}),
              }),
            ])

          movimientos = movimientosRecibidos
          flujoNetoHoy = Number(resumenHoy.flujo_neto)
        } catch {
          advertencias.push(
            'No fue posible cargar el flujo de efectivo.',
          )
        }
      })(),
    )
  }

  if (inventarioDisponible) {
    tareas.push(
      (async () => {
        try {
          inventarios =
            usuario.id_sucursal === null
              ? await obtenerInventarios()
              : await obtenerInventariosMiSucursal()
        } catch {
          advertencias.push(
            'No fue posible cargar el estado del inventario.',
          )
        }
      })(),
    )
  }

  await Promise.all(tareas)

  const ventasUltimos7Dias = crearSerieVentas(ventas)
  const flujoUltimos7Dias = crearSerieFlujo(movimientos)
  const inventario = crearResumenInventario(inventarios)

  const ventasHoy =
    ventasUltimos7Dias[
      ventasUltimos7Dias.length - 1
    ]?.total ?? 0

  return {
    usuario,
    ventasDisponibles,
    flujoDisponible,
    inventarioDisponible,
    ventasHoy,
    flujoNetoHoy,
    stockCritico: inventario.bajo + inventario.sinStock,
    ventasUltimos7Dias,
    flujoUltimos7Dias,
    inventario,
    advertencias,
  }
}
