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
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import {
  obtenerSucursales,
  type Sucursal,
} from '../sucursales/sucursalesService'

import EmpleadoForm from './EmpleadoForm'
import EmpleadosTable from './EmpleadosTable'

import {
  actualizarEmpleado,
  crearEmpleado,
  obtenerEmpleados,
  type ActualizarEmpleado,
  type CrearEmpleado,
  type Empleado,
} from './empleadosService'

function ControlEmpleado() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [empleadoEditando, setEmpleadoEditando] =
    useState<Empleado | null>(null)


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
      const [empleadosRecibidos, sucursalesRecibidas] = await Promise.all([
        obtenerEmpleados(),
        obtenerSucursales(),
      ])

      setEmpleados(empleadosRecibidos)
      setSucursales(sucursalesRecibidas)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar la información de empleados.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const empleadosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return empleados.filter((empleado) => {
      const coincideEstado =
        filtroEstado === 'TODOS' || empleado.estado === filtroEstado

      const coincideSucursal =
        empleado.sucursal?.nombre?.toLowerCase().includes(texto) ?? false

      const coincideBusqueda =
        texto === '' ||
        empleado.codigo_empleado.toLowerCase().includes(texto) ||
        empleado.nombres.toLowerCase().includes(texto) ||
        empleado.apellidos.toLowerCase().includes(texto) ||
        `${empleado.nombres} ${empleado.apellidos}`
          .toLowerCase()
          .includes(texto) ||
        empleado.puesto.toLowerCase().includes(texto) ||
        empleado.telefono.toLowerCase().includes(texto) ||
        coincideSucursal

      return coincideEstado && coincideBusqueda
    })
  }, [empleados, busqueda, filtroEstado])

  const totalEmpleados = empleados.length

  const empleadosActivos = empleados.filter(
    (empleado) => empleado.estado === 'ACTIVO',
  ).length

  const empleadosInactivos = empleados.filter(
    (empleado) => empleado.estado === 'INACTIVO',
  ).length

  const abrirNuevoEmpleado = () => {
    setEmpleadoEditando(null)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const abrirEditarEmpleado = (empleado: Empleado) => {
    setEmpleadoEditando(empleado)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(false)
    setEmpleadoEditando(null)
    setErrorFormulario('')
  }

  const guardarEmpleado = async (
    datos: CrearEmpleado | ActualizarEmpleado,
  ) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      if (empleadoEditando) {
        await actualizarEmpleado(
          empleadoEditando.id_empleado,
          datos as ActualizarEmpleado,
        )
      } else {
        await crearEmpleado(datos as CrearEmpleado)
      }

      setFormularioAbierto(false)
      setEmpleadoEditando(null)

      await cargarDatos()
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          empleadoEditando
            ? 'Ocurrió un error al actualizar el empleado.'
            : 'Ocurrió un error al crear el empleado.',
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
            Empleados
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Administra el personal registrado en las diferentes sucursales de
            SIGFAR.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={cargarDatos}
            disabled={cargando}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={abrirNuevoEmpleado}
          >
            Nuevo empleado
          </Button>
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando empleados" />}

      {error && <Alert severity="error">{error}</Alert>}

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
        <ResumenCard
          titulo="Total empleados"
          valor={totalEmpleados}
          icono={<GroupsRoundedIcon />}
          color="primary.main"
        />

        <ResumenCard
          titulo="Empleados activos"
          valor={empleadosActivos}
          icono={<PersonRoundedIcon />}
          color="success.main"
        />

        <ResumenCard
          titulo="Empleados inactivos"
          valor={empleadosInactivos}
          icono={<PersonOffRoundedIcon />}
          color="text.secondary"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              alignItems: {
                xs: 'stretch',
                md: 'center',
              },
            }}
          >
            <TextField
              placeholder="Buscar por código, nombre, puesto, teléfono o sucursal..."
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

            <FormControl sx={{ minWidth: 190 }}>
              <InputLabel id="filtro-estado-empleado-label">Estado</InputLabel>

              <Select
                labelId="filtro-estado-empleado-label"
                label="Estado"
                value={filtroEstado}
                onChange={(event) => setFiltroEstado(event.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="ACTIVO">Activos</MenuItem>
                <MenuItem value="INACTIVO">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && empleadosFiltrados.length > 0 && (
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
              Mostrando {empleadosFiltrados.length} de {empleados.length}{' '}
              empleados.
            </Typography>

            {filtroEstado !== 'TODOS' && (
              <Chip
                label={`Filtro: ${filtroEstado}`}
                size="small"
                onDelete={() => setFiltroEstado('TODOS')}
              />
            )}
          </Stack>

          <EmpleadosTable
            empleados={empleadosFiltrados}
            onEditar={abrirEditarEmpleado}
          />
        </>
      )}

      {!cargando && empleadosFiltrados.length === 0 && !error && (
        <Alert severity="info">
          {empleados.length === 0
            ? 'No hay empleados registrados.'
            : 'No se encontraron empleados que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      <EmpleadoForm
        abierto={formularioAbierto}
        empleado={empleadoEditando}
        sucursales={sucursales}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarEmpleado}
      />
    </Stack>
  )
}

interface ResumenCardProps {
  titulo: string
  valor: number
  icono: ReactNode
  color: string
}

function ResumenCard({
  titulo,
  valor,
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

export default ControlEmpleado