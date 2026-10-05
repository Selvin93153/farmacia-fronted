import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import { obtenerSesion } from '../auth/authService'
import { obtenerFormasPago, type FormaPago } from '../formas-pago/formasPagoService'
import VentasTable from './VentasTable'
import { obtenerVentas, obtenerVentasMiSucursal, type Venta } from './ventasService'

type FiltroEstado = 'TODOS' | 'BORRADOR' | 'COMPLETADA'

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

// Convierte los errores de consultas en mensajes visibles al usuario.
function obtenerMensajeError(error: unknown, mensajePredeterminado: string): string {
  if (axios.isAxiosError(error)) {
    const mensajeBackend = error.response?.data?.message

    if (Array.isArray(mensajeBackend)) return mensajeBackend.join(', ')
    if (typeof mensajeBackend === 'string') return mensajeBackend
    if (error.response) return `El backend respondió con error HTTP ${error.response.status}.`

    return 'No se pudo establecer comunicación con el servidor.'
  }

  if (error instanceof Error) return error.message
  return mensajePredeterminado
}

function ControlVentasRealizadas() {
  const navigate = useNavigate()

  const [ventas, setVentas] = useState<Venta[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS')
  const [filtroFormaPago, setFiltroFormaPago] = useState('TODAS')
  const [filtroMes, setFiltroMes] = useState('TODOS')
  const [filtroAnio, setFiltroAnio] = useState('TODOS')

  // Consulta las ventas autorizadas según la sucursal del usuario en sesión.
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const sesion = await obtenerSesion()
      const [ventasRecibidas, formasPagoRecibidas] = await Promise.all([
        sesion.id_sucursal === null ? obtenerVentas() : obtenerVentasMiSucursal(),
        obtenerFormasPago(),
      ])

      setVentas(ventasRecibidas)
      setFormasPago(formasPagoRecibidas)
    } catch (error: unknown) {
      setError(obtenerMensajeError(error, 'Ocurrió un error al cargar el historial de ventas.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  const aniosDisponibles = useMemo(() => {
    const anios = new Set(
      ventas
        .map((venta) => new Date(venta.fecha).getFullYear())
        .filter((anio) => Number.isFinite(anio)),
    )

    return Array.from(anios).sort((a, b) => b - a)
  }, [ventas])

  // Filtra el historial por texto, estado, pago y mes/año de la fecha de venta.
  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return ventas.filter((venta) => {
      const fecha = new Date(venta.fecha)
      const coincideEstado = filtroEstado === 'TODOS' || venta.estado === filtroEstado
      const coincidePago =
        filtroFormaPago === 'TODAS' || venta.id_forma_pago === Number(filtroFormaPago)
      const coincideMes = filtroMes === 'TODOS' || fecha.getMonth() + 1 === Number(filtroMes)
      const coincideAnio = filtroAnio === 'TODOS' || fecha.getFullYear() === Number(filtroAnio)
      const nombreCajero = `${venta.usuario.nombre} ${venta.usuario.apellido}`.toLowerCase()
      const coincideBusqueda =
        texto === '' ||
        venta.id_venta.toString().includes(texto) ||
        venta.sucursal.nombre.toLowerCase().includes(texto) ||
        venta.sucursal.codigo.toLowerCase().includes(texto) ||
        venta.caja.nombre.toLowerCase().includes(texto) ||
        nombreCajero.includes(texto) ||
        venta.forma_pago.nombre.toLowerCase().includes(texto)

      return coincideEstado && coincidePago && coincideMes && coincideAnio && coincideBusqueda
    })
  }, [ventas, busqueda, filtroEstado, filtroFormaPago, filtroMes, filtroAnio])

  const hayFiltros =
    busqueda.trim() !== '' ||
    filtroEstado !== 'TODOS' ||
    filtroFormaPago !== 'TODAS' ||
    filtroMes !== 'TODOS' ||
    filtroAnio !== 'TODOS'

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroFormaPago('TODAS')
    setFiltroMes('TODOS')
    setFiltroAnio('TODOS')
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
      >
        <Box>
          <Button
            size="small"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/app/ventas')}
            sx={{ mb: 1, textTransform: 'none' }}
          >
            Volver a Ventas
          </Button>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <HistoryRoundedIcon color="primary" fontSize="large" />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
              Ventas realizadas
            </Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta el historial, incluyendo ventas completadas y borradores pendientes.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => void cargarDatos()}
          disabled={cargando}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Actualizar
        </Button>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando historial de ventas" />}
      {error && <Alert severity="error">{error}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Buscar y filtrar ventas
            </Typography>

            <TextField
              placeholder="Buscar por número de venta, sucursal, caja, cajero o forma de pago..."
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

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="historial-estado-label">Estado</InputLabel>
                <Select
                  labelId="historial-estado-label"
                  label="Estado"
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value as FiltroEstado)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="BORRADOR">Borrador</MenuItem>
                  <MenuItem value="COMPLETADA">Completada</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="historial-pago-label">Forma de pago</InputLabel>
                <Select
                  labelId="historial-pago-label"
                  label="Forma de pago"
                  value={filtroFormaPago}
                  onChange={(event) => setFiltroFormaPago(event.target.value)}
                >
                  <MenuItem value="TODAS">Todas</MenuItem>
                  {formasPago.map((formaPago) => (
                    <MenuItem
                      key={formaPago.id_forma_pago}
                      value={formaPago.id_forma_pago.toString()}
                    >
                      {formaPago.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="historial-mes-label">Mes</InputLabel>
                <Select
                  labelId="historial-mes-label"
                  label="Mes"
                  value={filtroMes}
                  onChange={(event) => setFiltroMes(event.target.value)}
                >
                  <MenuItem value="TODOS">Todos los meses</MenuItem>
                  {MESES.map((mes, indice) => (
                    <MenuItem key={mes} value={String(indice + 1)}>
                      {mes}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="historial-anio-label">Año</InputLabel>
                <Select
                  labelId="historial-anio-label"
                  label="Año"
                  value={filtroAnio}
                  onChange={(event) => setFiltroAnio(event.target.value)}
                >
                  <MenuItem value="TODOS">Todos los años</MenuItem>
                  {aniosDisponibles.map((anio) => (
                    <MenuItem key={anio} value={String(anio)}>
                      {anio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {hayFiltros && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
              >
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {filtroMes !== 'TODOS' && (
                    <Chip
                      label={`Mes: ${MESES[Number(filtroMes) - 1]}`}
                      size="small"
                      onDelete={() => setFiltroMes('TODOS')}
                    />
                  )}
                  {filtroAnio !== 'TODOS' && (
                    <Chip
                      label={`Año: ${filtroAnio}`}
                      size="small"
                      onDelete={() => setFiltroAnio('TODOS')}
                    />
                  )}
                  {filtroEstado !== 'TODOS' && (
                    <Chip
                      label={`Estado: ${filtroEstado}`}
                      size="small"
                      onDelete={() => setFiltroEstado('TODOS')}
                    />
                  )}
                  {filtroFormaPago !== 'TODAS' && (
                    <Chip
                      label={`Pago: ${formasPago.find((formaPago) =>
                        formaPago.id_forma_pago === Number(filtroFormaPago),
                      )?.nombre ?? ''}`}
                      size="small"
                      onDelete={() => setFiltroFormaPago('TODAS')}
                    />
                  )}
                </Stack>
                <Button onClick={limpiarFiltros} sx={{ textTransform: 'none' }}>
                  Limpiar filtros
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {!cargando && !error && (
        <>
          <Typography color="text.secondary" variant="body2">
            Mostrando {ventasFiltradas.length} de {ventas.length} ventas.
          </Typography>

          {ventasFiltradas.length > 0 ? (
            <VentasTable
              ventas={ventasFiltradas}
              onAbrirVenta={(venta) => navigate(`/app/ventas/${venta.id_venta}/detalle`)}
            />
          ) : (
            <Alert severity="info">
              {ventas.length === 0
                ? 'No hay ventas registradas.'
                : 'No se encontraron ventas que coincidan con los filtros aplicados.'}
            </Alert>
          )}
        </>
      )}
    </Stack>
  )
}

export default ControlVentasRealizadas
