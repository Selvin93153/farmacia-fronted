import { useEffect, useMemo, useState } from 'react'
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

import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'

import {
  obtenerSesion,
  type UsuarioSesion,
} from '../auth/authService'
import {
  obtenerCajas,
  type Caja,
} from '../caja/cajasService'
import {
  obtenerSucursales,
  type Sucursal,
} from '../sucursales/sucursalesService'

import AuditoriaEfectivoTable from './AuditoriaEfectivoTable'
import {
  obtenerMovimientosAuditoria,
  obtenerResumenAuditoria,
  obtenerResumenPorSucursal,
  type FiltrosAuditoriaEfectivo,
  type MovimientoAuditoriaEfectivo,
  type OrigenMovimientoAuditoria,
  type ResumenAuditoriaEfectivo,
  type ResumenSucursalAuditoria,
  type TipoMovimientoAuditoria,
} from './auditoriaEfectivoService'

type FiltroTipo = 'TODOS' | TipoMovimientoAuditoria
type FiltroOrigen = 'TODOS' | OrigenMovimientoAuditoria

const resumenInicial: ResumenAuditoriaEfectivo = {
  total_movimientos: 0,
  total_ingresos: 0,
  total_egresos: 0,
  flujo_neto: 0,
  movimientos_venta: 0,
  movimientos_manuales: 0,
}

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(valor)

const formatearFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(fecha))

function ControlAuditoriaEfectivo() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [resumen, setResumen] = useState<ResumenAuditoriaEfectivo>(resumenInicial)
  const [movimientos, setMovimientos] = useState<MovimientoAuditoriaEfectivo[]>([])
  const [resumenSucursales, setResumenSucursales] = useState<
    ResumenSucursalAuditoria[]
  >([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [cajas, setCajas] = useState<Caja[]>([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [idSucursal, setIdSucursal] = useState('TODAS')
  const [idCaja, setIdCaja] = useState('TODAS')
  const [tipoMovimiento, setTipoMovimiento] = useState<FiltroTipo>('TODOS')
  const [origen, setOrigen] = useState<FiltroOrigen>('TODOS')
  const [busqueda, setBusqueda] = useState('')

  const [movimientoSeleccionado, setMovimientoSeleccionado] =
    useState<MovimientoAuditoriaEfectivo | null>(null)

  const tieneSucursalAsignada =
    usuario?.id_sucursal !== null && usuario?.id_sucursal !== undefined

  const obtenerMensajeError = (
    error: unknown,
    mensajePredeterminado: string,
  ) => {
    if (axios.isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message

      if (Array.isArray(mensajeBackend)) {
        return mensajeBackend.join(', ')
      }

      if (typeof mensajeBackend === 'string') {
        return mensajeBackend
      }

      if (error.response) {
        return `El backend respondió con error HTTP ${error.response.status}.`
      }

      return 'No se pudo establecer comunicación con el servidor.'
    }

    if (error instanceof Error) {
      return error.message
    }

    return mensajePredeterminado
  }

  // Construye los filtros respetando siempre la sucursal asignada a la sesión.
  const construirFiltros = (
    idSucursalObligatoria: number | null = usuario?.id_sucursal ?? null,
  ): FiltrosAuditoriaEfectivo => {
    const filtros: FiltrosAuditoriaEfectivo = {}

    if (fechaDesde) {
      filtros.fecha_desde = fechaDesde
    }

    if (fechaHasta) {
      filtros.fecha_hasta = fechaHasta
    }

    if (idSucursalObligatoria !== null) {
      filtros.id_sucursal = idSucursalObligatoria
    } else if (idSucursal !== 'TODAS') {
      filtros.id_sucursal = Number(idSucursal)
    }

    if (idCaja !== 'TODAS') {
      filtros.id_caja = Number(idCaja)
    }

    if (tipoMovimiento !== 'TODOS') {
      filtros.tipo_movimiento = tipoMovimiento
    }

    if (origen !== 'TODOS') {
      filtros.origen = origen
    }

    return filtros
  }

  // Carga simultáneamente los indicadores, movimientos y consolidado nacional.
  const cargarAuditoria = async (
    idSucursalObligatoria: number | null = usuario?.id_sucursal ?? null,
  ) => {
    setCargando(true)
    setError('')

    try {
      const filtros = construirFiltros(idSucursalObligatoria)

      const [resumenRecibido, movimientosRecibidos, resumenSucursalRecibido] =
        await Promise.all([
          obtenerResumenAuditoria(filtros),
          obtenerMovimientosAuditoria(filtros),
          obtenerResumenPorSucursal(filtros),
        ])

      setResumen(resumenRecibido)
      setMovimientos(movimientosRecibidos)
      setResumenSucursales(resumenSucursalRecibido)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar la auditoría de efectivo.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  // Carga los catálogos necesarios según el alcance de la sesión.
  const cargarCatalogos = async (sesion: UsuarioSesion) => {
    try {
      if (sesion.id_sucursal === null) {
        const [sucursalesRecibidas, cajasRecibidas] = await Promise.all([
          obtenerSucursales(),
          obtenerCajas(),
        ])

        setSucursales(sucursalesRecibidas)
        setCajas(cajasRecibidas)
        return
      }

      // Para usuarios de sucursal no se necesita cargar el catálogo nacional de sucursales.
      const cajasRecibidas = await obtenerCajas()
      setSucursales([])
      setCajas(
        cajasRecibidas.filter(
          (caja) => caja.id_sucursal === sesion.id_sucursal,
        ),
      )
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'No se pudieron cargar las sucursales y cajas para los filtros.',
        ),
      )
    }
  }

  // Primero obtiene la sesión para fijar el alcance antes de consultar la auditoría.
  useEffect(() => {
    const inicializarAuditoria = async () => {
      setCargando(true)
      setError('')

      try {
        const sesion = await obtenerSesion()
        setUsuario(sesion)

        const sucursalInicial =
          sesion.id_sucursal === null
            ? 'TODAS'
            : String(sesion.id_sucursal)

        setIdSucursal(sucursalInicial)

        await Promise.all([
          cargarCatalogos(sesion),
          cargarAuditoria(sesion.id_sucursal),
        ])
      } catch (error: unknown) {
        setError(
          obtenerMensajeError(
            error,
            'No se pudo inicializar la auditoría de efectivo.',
          ),
        )
        setCargando(false)
      }
    }

    void inicializarAuditoria()
  }, [])

  const cajasDisponibles = useMemo(() => {
    if (idSucursal === 'TODAS') {
      return cajas
    }

    return cajas.filter((caja) => caja.id_sucursal === Number(idSucursal))
  }, [cajas, idSucursal])

  useEffect(() => {
    if (
      idCaja !== 'TODAS' &&
      !cajasDisponibles.some((caja) => caja.id_caja === Number(idCaja))
    ) {
      setIdCaja('TODAS')
    }
  }, [cajasDisponibles, idCaja])

  const movimientosVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) {
      return movimientos
    }

    return movimientos.filter((movimiento) => {
      const responsable = `${movimiento.usuario.nombre} ${movimiento.usuario.apellido}`
        .toLowerCase()

      return (
        movimiento.concepto.toLowerCase().includes(texto) ||
        movimiento.caja.nombre.toLowerCase().includes(texto) ||
        movimiento.caja.sucursal.nombre.toLowerCase().includes(texto) ||
        movimiento.caja.sucursal.codigo.toLowerCase().includes(texto) ||
        responsable.includes(texto) ||
        String(movimiento.id_movimiento_caja).includes(texto) ||
        (movimiento.id_venta !== null &&
          String(movimiento.id_venta).includes(texto))
      )
    })
  }, [movimientos, busqueda])

  // Limpia filtros opcionales sin eliminar el alcance obligatorio de la sucursal.
  const limpiarFiltros = () => {
    setFechaDesde('')
    setFechaHasta('')
    setIdSucursal(
      usuario?.id_sucursal === null || usuario?.id_sucursal === undefined
        ? 'TODAS'
        : String(usuario.id_sucursal),
    )
    setIdCaja('TODAS')
    setTipoMovimiento('TODOS')
    setOrigen('TODOS')
    setBusqueda('')
  }

  const hayFiltros =
    fechaDesde !== '' ||
    fechaHasta !== '' ||
    (!tieneSucursalAsignada && idSucursal !== 'TODAS') ||
    idCaja !== 'TODAS' ||
    tipoMovimiento !== 'TODOS' ||
    origen !== 'TODOS' ||
    busqueda !== ''

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Auditoría de efectivo
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {!tieneSucursalAsignada
              ? 'Supervisa ingresos, egresos y flujo neto de las cajas de toda la empresa.'
              : `Supervisa ingresos, egresos y flujo neto de ${
                  usuario?.sucursal?.nombre ?? 'tu sucursal'
                }.`}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => void cargarAuditoria()}
          disabled={cargando}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Actualizar
        </Button>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando auditoría de efectivo" />}
      {error && <Alert severity="error">{error}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        <ResumenCard
          titulo="Ingresos"
          valor={formatearMoneda(resumen.total_ingresos)}
          subtitulo={`${resumen.movimientos_venta} movimientos asociados a ventas`}
          icono={<TrendingUpRoundedIcon />}
          color="success.main"
        />

        <ResumenCard
          titulo="Egresos"
          valor={formatearMoneda(resumen.total_egresos)}
          subtitulo="Salidas registradas en caja"
          icono={<TrendingDownRoundedIcon />}
          color="error.main"
        />

        <ResumenCard
          titulo="Flujo neto"
          valor={formatearMoneda(resumen.flujo_neto)}
          subtitulo="Ingresos menos egresos"
          icono={<AccountBalanceWalletRoundedIcon />}
          color={resumen.flujo_neto >= 0 ? 'primary.main' : 'error.main'}
        />

        <ResumenCard
          titulo="Movimientos"
          valor={resumen.total_movimientos.toLocaleString('es-GT')}
          subtitulo={`${resumen.movimientos_manuales} movimientos manuales`}
          icono={<ReceiptLongRoundedIcon />}
          color="secondary.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filtros de auditoría
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delimita el período y el origen de los movimientos que deseas
                revisar.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  xl: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              <TextField
                label="Fecha desde"
                type="date"
                value={fechaDesde}
                onChange={(event) => setFechaDesde(event.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                label="Fecha hasta"
                type="date"
                value={fechaHasta}
                onChange={(event) => setFechaHasta(event.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <FormControl fullWidth>
                <InputLabel id="auditoria-sucursal-label">Sucursal</InputLabel>
                <Select
                  labelId="auditoria-sucursal-label"
                  label="Sucursal"
                  value={idSucursal}
                  disabled={tieneSucursalAsignada}
                  onChange={(event) => setIdSucursal(event.target.value)}
                >
                  {tieneSucursalAsignada ? (
                    <MenuItem value={String(usuario?.id_sucursal ?? '')}>
                      {usuario?.sucursal?.codigo ?? 'Sucursal'} -{' '}
                      {usuario?.sucursal?.nombre ??
                        `Sucursal ${usuario?.id_sucursal ?? ''}`}
                    </MenuItem>
                  ) : (
                    [
                      <MenuItem key="TODAS" value="TODAS">
                        Todas las sucursales
                      </MenuItem>,
                      ...sucursales.map((sucursal) => (
                        <MenuItem
                          key={sucursal.id_sucursal}
                          value={sucursal.id_sucursal.toString()}
                        >
                          {sucursal.codigo} - {sucursal.nombre}
                        </MenuItem>
                      )),
                    ]
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="auditoria-caja-label">Caja</InputLabel>
                <Select
                  labelId="auditoria-caja-label"
                  label="Caja"
                  value={idCaja}
                  onChange={(event) => setIdCaja(event.target.value)}
                >
                  <MenuItem value="TODAS">Todas las cajas</MenuItem>
                  {cajasDisponibles.map((caja) => (
                    <MenuItem key={caja.id_caja} value={caja.id_caja.toString()}>
                      {caja.nombre} - {caja.sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="auditoria-tipo-label">Tipo</InputLabel>
                <Select
                  labelId="auditoria-tipo-label"
                  label="Tipo"
                  value={tipoMovimiento}
                  onChange={(event) =>
                    setTipoMovimiento(event.target.value as FiltroTipo)
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="INGRESO">Ingresos</MenuItem>
                  <MenuItem value="EGRESO">Egresos</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="auditoria-origen-label">Origen</InputLabel>
                <Select
                  labelId="auditoria-origen-label"
                  label="Origen"
                  value={origen}
                  onChange={(event) =>
                    setOrigen(event.target.value as FiltroOrigen)
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="VENTA">Ventas</MenuItem>
                  <MenuItem value="MANUAL">Movimientos manuales</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              placeholder="Buscar por concepto, sucursal, caja, responsable, movimiento o venta..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ justifyContent: 'flex-end' }}
            >
              {hayFiltros && (
                <Button
                  variant="text"
                  onClick={limpiarFiltros}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Limpiar filtros
                </Button>
              )}

              <Button
                variant="contained"
                onClick={() => void cargarAuditoria()}
                disabled={cargando}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Aplicar filtros
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Consolidado por sucursal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comparación del flujo de efectivo entre las sedes incluidas en
                  la consulta.
                </Typography>
              </Box>

              <Chip
                icon={<BusinessRoundedIcon />}
                label={`${resumenSucursales.length} sucursales`}
                variant="outlined"
              />
            </Stack>

            {resumenSucursales.length === 0 && !cargando ? (
              <Alert severity="info">
                No hay información por sucursal para los filtros seleccionados.
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'repeat(2, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {resumenSucursales.map((sucursal) => (
                  <Card
                    key={sucursal.id_sucursal}
                    variant="outlined"
                    sx={{ borderRadius: 2.5 }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: 'center' }}
                        >
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              bgcolor: 'action.selected',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <BusinessRoundedIcon />
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700 }} noWrap>
                              {sucursal.sucursal}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {sucursal.codigo} · {sucursal.total_movimientos}{' '}
                              movimientos
                            </Typography>
                          </Box>
                        </Stack>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1.5,
                          }}
                        >
                          <MiniIndicador
                            titulo="Ingresos"
                            valor={formatearMoneda(sucursal.ingresos)}
                            color="success.main"
                          />
                          <MiniIndicador
                            titulo="Egresos"
                            valor={formatearMoneda(sucursal.egresos)}
                            color="error.main"
                          />
                          <MiniIndicador
                            titulo="Neto"
                            valor={formatearMoneda(sucursal.flujo_neto)}
                            color={
                              sucursal.flujo_neto >= 0
                                ? 'primary.main'
                                : 'error.main'
                            }
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Detalle de movimientos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mostrando {movimientosVisibles.length} de {movimientos.length}{' '}
            movimientos obtenidos.
          </Typography>
        </Box>

        <Chip
          icon={<PointOfSaleRoundedIcon />}
          label={`${resumen.movimientos_venta} por venta · ${resumen.movimientos_manuales} manuales`}
          variant="outlined"
        />
      </Stack>

      {!cargando && movimientosVisibles.length === 0 && !error ? (
        <Alert severity="info">
          No se encontraron movimientos que coincidan con los filtros aplicados.
        </Alert>
      ) : (
        <AuditoriaEfectivoTable
          movimientos={movimientosVisibles}
          onVerDetalle={setMovimientoSeleccionado}
        />
      )}

      <Dialog
        open={movimientoSeleccionado !== null}
        onClose={() => setMovimientoSeleccionado(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Detalle del movimiento auditado
        </DialogTitle>

        <DialogContent dividers>
          {movimientoSeleccionado && (
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
              >
                <Chip
                  label={movimientoSeleccionado.tipo_movimiento}
                  color={
                    movimientoSeleccionado.tipo_movimiento === 'INGRESO'
                      ? 'success'
                      : 'error'
                  }
                  sx={{ fontWeight: 700 }}
                />

                <Chip
                  label={
                    movimientoSeleccionado.id_venta !== null
                      ? `Venta #${movimientoSeleccionado.id_venta}`
                      : 'Movimiento manual'
                  }
                  variant="outlined"
                />

                <Typography variant="body2" color="text.secondary">
                  Movimiento #{movimientoSeleccionado.id_movimiento_caja}
                </Typography>
              </Stack>

              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                <DetalleDato
                  titulo="Fecha y hora"
                  valor={formatearFecha(movimientoSeleccionado.fecha)}
                />
                <DetalleDato
                  titulo="Monto"
                  valor={formatearMoneda(movimientoSeleccionado.monto)}
                />
                <DetalleDato
                  titulo="Sucursal"
                  valor={`${movimientoSeleccionado.caja.sucursal.codigo} - ${movimientoSeleccionado.caja.sucursal.nombre}`}
                />
                <DetalleDato
                  titulo="Caja"
                  valor={movimientoSeleccionado.caja.nombre}
                />
                <DetalleDato
                  titulo="Responsable"
                  valor={`${movimientoSeleccionado.usuario.nombre} ${movimientoSeleccionado.usuario.apellido}`}
                />
                <DetalleDato
                  titulo="Rol"
                  valor={movimientoSeleccionado.usuario.rol?.nombre ?? 'No disponible'}
                />
                <DetalleDato
                  titulo="Forma de pago"
                  valor={
                    movimientoSeleccionado.venta?.forma_pago?.nombre ??
                    'No aplica'
                  }
                />
                <DetalleDato
                  titulo="Origen"
                  valor={
                    movimientoSeleccionado.id_venta !== null
                      ? 'Venta'
                      : 'Movimiento manual'
                  }
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Concepto
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                  {movimientoSeleccionado.concepto}
                </Typography>
              </Box>
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

interface ResumenCardProps {
  titulo: string
  valor: string
  subtitulo: string
  icono: ReactNode
  color: string
}

function ResumenCard({
  titulo,
  valor,
  subtitulo,
  icono,
  color,
}: ResumenCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        transition: '0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2.5,
              bgcolor: color,
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icono}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {titulo}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25, fontWeight: 800 }}>
              {valor}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitulo}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

interface MiniIndicadorProps {
  titulo: string
  valor: string
  color: string
}

function MiniIndicador({ titulo, valor, color }: MiniIndicadorProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {titulo}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 0.25, fontWeight: 800, color, wordBreak: 'break-word' }}
      >
        {valor}
      </Typography>
    </Box>
  )
}

interface DetalleDatoProps {
  titulo: string
  valor: string
}

function DetalleDato({ titulo, valor }: DetalleDatoProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {titulo}
      </Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 600 }}>{valor}</Typography>
    </Box>
  )
}

export default ControlAuditoriaEfectivo
