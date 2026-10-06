import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { obtenerSesion } from '../auth/authService'
import {
  obtenerCajas,
  obtenerCajasMiSucursal,
  type Caja,
} from '../caja/cajasService'
import MovimientoCajaForm, {
  type SucursalMovimientoCajaOpcion,
} from './MovimientoCajaForm'
import MovimientosCajaTable from './MovimientosCajaTable'
import {
  crearMovimientoCaja,
  obtenerMovimientosCaja,
  obtenerMovimientosCajaMiSucursal,
  type CrearMovimientoCaja,
  type MovimientoCaja,
  type TipoMovimientoCaja,
} from './movimientosCajaService'

type FiltroTipo = 'TODOS' | TipoMovimientoCaja

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'full',
  timeStyle: 'short',
})

// Convierte los errores del backend en mensajes comprensibles.
function obtenerMensajeError(error: unknown, predeterminado: string): string {
  if (axios.isAxiosError(error)) {
    const mensajeBackend = error.response?.data?.message
    if (Array.isArray(mensajeBackend)) return mensajeBackend.join(', ')
    if (typeof mensajeBackend === 'string') return mensajeBackend
    if (error.response) return `El backend respondió con error HTTP ${error.response.status}.`
    return 'No se pudo establecer comunicación con el servidor.'
  }
  if (error instanceof Error) return error.message
  return predeterminado
}

function ControlMovimientoCaja() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([])
  const [cajas, setCajas] = useState<Caja[]>([])
  const [sucursalSesion, setSucursalSesion] = useState<SucursalMovimientoCajaOpcion | null>(null)
  const [idSucursalAsignada, setIdSucursalAsignada] = useState<number | null>(null)
  const [sesionVerificada, setSesionVerificada] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [filtroCaja, setFiltroCaja] = useState('TODAS')
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODOS')
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<MovimientoCaja | null>(null)

  // Selecciona el endpoint según el alcance de la sesión y no expone datos globales a una sucursal.
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')
    setSesionVerificada(false)
    setMovimientos([])
    setCajas([])
    setIdSucursalAsignada(null)
    setSucursalSesion(null)

    try {
      const sesion = await obtenerSesion()
      const idSucursal = sesion.id_sucursal
      if (idSucursal !== null && (!Number.isInteger(idSucursal) || idSucursal < 1)) {
        throw new Error('No se pudo determinar la sucursal de la sesión.')
      }

      const [movimientosRecibidos, cajasRecibidas] = await Promise.all([
        idSucursal === null
          ? obtenerMovimientosCaja()
          : obtenerMovimientosCajaMiSucursal(),
        idSucursal === null ? obtenerCajas() : obtenerCajasMiSucursal(),
      ])

      const cajasAlcance = idSucursal === null
        ? cajasRecibidas
        : cajasRecibidas.filter((caja) => caja.id_sucursal === idSucursal)
      const movimientosAlcance = idSucursal === null
        ? movimientosRecibidos
        : movimientosRecibidos.filter((movimiento) => movimiento.caja.id_sucursal === idSucursal)

      setCajas(cajasAlcance)
      setMovimientos(movimientosAlcance)
      setIdSucursalAsignada(idSucursal)
      setSucursalSesion(idSucursal === null ? null : {
        id_sucursal: idSucursal,
        codigo: sesion.sucursal?.codigo ?? cajasAlcance[0]?.sucursal.codigo ?? '',
        nombre: sesion.sucursal?.nombre ?? cajasAlcance[0]?.sucursal.nombre ?? `Sucursal #${idSucursal}`,
      })
      setSesionVerificada(true)
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudieron cargar los movimientos de caja.'))
      setSesionVerificada(false)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  const sucursales = useMemo(() => {
    const mapa = new Map<number, SucursalMovimientoCajaOpcion>()
    if (sucursalSesion) mapa.set(sucursalSesion.id_sucursal, sucursalSesion)
    cajas.forEach((caja) => mapa.set(caja.id_sucursal, {
      id_sucursal: caja.id_sucursal,
      codigo: caja.sucursal.codigo,
      nombre: caja.sucursal.nombre,
    }))
    movimientos.forEach((movimiento) => {
      const sucursal = movimiento.caja.sucursal
      mapa.set(sucursal.id_sucursal, {
        id_sucursal: sucursal.id_sucursal,
        codigo: sucursal.codigo,
        nombre: sucursal.nombre,
      })
    })
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [cajas, movimientos, sucursalSesion])

  const cajasFiltrables = useMemo(() => {
    const mapa = new Map<number, { id_caja: number; nombre: string; id_sucursal: number }>()
    cajas.forEach((caja) => mapa.set(caja.id_caja, caja))
    movimientos.forEach((movimiento) => mapa.set(movimiento.id_caja, movimiento.caja))
    return [...mapa.values()].filter(
      (caja) => filtroSucursal === 'TODAS' || caja.id_sucursal === Number(filtroSucursal),
    )
  }, [cajas, movimientos, filtroSucursal])

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return movimientos.filter((movimiento) => {
      const coincideSucursal = filtroSucursal === 'TODAS' ||
        movimiento.caja.id_sucursal === Number(filtroSucursal)
      const coincideCaja = filtroCaja === 'TODAS' ||
        movimiento.id_caja === Number(filtroCaja)
      const coincideTipo = filtroTipo === 'TODOS' || movimiento.tipo_movimiento === filtroTipo
      const coincideBusqueda = !texto || [
        movimiento.concepto,
        movimiento.caja.nombre,
        movimiento.caja.sucursal.nombre,
        movimiento.caja.sucursal.codigo,
        `${movimiento.usuario.nombre} ${movimiento.usuario.apellido}`,
        movimiento.id_venta === null ? '' : String(movimiento.id_venta),
      ].some((valor) => valor.toLowerCase().includes(texto))
      return coincideSucursal && coincideCaja && coincideTipo && coincideBusqueda
    })
  }, [movimientos, filtroSucursal, filtroCaja, filtroTipo, busqueda])

  const totalIngresos = movimientos
    .filter((movimiento) => movimiento.tipo_movimiento === 'INGRESO')
    .reduce((acumulado, movimiento) => acumulado + Number(movimiento.monto), 0)
  const totalEgresos = movimientos
    .filter((movimiento) => movimiento.tipo_movimiento === 'EGRESO')
    .reduce((acumulado, movimiento) => acumulado + Number(movimiento.monto), 0)
  const balanceNeto = totalIngresos - totalEgresos

  const guardarMovimiento = async (datos: CrearMovimientoCaja) => {
    setGuardando(true)
    setErrorFormulario('')
    try {
      await crearMovimientoCaja(datos)
      setFormularioAbierto(false)
      await cargarDatos()
    } catch (errorDesconocido: unknown) {
      setErrorFormulario(obtenerMensajeError(errorDesconocido, 'No se pudo registrar el movimiento.'))
    } finally {
      setGuardando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroSucursal('TODAS')
    setFiltroCaja('TODAS')
    setFiltroTipo('TODOS')
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
      >
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
            Movimientos de caja
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta ingresos, egresos y operaciones registradas en las cajas de SIGFAR.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void cargarDatos()}
            disabled={cargando}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setErrorFormulario('')
              setFormularioAbierto(true)
            }}
            disabled={!sesionVerificada || cargando || !cajas.some((caja) => caja.estado === 'ACTIVA')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Registrar movimiento
          </Button>
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando movimientos de caja" />}
      {error && <Alert severity="error">{error}</Alert>}
      {!cargando && sesionVerificada && !cajas.some((caja) => caja.estado === 'ACTIVA') && (
        <Alert severity="info">No hay cajas activas disponibles para registrar movimientos manuales.</Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
        <ResumenMovimiento titulo="Movimientos registrados" valor={String(movimientos.length)} icono={<AccountBalanceWalletRoundedIcon />} color="primary.main" />
        <ResumenMovimiento titulo="Ingresos" valor={formatoMoneda.format(totalIngresos)} icono={<TrendingUpRoundedIcon />} color="success.main" />
        <ResumenMovimiento titulo="Egresos" valor={formatoMoneda.format(totalEgresos)} icono={<TrendingDownRoundedIcon />} color="error.main" />
        <ResumenMovimiento titulo="Balance neto" valor={formatoMoneda.format(balanceNeto)} icono={<PaymentsRoundedIcon />} color="secondary.main" />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
        El balance neto corresponde a ingresos menos egresos registrados; no representa necesariamente el saldo real en efectivo ni el cierre de caja.
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por concepto, sucursal, caja, usuario o número de venta..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth disabled={idSucursalAsignada !== null}>
                <InputLabel id="filtro-sucursal-caja-label">Sucursal</InputLabel>
                <Select
                  labelId="filtro-sucursal-caja-label"
                  label="Sucursal"
                  value={idSucursalAsignada === null ? filtroSucursal : String(idSucursalAsignada)}
                  onChange={(event) => {
                    setFiltroSucursal(event.target.value)
                    setFiltroCaja('TODAS')
                  }}
                >
                  {idSucursalAsignada === null && <MenuItem value="TODAS">Todas las sucursales</MenuItem>}
                  {sucursales.map((sucursal) => (
                    <MenuItem value={String(sucursal.id_sucursal)} key={sucursal.id_sucursal}>
                      {sucursal.codigo} - {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="filtro-caja-movimiento-label">Caja</InputLabel>
                <Select
                  labelId="filtro-caja-movimiento-label"
                  label="Caja"
                  value={filtroCaja}
                  onChange={(event) => setFiltroCaja(event.target.value)}
                >
                  <MenuItem value="TODAS">Todas las cajas</MenuItem>
                  {cajasFiltrables.map((caja) => (
                    <MenuItem key={caja.id_caja} value={String(caja.id_caja)}>
                      {caja.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="filtro-tipo-movimiento-caja-label">Tipo</InputLabel>
                <Select
                  labelId="filtro-tipo-movimiento-caja-label"
                  label="Tipo"
                  value={filtroTipo}
                  onChange={(event) => setFiltroTipo(event.target.value as FiltroTipo)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="INGRESO">Ingresos</MenuItem>
                  <MenuItem value="EGRESO">Egresos</MenuItem>
                </Select>
              </FormControl>
              {(busqueda || filtroTipo !== 'TODOS' || filtroCaja !== 'TODAS' || (idSucursalAsignada === null && filtroSucursal !== 'TODAS')) && (
                <Button onClick={limpiarFiltros} sx={{ minWidth: 145, textTransform: 'none' }}>
                  Limpiar filtros
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && !error && (movimientosFiltrados.length > 0 ? (
        <>
          <Typography color="text.secondary" variant="body2">
            Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos.
          </Typography>
          <MovimientosCajaTable movimientos={movimientosFiltrados} onVerDetalle={setMovimientoSeleccionado} />
        </>
      ) : (
        <Alert severity="info">
          {movimientos.length === 0
            ? 'No hay movimientos de caja registrados.'
            : 'No se encontraron movimientos con los filtros seleccionados.'}
        </Alert>
      ))}

      <MovimientoCajaForm
        abierto={formularioAbierto}
        idSucursalAsignada={idSucursalAsignada}
        cajas={cajas}
        sucursales={sucursales}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={() => {
          if (guardando) return
          setFormularioAbierto(false)
          setErrorFormulario('')
        }}
        onGuardar={guardarMovimiento}
      />

      <Dialog
        open={movimientoSeleccionado !== null}
        onClose={() => setMovimientoSeleccionado(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Detalle del movimiento</DialogTitle>
        <DialogContent dividers>
          {movimientoSeleccionado && (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Chip
                  label={movimientoSeleccionado.tipo_movimiento}
                  color={movimientoSeleccionado.tipo_movimiento === 'INGRESO' ? 'success' : 'error'}
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={movimientoSeleccionado.id_venta === null ? 'Manual' : `Venta #${movimientoSeleccionado.id_venta}`}
                  variant="outlined"
                />
              </Stack>
              <DetalleMovimiento titulo="ID de movimiento" valor={`#${movimientoSeleccionado.id_movimiento_caja}`} />
              <DetalleMovimiento titulo="Fecha" valor={formatoFecha.format(new Date(movimientoSeleccionado.fecha))} />
              <Divider />
              <DetalleMovimiento titulo="Sucursal" valor={movimientoSeleccionado.caja.sucursal.nombre} />
              <DetalleMovimiento titulo="Caja" valor={movimientoSeleccionado.caja.nombre} />
              <DetalleMovimiento titulo="Responsable" valor={`${movimientoSeleccionado.usuario.nombre} ${movimientoSeleccionado.usuario.apellido}`} />
              <DetalleMovimiento titulo="Concepto" valor={movimientoSeleccionado.concepto} />
              {movimientoSeleccionado.venta?.forma_pago?.nombre && (
                <DetalleMovimiento titulo="Forma de pago" valor={movimientoSeleccionado.venta.forma_pago.nombre} />
              )}
              <Divider />
              <DetalleMovimiento titulo="Monto" valor={formatoMoneda.format(movimientoSeleccionado.monto)} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMovimientoSeleccionado(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

interface ResumenMovimientoProps {
  titulo: string
  valor: string
  icono: ReactNode
  color: string
}

function ResumenMovimiento({ titulo, valor, icono, color }: ResumenMovimientoProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, transition: '0.2s', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: color, color: 'common.white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icono}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">{titulo}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{valor}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function DetalleMovimiento({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">{titulo}</Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 600, overflowWrap: 'anywhere' }}>{valor}</Typography>
    </Box>
  )
}

export default ControlMovimientoCaja
