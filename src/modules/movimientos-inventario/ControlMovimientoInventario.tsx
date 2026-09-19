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

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'

import {
  obtenerInventarios,
  type Inventario,
} from '../inventarios/inventariosService'

import MovimientoInventarioForm from './MovimientoInventarioForm'
import MovimientosInventarioTable from './MovimientosInventarioTable'

import {
  crearMovimientoInventario,
  obtenerMovimientosInventario,
  type CrearMovimientoInventario,
  type MotivoMovimiento,
  type MovimientoInventario,
  type TipoMovimiento,
} from './movimientosInventarioService'

type FiltroTipo = 'TODOS' | TipoMovimiento
type FiltroMotivo = 'TODOS' | MotivoMovimiento

function ControlMovimientoInventario() {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [inventarios, setInventarios] = useState<Inventario[]>([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODOS')
  const [filtroMotivo, setFiltroMotivo] = useState<FiltroMotivo>('TODOS')

  const [formularioAbierto, setFormularioAbierto] = useState(false)

  const [movimientoSeleccionado, setMovimientoSeleccionado] =
    useState<MovimientoInventario | null>(null)

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

  const cargarDatos = async () => {
    setCargando(true)
    setError('')

    try {
      const [movimientosRecibidos, inventariosRecibidos] =
        await Promise.all([
          obtenerMovimientosInventario(),
          obtenerInventarios(),
        ])

      setMovimientos(movimientosRecibidos)
      setInventarios(inventariosRecibidos)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar los movimientos de inventario.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const sucursales = useMemo(() => {
    const mapaSucursales = new Map()

    inventarios.forEach((inventario) => {
      mapaSucursales.set(inventario.sucursal.id_sucursal, inventario.sucursal)
    })

    return Array.from(mapaSucursales.values())
  }, [inventarios])

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return movimientos.filter((movimiento) => {
      const coincideSucursal =
        filtroSucursal === 'TODAS' ||
        movimiento.inventario.id_sucursal === Number(filtroSucursal)

      const coincideTipo =
        filtroTipo === 'TODOS' ||
        movimiento.tipo_movimiento === filtroTipo

      const coincideMotivo =
        filtroMotivo === 'TODOS' || movimiento.motivo === filtroMotivo

      const nombreUsuario =
        `${movimiento.usuario.nombre} ${movimiento.usuario.apellido}`.toLowerCase()

      const coincideBusqueda =
        texto === '' ||
        movimiento.inventario.medicamento.codigo
          .toLowerCase()
          .includes(texto) ||
        movimiento.inventario.medicamento.nombre
          .toLowerCase()
          .includes(texto) ||
        movimiento.inventario.medicamento.principio_activo
          .toLowerCase()
          .includes(texto) ||
        movimiento.inventario.sucursal.codigo
          .toLowerCase()
          .includes(texto) ||
        movimiento.inventario.sucursal.nombre
          .toLowerCase()
          .includes(texto) ||
        nombreUsuario.includes(texto) ||
        movimiento.referencia?.toLowerCase().includes(texto) ||
        movimiento.observacion?.toLowerCase().includes(texto)

      return (
        coincideSucursal &&
        coincideTipo &&
        coincideMotivo &&
        coincideBusqueda
      )
    })
  }, [
    movimientos,
    busqueda,
    filtroSucursal,
    filtroTipo,
    filtroMotivo,
  ])

  const totalMovimientos = movimientos.length

  const totalEntradas = movimientos.filter(
    (movimiento) => movimiento.tipo_movimiento === 'ENTRADA',
  ).length

  const totalSalidas = movimientos.filter(
    (movimiento) => movimiento.tipo_movimiento === 'SALIDA',
  ).length

  const unidadesMovidas = movimientos.reduce(
    (total, movimiento) => total + movimiento.cantidad,
    0,
  )

  const abrirFormulario = () => {
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(false)
    setErrorFormulario('')
  }

  const guardarMovimiento = async (
    datos: CrearMovimientoInventario,
  ) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      await crearMovimientoInventario(datos)

      setFormularioAbierto(false)

      await cargarDatos()
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          'Ocurrió un error al registrar el movimiento.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroSucursal('TODAS')
    setFiltroTipo('TODOS')
    setFiltroMotivo('TODOS')
  }

  const hayFiltros =
    busqueda !== '' ||
    filtroSucursal !== 'TODAS' ||
    filtroTipo !== 'TODOS' ||
    filtroMotivo !== 'TODOS'

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Movimientos de inventario
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Registra y consulta las entradas y salidas de medicamentos de las
            sucursales.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={cargarDatos}
            disabled={cargando}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={abrirFormulario}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Registrar movimiento
          </Button>
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando movimientos" />}

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
        <ResumenMovimiento
          titulo="Total movimientos"
          valor={totalMovimientos}
          icono={<SwapVertRoundedIcon />}
          color="primary.main"
        />

        <ResumenMovimiento
          titulo="Entradas registradas"
          valor={totalEntradas}
          icono={<TrendingUpRoundedIcon />}
          color="success.main"
        />

        <ResumenMovimiento
          titulo="Salidas registradas"
          valor={totalSalidas}
          icono={<TrendingDownRoundedIcon />}
          color="error.main"
        />

        <ResumenMovimiento
          titulo="Unidades movilizadas"
          valor={unidadesMovidas}
          icono={<InventoryRoundedIcon />}
          color="secondary.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              placeholder="Buscar medicamento, sucursal, usuario, referencia u observación..."
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
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              sx={{
                alignItems: {
                  xs: 'stretch',
                  lg: 'center',
                },
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="filtro-sucursal-movimiento-label">
                  Sucursal
                </InputLabel>

                <Select
                  labelId="filtro-sucursal-movimiento-label"
                  label="Sucursal"
                  value={filtroSucursal}
                  onChange={(event) =>
                    setFiltroSucursal(event.target.value)
                  }
                >
                  <MenuItem value="TODAS">Todas las sucursales</MenuItem>

                  {sucursales.map((sucursal) => (
                    <MenuItem
                      key={sucursal.id_sucursal}
                      value={sucursal.id_sucursal.toString()}
                    >
                      {sucursal.codigo} - {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="filtro-tipo-movimiento-label">
                  Tipo
                </InputLabel>

                <Select
                  labelId="filtro-tipo-movimiento-label"
                  label="Tipo"
                  value={filtroTipo}
                  onChange={(event) =>
                    setFiltroTipo(event.target.value as FiltroTipo)
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ENTRADA">Entradas</MenuItem>
                  <MenuItem value="SALIDA">Salidas</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="filtro-motivo-movimiento-label">
                  Motivo
                </InputLabel>

                <Select
                  labelId="filtro-motivo-movimiento-label"
                  label="Motivo"
                  value={filtroMotivo}
                  onChange={(event) =>
                    setFiltroMotivo(event.target.value as FiltroMotivo)
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="COMPRA">Compra</MenuItem>
                  <MenuItem value="VENTA">Venta</MenuItem>
                  <MenuItem value="TRASLADO">Traslado</MenuItem>
                  <MenuItem value="AJUSTE">Ajuste</MenuItem>
                  <MenuItem value="DEVOLUCION">Devolución</MenuItem>
                </Select>
              </FormControl>

              {hayFiltros && (
                <Button
                  variant="text"
                  onClick={limpiarFiltros}
                  sx={{
                    minWidth: 130,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && movimientosFiltrados.length > 0 && (
        <>
          <Typography color="text.secondary">
            Mostrando {movimientosFiltrados.length} de {movimientos.length}{' '}
            movimientos.
          </Typography>

          <MovimientosInventarioTable
            movimientos={movimientosFiltrados}
            onVerDetalle={setMovimientoSeleccionado}
          />
        </>
      )}

      {!cargando && movimientosFiltrados.length === 0 && !error && (
        <Alert severity="info">
          {movimientos.length === 0
            ? 'No hay movimientos de inventario registrados.'
            : 'No se encontraron movimientos que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      <MovimientoInventarioForm
        abierto={formularioAbierto}
        inventarios={inventarios}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarMovimiento}
      />

      <Dialog
        open={movimientoSeleccionado !== null}
        onClose={() => setMovimientoSeleccionado(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Detalle del movimiento
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
                  icon={
                    movimientoSeleccionado.tipo_movimiento === 'ENTRADA' ? (
                      <TrendingUpRoundedIcon />
                    ) : (
                      <TrendingDownRoundedIcon />
                    )
                  }
                  label={movimientoSeleccionado.tipo_movimiento}
                  color={
                    movimientoSeleccionado.tipo_movimiento === 'ENTRADA'
                      ? 'success'
                      : 'error'
                  }
                  sx={{ fontWeight: 700 }}
                />

                <Chip
                  label={movimientoSeleccionado.motivo}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />

                <Typography variant="body2" color="text.secondary">
                  Movimiento #{movimientoSeleccionado.id_movimiento}
                </Typography>
              </Stack>

              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                }}
              >
                <DetalleMovimiento
                  icono={<BusinessRoundedIcon />}
                  titulo="Sucursal"
                  valor={movimientoSeleccionado.inventario.sucursal.nombre}
                />

                <DetalleMovimiento
                  icono={<InventoryRoundedIcon />}
                  titulo="Medicamento"
                  valor={
                    movimientoSeleccionado.inventario.medicamento.nombre
                  }
                />

                <DetalleMovimiento
                  icono={<PersonRoundedIcon />}
                  titulo="Usuario responsable"
                  valor={`${movimientoSeleccionado.usuario.nombre} ${movimientoSeleccionado.usuario.apellido}`}
                />

                <DetalleMovimiento
                  icono={<SwapVertRoundedIcon />}
                  titulo="Cantidad"
                  valor={`${movimientoSeleccionado.cantidad} unidades`}
                />
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                  }}
                >
                  Cambio de existencias
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  <ResumenDetalle
                    titulo="Stock anterior"
                    valor={movimientoSeleccionado.stock_anterior}
                  />

                  <ResumenDetalle
                    titulo={
                      movimientoSeleccionado.tipo_movimiento === 'ENTRADA'
                        ? 'Entrada'
                        : 'Salida'
                    }
                    valor={movimientoSeleccionado.cantidad}
                  />

                  <ResumenDetalle
                    titulo="Stock nuevo"
                    valor={movimientoSeleccionado.stock_nuevo}
                  />
                </Box>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Referencia
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                    {movimientoSeleccionado.referencia ||
                      'Sin referencia registrada'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rol del usuario
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                    {movimientoSeleccionado.usuario.rol?.nombre ||
                      'Sin rol disponible'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Observación
                </Typography>

                <Typography sx={{ mt: 0.5 }}>
                  {movimientoSeleccionado.observacion ||
                    'Sin observaciones registradas.'}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMovimientoSeleccionado(null)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

interface ResumenMovimientoProps {
  titulo: string
  valor: number
  icono: ReactNode
  color: string
}

function ResumenMovimiento({
  titulo,
  valor,
  icono,
  color,
}: ResumenMovimientoProps) {
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
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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

          <Box>
            <Typography variant="body2" color="text.secondary">
              {titulo}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {valor}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

interface DetalleMovimientoProps {
  icono: ReactNode
  titulo: string
  valor: string
}

function DetalleMovimiento({
  icono,
  titulo,
  valor,
}: DetalleMovimientoProps) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: 'action.selected',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icono}
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          {titulo}
        </Typography>

        <Typography sx={{ mt: 0.25, fontWeight: 600 }}>
          {valor}
        </Typography>
      </Box>
    </Stack>
  )
}

interface ResumenDetalleProps {
  titulo: string
  valor: number
}

function ResumenDetalle({
  titulo,
  valor,
}: ResumenDetalleProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: 'action.hover',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {titulo}
      </Typography>

      <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
        {valor}
      </Typography>
    </Box>
  )
}

export default ControlMovimientoInventario