import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'

import VentaForm from './VentaForm'
import VentasTable from './VentasTable'

import {
  crearVenta,
  obtenerVentas,
  type CrearVenta,
  type Venta,
} from './ventasService'

import {
  obtenerCajas,
  type Caja,
} from '../caja/cajasService'

import {
  obtenerFormasPago,
  type FormaPago,
} from '../formas-pago/formasPagoService'

type FiltroEstado = 'TODOS' | 'BORRADOR' | 'COMPLETADA'

function ControlVenta() {
  const navigate = useNavigate()

  const [ventas, setVentas] = useState<Venta[]>([])
  const [cajas, setCajas] = useState<Caja[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [formularioAbierto, setFormularioAbierto] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>('TODOS')

  const [filtroFormaPago, setFiltroFormaPago] = useState('TODAS')

  // Convierte los errores del backend en mensajes entendibles.
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

  // Carga la información necesaria para administrar las ventas.
  const cargarDatos = async () => {
    setCargando(true)
    setError('')

    try {
      const [
        ventasRecibidas,
        cajasRecibidas,
        formasPagoRecibidas,
      ] = await Promise.all([
        obtenerVentas(),
        obtenerCajas(),
        obtenerFormasPago(),
      ])

      setVentas(ventasRecibidas)
      setCajas(cajasRecibidas)
      setFormasPago(formasPagoRecibidas)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al consultar las ventas.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtra el historial por texto, estado y forma de pago.
  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return ventas.filter((venta) => {
      const coincideEstado =
        filtroEstado === 'TODOS' ||
        venta.estado === filtroEstado

      const coincideFormaPago =
        filtroFormaPago === 'TODAS' ||
        venta.id_forma_pago === Number(filtroFormaPago)

      const nombreCajero =
        `${venta.usuario.nombre} ${venta.usuario.apellido}`.toLowerCase()

      const coincideBusqueda =
        texto === '' ||
        venta.id_venta.toString().includes(texto) ||
        venta.sucursal.nombre.toLowerCase().includes(texto) ||
        venta.sucursal.codigo.toLowerCase().includes(texto) ||
        venta.caja.nombre.toLowerCase().includes(texto) ||
        nombreCajero.includes(texto) ||
        venta.forma_pago.nombre.toLowerCase().includes(texto)

      return (
        coincideEstado &&
        coincideFormaPago &&
        coincideBusqueda
      )
    })
  }, [
    ventas,
    busqueda,
    filtroEstado,
    filtroFormaPago,
  ])

  const totalVentas = ventas.length

  const ventasCompletadas = ventas.filter(
    (venta) => venta.estado === 'COMPLETADA',
  ).length

  const ventasBorrador = ventas.filter(
    (venta) => venta.estado === 'BORRADOR',
  ).length

  const totalVendido = ventas
    .filter((venta) => venta.estado === 'COMPLETADA')
    .reduce((acumulado, venta) => acumulado + venta.total, 0)

  const formasPagoActivas = formasPago.filter(
    (formaPago) => formaPago.estado === 'ACTIVO',
  )

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor)
  }

  const abrirNuevaVenta = () => {
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

  // Crea la venta y abre inmediatamente su punto de venta.
  const guardarVenta = async (datos: CrearVenta) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      const ventaCreada = await crearVenta(datos)

      setFormularioAbierto(false)

      navigate(
        `/app/ventas/${ventaCreada.id_venta}/detalle`,
      )
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          'Ocurrió un error al iniciar la venta.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  // Abre una venta para continuarla o consultar su información.
  const abrirVenta = (venta: Venta) => {
    navigate(`/app/ventas/${venta.id_venta}/detalle`)
  }

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
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 800 }}
          >
            Ventas
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Registra ventas y consulta el historial de
            operaciones realizadas en SIGFAR.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={cargarDatos}
            disabled={cargando}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={abrirNuevaVenta}
            disabled={cargando}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Nueva venta
          </Button>
        </Stack>
      </Stack>

      {cargando && (
        <LinearProgress aria-label="Cargando ventas" />
      )}

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

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
        <ResumenVenta
          titulo="Total de ventas"
          valor={totalVentas.toString()}
          icono={<ShoppingCartRoundedIcon />}
          color="primary.main"
        />

        <ResumenVenta
          titulo="Completadas"
          valor={ventasCompletadas.toString()}
          icono={<CheckCircleRoundedIcon />}
          color="success.main"
        />

        <ResumenVenta
          titulo="En borrador"
          valor={ventasBorrador.toString()}
          icono={<PointOfSaleRoundedIcon />}
          color="warning.main"
        />

        <ResumenVenta
          titulo="Total vendido"
          valor={formatearMoneda(totalVendido)}
          icono={<PaymentsRoundedIcon />}
          color="primary.dark"
        />
      </Box>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <TextField
              placeholder="Buscar por número de venta, sucursal, caja, cajero o forma de pago..."
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
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
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
            >
              <FormControl
                fullWidth
                sx={{ maxWidth: { md: 250 } }}
              >
                <InputLabel id="filtro-estado-venta-label">
                  Estado
                </InputLabel>

                <Select
                  labelId="filtro-estado-venta-label"
                  label="Estado"
                  value={filtroEstado}
                  onChange={(event) =>
                    setFiltroEstado(
                      event.target.value as FiltroEstado,
                    )
                  }
                >
                  <MenuItem value="TODOS">
                    Todos
                  </MenuItem>

                  <MenuItem value="BORRADOR">
                    Borrador
                  </MenuItem>

                  <MenuItem value="COMPLETADA">
                    Completada
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                sx={{ maxWidth: { md: 250 } }}
              >
                <InputLabel id="filtro-forma-pago-label">
                  Forma de pago
                </InputLabel>

                <Select
                  labelId="filtro-forma-pago-label"
                  label="Forma de pago"
                  value={filtroFormaPago}
                  onChange={(event) =>
                    setFiltroFormaPago(event.target.value)
                  }
                >
                  <MenuItem value="TODAS">
                    Todas
                  </MenuItem>

                  {formasPagoActivas.map((formaPago) => (
                    <MenuItem
                      key={formaPago.id_forma_pago}
                      value={formaPago.id_forma_pago.toString()}
                    >
                      {formaPago.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && ventasFiltradas.length > 0 && (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
            }}
          >
            <Typography color="text.secondary">
              Mostrando {ventasFiltradas.length} de{' '}
              {ventas.length} ventas.
            </Typography>

            <Stack direction="row" spacing={1}>
              {filtroEstado !== 'TODOS' && (
                <Chip
                  label={`Estado: ${filtroEstado}`}
                  size="small"
                  onDelete={() =>
                    setFiltroEstado('TODOS')
                  }
                />
              )}

              {filtroFormaPago !== 'TODAS' && (
                <Chip
                  label={`Pago: ${
                    formasPago.find(
                      (formaPago) =>
                        formaPago.id_forma_pago ===
                        Number(filtroFormaPago),
                    )?.nombre ?? ''
                  }`}
                  size="small"
                  onDelete={() =>
                    setFiltroFormaPago('TODAS')
                  }
                />
              )}
            </Stack>
          </Stack>

          <VentasTable
            ventas={ventasFiltradas}
            onAbrirVenta={abrirVenta}
          />
        </>
      )}

      {!cargando &&
        ventasFiltradas.length === 0 &&
        !error && (
          <Alert severity="info">
            {ventas.length === 0
              ? 'No hay ventas registradas.'
              : 'No se encontraron ventas que coincidan con los filtros aplicados.'}
          </Alert>
        )}

      <VentaForm
        abierto={formularioAbierto}
        cajas={cajas}
        formasPago={formasPago}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarVenta}
      />
    </Stack>
  )
}

interface ResumenVentaProps {
  titulo: string
  valor: string
  icono: ReactNode
  color: string
}

function ResumenVenta({
  titulo,
  valor,
  icono,
  color,
}: ResumenVentaProps) {
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
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center' }}
        >
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
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {titulo}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                wordBreak: 'break-word',
              }}
            >
              {valor}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ControlVenta