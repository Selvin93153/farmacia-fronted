import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PaidRoundedIcon from '@mui/icons-material/PaidRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import {
  obtenerEmpleados,
  type Empleado,
} from '../empleados/empleadosService'

import {
  obtenerPlanilla,
  type EstadoPlanilla,
  type Planilla,
} from '../planillas/planillasService'

import DetallePlanillaForm from './DetallePlanillaForm'
import DetallesPlanillaTable from './DetallesPlanillaTable'

import {
  actualizarDetallePlanilla,
  crearDetallePlanilla,
  obtenerDetallesPlanilla,
  type ActualizarDetallePlanilla,
  type CrearDetallePlanilla,
  type DetallePlanilla,
} from './detallesPlanillaService'

const nombresMeses = [
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

function ControlDetallePlanilla() {
  const { id } = useParams()
  const navigate = useNavigate()

  const idPlanilla = Number(id)

  const [planilla, setPlanilla] = useState<Planilla | null>(null)
  const [detalles, setDetalles] = useState<DetallePlanilla[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [busqueda, setBusqueda] = useState('')

  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [detalleEditando, setDetalleEditando] =
    useState<DetallePlanilla | null>(null)

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
    if (!Number.isInteger(idPlanilla) || idPlanilla < 1) {
      setError('El identificador de la planilla no es válido.')
      setCargando(false)
      return
    }

    setCargando(true)
    setError('')

    try {
      const [
        planillaRecibida,
        detallesRecibidos,
        empleadosRecibidos,
      ] = await Promise.all([
        obtenerPlanilla(idPlanilla),
        obtenerDetallesPlanilla(),
        obtenerEmpleados(),
      ])

      setPlanilla(planillaRecibida)

      setDetalles(
        detallesRecibidos.filter(
          (detalle) => detalle.id_planilla === idPlanilla,
        ),
      )

      setEmpleados(empleadosRecibidos)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar el detalle de la planilla.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [id])

  const editable = planilla?.estado === 'BORRADOR'

  const empleadosDisponibles = useMemo(() => {
    if (!planilla) {
      return []
    }

    const empleadosIncluidos = new Set(
      detalles.map((detalle) => detalle.id_empleado),
    )

    return empleados.filter(
      (empleado) =>
        empleado.estado === 'ACTIVO' &&
        empleado.id_sucursal === planilla.id_sucursal &&
        !empleadosIncluidos.has(empleado.id_empleado),
    )
  }, [empleados, detalles, planilla])

  const detallesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) {
      return detalles
    }

    return detalles.filter((detalle) => {
      const nombreCompleto =
        `${detalle.empleado.nombres} ${detalle.empleado.apellidos}`.toLowerCase()

      return (
        detalle.empleado.codigo_empleado.toLowerCase().includes(texto) ||
        nombreCompleto.includes(texto) ||
        detalle.empleado.puesto.toLowerCase().includes(texto)
      )
    })
  }, [detalles, busqueda])

  const totalSalarios = detalles.reduce(
    (total, detalle) => total + detalle.salario_base,
    0,
  )

  const totalBonificaciones = detalles.reduce(
    (total, detalle) => total + detalle.bonificaciones,
    0,
  )

  const totalDescuentos = detalles.reduce(
    (total, detalle) => total + detalle.descuentos,
    0,
  )

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(valor)
  }

  const obtenerColorEstado = (
    estado: EstadoPlanilla,
  ): 'warning' | 'info' | 'success' => {
    if (estado === 'PAGADA') {
      return 'success'
    }

    if (estado === 'GENERADA') {
      return 'info'
    }

    return 'warning'
  }

  const abrirNuevoDetalle = () => {
    setDetalleEditando(null)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const abrirEditarDetalle = (detalle: DetallePlanilla) => {
    if (!editable) {
      return
    }

    setDetalleEditando(detalle)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(false)
    setDetalleEditando(null)
    setErrorFormulario('')
  }

  const guardarDetalle = async (
    datos: CrearDetallePlanilla | ActualizarDetallePlanilla,
  ) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      if (detalleEditando) {
        await actualizarDetallePlanilla(
          detalleEditando.id_detalle_planilla,
          datos as ActualizarDetallePlanilla,
        )
      } else {
        await crearDetallePlanilla(datos as CrearDetallePlanilla)
      }

      setFormularioAbierto(false)
      setDetalleEditando(null)

      await cargarDatos()
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          detalleEditando
            ? 'Ocurrió un error al actualizar el detalle de planilla.'
            : 'Ocurrió un error al agregar el empleado a la planilla.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <Stack spacing={2}>
        <LinearProgress />

        <Typography color="text.secondary">
          Cargando detalle de planilla...
        </Typography>
      </Stack>
    )
  }

  if (!planilla) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {error || 'No se encontró la planilla solicitada.'}
        </Alert>

        <Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/app/planillas')}
          >
            Volver a planillas
          </Button>
        </Box>
      </Stack>
    )
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
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/app/planillas')}
            sx={{
              mb: 1,
              textTransform: 'none',
            }}
          >
            Volver a planillas
          </Button>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Detalle de planilla
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Administra los empleados y pagos asociados a esta planilla.
          </Typography>
        </Box>

        {editable && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={abrirNuevoDetalle}
            disabled={empleadosDisponibles.length === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Agregar empleado
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 4,
          p: {
            xs: 2.5,
            md: 3,
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={3}
          sx={{
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              lg: 'center',
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BusinessRoundedIcon />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                {planilla.sucursal.codigo}
              </Typography>

              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {planilla.sucursal.nombre}
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {nombresMeses[planilla.mes - 1]} {planilla.anio}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>

              <Chip
                label={planilla.estado}
                color={obtenerColorEstado(planilla.estado)}
                sx={{
                  mt: 0.5,
                  fontWeight: 700,
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Total de planilla
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontWeight: 800,
                  color: 'success.main',
                }}
              >
                {formatearMoneda(planilla.total_planilla)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {!editable && (
        <Alert severity="info">
          Esta planilla se encuentra en estado {planilla.estado}. Sus detalles
          son de solo lectura y ya no pueden modificarse.
        </Alert>
      )}

      {editable && empleadosDisponibles.length === 0 && detalles.length > 0 && (
        <Alert severity="info">
          Todos los empleados activos de esta sucursal ya están incluidos en la
          planilla.
        </Alert>
      )}

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
        <ResumenDetalle
          titulo="Empleados incluidos"
          valor={detalles.length.toString()}
          icono={<GroupsRoundedIcon />}
          color="primary.main"
        />

        <ResumenDetalle
          titulo="Salarios base"
          valor={formatearMoneda(totalSalarios)}
          icono={<PaymentsRoundedIcon />}
          color="info.main"
        />

        <ResumenDetalle
          titulo="Bonificaciones"
          valor={formatearMoneda(totalBonificaciones)}
          icono={<PaidRoundedIcon />}
          color="success.main"
        />

        <ResumenDetalle
          titulo="Descuentos"
          valor={formatearMoneda(totalDescuentos)}
          icono={<RemoveCircleOutlineRoundedIcon />}
          color="warning.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <TextField
            placeholder="Buscar por código, nombre o puesto del empleado..."
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
        </CardContent>
      </Card>

      {!cargando && detallesFiltrados.length > 0 && (
        <>
          <Typography color="text.secondary">
            Mostrando {detallesFiltrados.length} de {detalles.length} empleados
            incluidos.
          </Typography>

          <DetallesPlanillaTable
            detalles={detallesFiltrados}
            editable={editable}
            onEditar={abrirEditarDetalle}
          />
        </>
      )}

      {detallesFiltrados.length === 0 && (
        <Alert severity="info">
          {detalles.length === 0
            ? 'Esta planilla todavía no tiene empleados registrados.'
            : 'No se encontraron empleados que coincidan con la búsqueda.'}
        </Alert>
      )}

      <DetallePlanillaForm
        abierto={formularioAbierto}
        idPlanilla={planilla.id_planilla}
        detalle={detalleEditando}
        empleados={empleadosDisponibles}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarDetalle}
      />
    </Stack>
  )
}

interface ResumenDetalleProps {
  titulo: string
  valor: string
  icono: ReactNode
  color: string
}

function ResumenDetalle({
  titulo,
  valor,
  icono,
  color,
}: ResumenDetalleProps) {
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

            <Typography
              variant="h5"
              sx={{
                mt: 0.25,
                fontWeight: 800,
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

export default ControlDetallePlanilla