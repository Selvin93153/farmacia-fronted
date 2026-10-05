import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  Button,
} from '@mui/material'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'

import { obtenerSesion } from '../auth/authService'
import { obtenerCajas, obtenerCajasMiSucursal, type Caja } from '../caja/cajasService'
import { obtenerFormasPago, type FormaPago } from '../formas-pago/formasPagoService'
import VentaForm from './VentaForm'
import {
  crearVenta,
  obtenerVentas,
  obtenerVentasMiSucursal,
  type CrearVenta,
  type Venta,
} from './ventasService'

// Transforma los errores del backend en mensajes comprensibles.
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

  // Determina el alcance de las consultas según la sucursal de la sesión.
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const sesion = await obtenerSesion()
      const alcanceGeneral = sesion.id_sucursal === null

      const [ventasRecibidas, cajasRecibidas, formasPagoRecibidas] = await Promise.all([
        alcanceGeneral ? obtenerVentas() : obtenerVentasMiSucursal(),
        alcanceGeneral ? obtenerCajas() : obtenerCajasMiSucursal(),
        obtenerFormasPago(),
      ])

      setVentas(ventasRecibidas)
      setCajas(cajasRecibidas)
      setFormasPago(formasPagoRecibidas)
    } catch (error: unknown) {
      setError(obtenerMensajeError(error, 'Ocurrió un error al consultar las ventas.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  const totalVentas = ventas.length
  const ventasCompletadas = ventas.filter((venta) => venta.estado === 'COMPLETADA').length
  const ventasBorrador = ventas.filter((venta) => venta.estado === 'BORRADOR').length
  const totalVendido = ventas
    .filter((venta) => venta.estado === 'COMPLETADA')
    .reduce((acumulado, venta) => acumulado + venta.total, 0)

  const formatearMoneda = (valor: number) =>
    new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor)

  const abrirNuevaVenta = () => {
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) return

    setFormularioAbierto(false)
    setErrorFormulario('')
  }

  // Crea un borrador y abre el punto de venta existente.
  const guardarVenta = async (datos: CrearVenta) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      const ventaCreada = await crearVenta(datos)
      setFormularioAbierto(false)
      navigate(`/app/ventas/${ventaCreada.id_venta}/detalle`)
    } catch (error: unknown) {
      setErrorFormulario(obtenerMensajeError(error, 'Ocurrió un error al iniciar la venta.'))
    } finally {
      setGuardando(false)
    }
  }

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
            Ventas
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Registra ventas y consulta las operaciones realizadas en SIGFAR.
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

      {cargando && <LinearProgress aria-label="Cargando ventas" />}
      {error && <Alert severity="error">{error}</Alert>}

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

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          ¿Qué deseas hacer?
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
          Inicia una venta o consulta el historial y las ventas pendientes.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2.5,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: 'primary.light',
              transition: '0.2s',
              '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            }}
          >
            <CardActionArea
              onClick={abrirNuevaVenta}
              disabled={cargando || Boolean(error)}
              sx={{ p: 3, minHeight: 190, height: '100%' }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: 2.5,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AddRoundedIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Nueva venta
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Registra una operación y agrega los medicamentos que el cliente necesita.
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Iniciar venta
                    </Typography>
                    <ArrowForwardRoundedIcon fontSize="small" />
                  </Stack>
                </Box>
              </Stack>
            </CardActionArea>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              transition: '0.2s',
              '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            }}
          >
            <CardActionArea
              onClick={() => navigate('/app/ventas/realizadas')}
              sx={{ p: 3, minHeight: 190, height: '100%' }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: 2.5,
                    bgcolor: 'success.main',
                    color: 'common.white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <HistoryRoundedIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Ventas realizadas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Consulta ventas completadas o en borrador y filtra el historial por fecha.
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Ver historial
                    </Typography>
                    <ArrowForwardRoundedIcon fontSize="small" />
                  </Stack>
                </Box>
              </Stack>
            </CardActionArea>
          </Card>
        </Box>
      </Box>

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

function ResumenVenta({ titulo, valor, icono, color }: ResumenVentaProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        transition: '0.2s',
        '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
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
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {titulo}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, wordBreak: 'break-word' }}>
              {valor}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ControlVenta
