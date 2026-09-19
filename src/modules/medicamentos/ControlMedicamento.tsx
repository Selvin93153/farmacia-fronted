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
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import MedicamentoForm from './MedicamentoForm'
import MedicamentosTable from './MedicamentosTable'

import {
  actualizarMedicamento,
  crearMedicamento,
  obtenerMedicamentos,
  type ActualizarMedicamento,
  type CrearMedicamento,
  type Medicamento,
} from './medicamentosService'

function ControlMedicamento() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroReceta, setFiltroReceta] = useState('TODOS')

  const [formularioAbierto, setFormularioAbierto] = useState(false)

  const [medicamentoEditando, setMedicamentoEditando] =
    useState<Medicamento | null>(null)

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

  const cargarMedicamentos = async () => {
    setCargando(true)
    setError('')

    try {
      const datos = await obtenerMedicamentos()
      setMedicamentos(datos)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar los medicamentos.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarMedicamentos()
  }, [])

  const medicamentosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return medicamentos.filter((medicamento) => {
      const coincideEstado =
        filtroEstado === 'TODOS' || medicamento.estado === filtroEstado

      const coincideReceta =
        filtroReceta === 'TODOS' ||
        (filtroReceta === 'RECETA' && medicamento.requiere_receta) ||
        (filtroReceta === 'LIBRE' && !medicamento.requiere_receta)

      const coincideBusqueda =
        texto === '' ||
        medicamento.codigo.toLowerCase().includes(texto) ||
        medicamento.nombre.toLowerCase().includes(texto) ||
        medicamento.principio_activo.toLowerCase().includes(texto) ||
        medicamento.concentracion.toLowerCase().includes(texto) ||
        medicamento.presentacion.toLowerCase().includes(texto) ||
        medicamento.laboratorio.toLowerCase().includes(texto)

      return coincideEstado && coincideReceta && coincideBusqueda
    })
  }, [medicamentos, busqueda, filtroEstado, filtroReceta])

  const totalMedicamentos = medicamentos.length

  const medicamentosActivos = medicamentos.filter(
    (medicamento) => medicamento.estado === 'ACTIVO',
  ).length

  const medicamentosConReceta = medicamentos.filter(
    (medicamento) => medicamento.requiere_receta,
  ).length

  const abrirNuevoMedicamento = () => {
    setMedicamentoEditando(null)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const abrirEditarMedicamento = (medicamento: Medicamento) => {
    setMedicamentoEditando(medicamento)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(false)
    setMedicamentoEditando(null)
    setErrorFormulario('')
  }

  const guardarMedicamento = async (
    datos: CrearMedicamento | ActualizarMedicamento,
  ) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      if (medicamentoEditando) {
        await actualizarMedicamento(
          medicamentoEditando.id_medicamento,
          datos as ActualizarMedicamento,
        )
      } else {
        await crearMedicamento(datos as CrearMedicamento)
      }

      setFormularioAbierto(false)
      setMedicamentoEditando(null)

      await cargarMedicamentos()
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          medicamentoEditando
            ? 'Ocurrió un error al actualizar el medicamento.'
            : 'Ocurrió un error al crear el medicamento.',
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
            Medicamentos
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Administra el catálogo general de medicamentos de SIGFAR.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={cargarMedicamentos}
            disabled={cargando}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={abrirNuevoMedicamento}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Nuevo medicamento
          </Button>
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando medicamentos" />}

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
        <ResumenMedicamento
          titulo="Total medicamentos"
          valor={totalMedicamentos}
          icono={<LocalPharmacyRoundedIcon />}
          color="primary.main"
        />

        <ResumenMedicamento
          titulo="Medicamentos activos"
          valor={medicamentosActivos}
          icono={<CheckCircleRoundedIcon />}
          color="success.main"
        />

        <ResumenMedicamento
          titulo="Requieren receta"
          valor={medicamentosConReceta}
          icono={<MedicalServicesRoundedIcon />}
          color="warning.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
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
            <TextField
              placeholder="Buscar por código, nombre, principio activo, presentación o laboratorio..."
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

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="filtro-estado-medicamento-label">
                Estado
              </InputLabel>

              <Select
                labelId="filtro-estado-medicamento-label"
                label="Estado"
                value={filtroEstado}
                onChange={(event) => setFiltroEstado(event.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="ACTIVO">Activos</MenuItem>
                <MenuItem value="INACTIVO">Inactivos</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 190 }}>
              <InputLabel id="filtro-receta-medicamento-label">
                Tipo de venta
              </InputLabel>

              <Select
                labelId="filtro-receta-medicamento-label"
                label="Tipo de venta"
                value={filtroReceta}
                onChange={(event) => setFiltroReceta(event.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="RECETA">Requiere receta</MenuItem>
                <MenuItem value="LIBRE">Venta libre</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && medicamentosFiltrados.length > 0 && (
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
              Mostrando {medicamentosFiltrados.length} de {medicamentos.length}{' '}
              medicamentos.
            </Typography>

            <Stack direction="row" spacing={1}>
              {filtroEstado !== 'TODOS' && (
                <Chip
                  label={`Estado: ${filtroEstado}`}
                  size="small"
                  onDelete={() => setFiltroEstado('TODOS')}
                />
              )}

              {filtroReceta !== 'TODOS' && (
                <Chip
                  label={
                    filtroReceta === 'RECETA'
                      ? 'Requiere receta'
                      : 'Venta libre'
                  }
                  size="small"
                  onDelete={() => setFiltroReceta('TODOS')}
                />
              )}
            </Stack>
          </Stack>

          <MedicamentosTable
            medicamentos={medicamentosFiltrados}
            onEditar={abrirEditarMedicamento}
          />
        </>
      )}

      {!cargando && medicamentosFiltrados.length === 0 && !error && (
        <Alert severity="info">
          {medicamentos.length === 0
            ? 'No hay medicamentos registrados.'
            : 'No se encontraron medicamentos que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      <MedicamentoForm
        abierto={formularioAbierto}
        medicamento={medicamentoEditando}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarMedicamento}
      />
    </Stack>
  )
}

interface ResumenMedicamentoProps {
  titulo: string
  valor: number
  icono: ReactNode
  color: string
}

function ResumenMedicamento({
  titulo,
  valor,
  icono,
  color,
}: ResumenMedicamentoProps) {
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

export default ControlMedicamento