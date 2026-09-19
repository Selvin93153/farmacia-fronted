import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import PaidRoundedIcon from '@mui/icons-material/PaidRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import {
  obtenerSucursales,
  type Sucursal,
} from '../sucursales/sucursalesService'

import PlanillaForm from './PlanillaForm'
import PlanillasTable from './PlanillasTable'

import {
  actualizarPlanilla,
  crearPlanilla,
  obtenerPlanillas,
  type ActualizarPlanilla,
  type CrearPlanilla,
  type EstadoPlanilla,
  type Planilla,
} from './planillasService'

type FiltroEstado = 'TODOS' | EstadoPlanilla

function ControlPlanilla() {
  const navigate = useNavigate()

  const [planillas, setPlanillas] = useState<Planilla[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS')
  const [filtroAnio, setFiltroAnio] = useState('TODOS')

  const [formularioAbierto, setFormularioAbierto] = useState(false)

  const [planillaEditando, setPlanillaEditando] =
    useState<Planilla | null>(null)

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
      const [planillasRecibidas, sucursalesRecibidas] = await Promise.all([
        obtenerPlanillas(),
        obtenerSucursales(),
      ])

      setPlanillas(planillasRecibidas)
      setSucursales(sucursalesRecibidas)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar la información de planillas.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const aniosDisponibles = useMemo(() => {
    return [...new Set(planillas.map((planilla) => planilla.anio))].sort(
      (a, b) => b - a,
    )
  }, [planillas])

  const planillasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return planillas.filter((planilla) => {
      const coincideSucursal =
        filtroSucursal === 'TODAS' ||
        planilla.id_sucursal === Number(filtroSucursal)

      const coincideEstado =
        filtroEstado === 'TODOS' || planilla.estado === filtroEstado

      const coincideAnio =
        filtroAnio === 'TODOS' || planilla.anio === Number(filtroAnio)

      const coincideBusqueda =
        texto === '' ||
        planilla.sucursal.nombre.toLowerCase().includes(texto) ||
        planilla.sucursal.codigo.toLowerCase().includes(texto) ||
        planilla.anio.toString().includes(texto)

      return (
        coincideSucursal &&
        coincideEstado &&
        coincideAnio &&
        coincideBusqueda
      )
    })
  }, [
    planillas,
    busqueda,
    filtroSucursal,
    filtroEstado,
    filtroAnio,
  ])

  const totalPlanillas = planillas.length

  const totalBorradores = planillas.filter(
    (planilla) => planilla.estado === 'BORRADOR',
  ).length

  const totalGeneradas = planillas.filter(
    (planilla) => planilla.estado === 'GENERADA',
  ).length

  const totalPagadas = planillas.filter(
    (planilla) => planilla.estado === 'PAGADA',
  ).length

  const abrirNuevaPlanilla = () => {
    setPlanillaEditando(null)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const abrirEditarPlanilla = (planilla: Planilla) => {
    setPlanillaEditando(planilla)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const abrirDetallePlanilla = (planilla: Planilla) => {
    navigate(`/app/planillas/${planilla.id_planilla}/detalle`)
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(false)
    setPlanillaEditando(null)
    setErrorFormulario('')
  }

  const guardarPlanilla = async (
    datos: CrearPlanilla | ActualizarPlanilla,
  ) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      if (planillaEditando) {
        await actualizarPlanilla(
          planillaEditando.id_planilla,
          datos as ActualizarPlanilla,
        )
      } else {
        await crearPlanilla(datos as CrearPlanilla)
      }

      setFormularioAbierto(false)
      setPlanillaEditando(null)

      await cargarDatos()
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          planillaEditando
            ? 'Ocurrió un error al actualizar la planilla.'
            : 'Ocurrió un error al crear la planilla.',
        ),
      )
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
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Planillas
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Administra los períodos de planilla de las sucursales de SIGFAR.
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
            onClick={abrirNuevaPlanilla}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Nueva planilla
          </Button>
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando planillas" />}

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
        <ResumenPlanilla
          titulo="Total planillas"
          valor={totalPlanillas}
          icono={<DescriptionRoundedIcon />}
          color="primary.main"
        />

        <ResumenPlanilla
          titulo="Borradores"
          valor={totalBorradores}
          icono={<HourglassTopRoundedIcon />}
          color="warning.main"
        />

        <ResumenPlanilla
          titulo="Generadas"
          valor={totalGeneradas}
          icono={<CheckCircleRoundedIcon />}
          color="info.main"
        />

        <ResumenPlanilla
          titulo="Pagadas"
          valor={totalPagadas}
          icono={<PaidRoundedIcon />}
          color="success.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              placeholder="Buscar por sucursal, código o año..."
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

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="filtro-sucursal-planilla-label">
                  Sucursal
                </InputLabel>

                <Select
                  labelId="filtro-sucursal-planilla-label"
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
                <InputLabel id="filtro-estado-planilla-label">
                  Estado
                </InputLabel>

                <Select
                  labelId="filtro-estado-planilla-label"
                  label="Estado"
                  value={filtroEstado}
                  onChange={(event) =>
                    setFiltroEstado(event.target.value as FiltroEstado)
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="BORRADOR">Borrador</MenuItem>
                  <MenuItem value="GENERADA">Generada</MenuItem>
                  <MenuItem value="PAGADA">Pagada</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="filtro-anio-planilla-label">
                  Año
                </InputLabel>

                <Select
                  labelId="filtro-anio-planilla-label"
                  label="Año"
                  value={filtroAnio}
                  onChange={(event) => setFiltroAnio(event.target.value)}
                >
                  <MenuItem value="TODOS">Todos los años</MenuItem>

                  {aniosDisponibles.map((anio) => (
                    <MenuItem key={anio} value={anio.toString()}>
                      {anio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && planillasFiltradas.length > 0 && (
        <>
          <Typography color="text.secondary">
            Mostrando {planillasFiltradas.length} de {planillas.length}{' '}
            planillas.
          </Typography>

          <PlanillasTable
            planillas={planillasFiltradas}
            onEditar={abrirEditarPlanilla}
            onVerDetalle={abrirDetallePlanilla}
          />
        </>
      )}

      {!cargando && planillasFiltradas.length === 0 && !error && (
        <Alert severity="info">
          {planillas.length === 0
            ? 'No hay planillas registradas.'
            : 'No se encontraron planillas que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      <PlanillaForm
        abierto={formularioAbierto}
        planilla={planillaEditando}
        sucursales={sucursales}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarPlanilla}
      />
    </Stack>
  )
}

interface ResumenPlanillaProps {
  titulo: string
  valor: number
  icono: ReactNode
  color: string
}

function ResumenPlanilla({
  titulo,
  valor,
  icono,
  color,
}: ResumenPlanillaProps) {
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

export default ControlPlanilla