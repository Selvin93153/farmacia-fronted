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
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded'
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded'
import PaidRoundedIcon from '@mui/icons-material/PaidRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import { obtenerSesion } from '../auth/authService'

import {
  obtenerSucursales,
  type Sucursal,
} from '../sucursales/sucursalesService'

import ActivoFijoForm from './ActivoFijoForm'
import ActivosFijosTable from './ActivosFijosTable'

import {
  actualizarActivoFijo,
  crearActivoFijo,
  obtenerActivosFijos,
  obtenerActivosFijosMiSucursal,
  type ActivoFijo,
  type ActualizarActivoFijo,
  type CrearActivoFijo,
  type EstadoActivoFijo,
} from './activosFijosService'

type FiltroEstado = 'TODOS' | EstadoActivoFijo

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

// Convierte los errores del backend en mensajes comprensibles.
function obtenerMensajeError(error: unknown, predeterminado: string): string {
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

  return predeterminado
}

function ControlActivoFijo() {
  const [activos, setActivos] = useState<ActivoFijo[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])

  const [idSucursalAsignada, setIdSucursalAsignada] = useState<number | null>(
    null,
  )

  const [sesionVerificada, setSesionVerificada] = useState(false)
  const [esAdminSistema, setEsAdminSistema] = useState(false)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')

  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [activoEditando, setActivoEditando] = useState<ActivoFijo | null>(null)

  // Carga los activos según el alcance de la sesión.
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')
    setSesionVerificada(false)
    setEsAdminSistema(false)
    setActivos([])
    setSucursales([])

    try {
      const sesion = await obtenerSesion()

      const idSucursal = sesion.id_sucursal
      const adminSistema = sesion.rol?.codigo === 'ADMIN_SISTEMA'

      if (
        idSucursal !== null &&
        (!Number.isInteger(idSucursal) || idSucursal < 1)
      ) {
        throw new Error('No se pudo determinar la sucursal del usuario.')
      }

      const [activosRecibidos, sucursalesRecibidas] = await Promise.all([
        idSucursal === null
          ? obtenerActivosFijos()
          : obtenerActivosFijosMiSucursal(),
        obtenerSucursales(),
      ])

      const activosAlcance =
        idSucursal === null
          ? activosRecibidos
          : activosRecibidos.filter(
              (activo) => activo.id_sucursal === idSucursal,
            )

      const sucursalesAlcance =
        idSucursal === null
          ? sucursalesRecibidas
          : sucursalesRecibidas.filter(
              (sucursal) => sucursal.id_sucursal === idSucursal,
            )

      setActivos(activosAlcance)
      setSucursales(sucursalesAlcance)
      setIdSucursalAsignada(idSucursal)
      setEsAdminSistema(adminSistema)

      setFiltroSucursal(
        idSucursal === null ? 'TODAS' : String(idSucursal),
      )

      setSesionVerificada(true)
    } catch (errorDesconocido: unknown) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'Ocurrió un error al cargar la información de activos fijos.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  // Obtiene las categorías existentes para utilizarlas como filtro.
  const categorias = useMemo(
    () =>
      Array.from(
        new Set(
          activos
            .map((activo) => activo.categoria.trim())
            .filter((categoria) => categoria !== ''),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [activos],
  )

  // Aplica búsqueda, sucursal, categoría y estado.
  const activosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return activos.filter((activo) => {
      const coincideSucursal =
        filtroSucursal === 'TODAS' ||
        activo.id_sucursal === Number(filtroSucursal)

      const coincideEstado =
        filtroEstado === 'TODOS' || activo.estado === filtroEstado

      const coincideCategoria =
        filtroCategoria === 'TODAS' || activo.categoria === filtroCategoria

      const coincideBusqueda =
        texto === '' ||
        activo.codigo.toLowerCase().includes(texto) ||
        activo.descripcion.toLowerCase().includes(texto) ||
        activo.categoria.toLowerCase().includes(texto) ||
        activo.sucursal.codigo.toLowerCase().includes(texto) ||
        activo.sucursal.nombre.toLowerCase().includes(texto)

      return (
        coincideSucursal &&
        coincideEstado &&
        coincideCategoria &&
        coincideBusqueda
      )
    })
  }, [
    activos,
    busqueda,
    filtroSucursal,
    filtroEstado,
    filtroCategoria,
  ])

  // Las estadísticas se calculan únicamente con los activos filtrados.
  const totalActivos = activosFiltrados.length

  const valorAdquisicionTotal = activosFiltrados.reduce(
    (total, activo) => total + Number(activo.valor_adquisicion),
    0,
  )

  const valorActualTotal = activosFiltrados.reduce(
    (total, activo) => total + Number(activo.valor_actual),
    0,
  )

  const activosMantenimiento = activosFiltrados.filter(
    (activo) => activo.estado === 'MANTENIMIENTO',
  ).length

  // Abre el formulario para registrar un activo.
  const abrirNuevoActivo = () => {
    if (!sesionVerificada || cargando || esAdminSistema) {
      return
    }

    setActivoEditando(null)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  // Permite editar únicamente a usuarios operativos autorizados.
  const abrirEditarActivo = (activo: ActivoFijo) => {
    if (!sesionVerificada || cargando || esAdminSistema) {
      return
    }

    if (
      idSucursalAsignada !== null &&
      activo.id_sucursal !== idSucursalAsignada
    ) {
      return
    }

    setActivoEditando(activo)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(false)
    setActivoEditando(null)
    setErrorFormulario('')
  }

  // Crea o actualiza un activo fijo.
  const guardarActivo = async (
    datos: CrearActivoFijo | ActualizarActivoFijo,
  ) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      if (!sesionVerificada) {
        throw new Error('No se ha verificado la sesión del usuario.')
      }

      if (esAdminSistema) {
        throw new Error(
          'El Administrador del Sistema solo puede consultar activos fijos.',
        )
      }

      if (activoEditando) {
        if (
          idSucursalAsignada !== null &&
          activoEditando.id_sucursal !== idSucursalAsignada
        ) {
          throw new Error('No puedes modificar activos de otra sucursal.')
        }

        await actualizarActivoFijo(
          activoEditando.id_activo,
          datos as ActualizarActivoFijo,
        )
      } else {
        const datosCrear = datos as CrearActivoFijo

        await crearActivoFijo({
          ...datosCrear,
          id_sucursal:
            idSucursalAsignada === null
              ? datosCrear.id_sucursal
              : idSucursalAsignada,
        })
      }

      setFormularioAbierto(false)
      setActivoEditando(null)

      await cargarDatos()
    } catch (errorDesconocido: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          errorDesconocido,
          activoEditando
            ? 'Ocurrió un error al actualizar el activo fijo.'
            : 'Ocurrió un error al registrar el activo fijo.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroCategoria('TODAS')

    setFiltroSucursal(
      idSucursalAsignada === null ? 'TODAS' : String(idSucursalAsignada),
    )
  }

  const hayFiltros =
    busqueda.trim() !== '' ||
    filtroEstado !== 'TODOS' ||
    filtroCategoria !== 'TODAS' ||
    (idSucursalAsignada === null && filtroSucursal !== 'TODAS')

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
            Activos fijos
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Controla los bienes, su ubicación, estado y valor actual por
            sucursal.
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

          {/* ADMIN_SISTEMA únicamente consulta los activos. */}
          {!esAdminSistema && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={abrirNuevoActivo}
              disabled={!sesionVerificada || cargando}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Nuevo activo
            </Button>
          )}
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando activos fijos" />}

      {error && <Alert severity="error">{error}</Alert>}

      {/* Indicadores recalculados según los filtros aplicados. */}
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
        <ResumenActivo
          titulo="Activos registrados"
          valor={String(totalActivos)}
          icono={<BusinessCenterRoundedIcon />}
          color="primary.main"
        />

        <ResumenActivo
          titulo="Valor de adquisición"
          valor={formatoMoneda.format(valorAdquisicionTotal)}
          icono={<MonetizationOnRoundedIcon />}
          color="secondary.main"
        />

        <ResumenActivo
          titulo="Valor actual"
          valor={formatoMoneda.format(valorActualTotal)}
          icono={<PaidRoundedIcon />}
          color="success.main"
        />

        <ResumenActivo
          titulo="En mantenimiento"
          valor={String(activosMantenimiento)}
          icono={<BuildRoundedIcon />}
          color="warning.main"
        />
      </Box>

      {/* Filtros */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              placeholder="Buscar por código, descripción, categoría o sucursal..."
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
              <FormControl
                fullWidth
                disabled={idSucursalAsignada !== null}
              >
                <InputLabel id="filtro-sucursal-activos-label">
                  Sucursal
                </InputLabel>

                <Select
                  labelId="filtro-sucursal-activos-label"
                  label="Sucursal"
                  value={filtroSucursal}
                  onChange={(event) =>
                    setFiltroSucursal(String(event.target.value))
                  }
                >
                  {idSucursalAsignada === null && (
                    <MenuItem value="TODAS">Todas las sucursales</MenuItem>
                  )}

                  {sucursales.map((sucursal) => (
                    <MenuItem
                      key={sucursal.id_sucursal}
                      value={String(sucursal.id_sucursal)}
                    >
                      {sucursal.codigo} - {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="filtro-categoria-activos-label">
                  Categoría
                </InputLabel>

                <Select
                  labelId="filtro-categoria-activos-label"
                  label="Categoría"
                  value={filtroCategoria}
                  onChange={(event) =>
                    setFiltroCategoria(String(event.target.value))
                  }
                >
                  <MenuItem value="TODAS">Todas las categorías</MenuItem>

                  {categorias.map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="filtro-estado-activos-label">
                  Estado
                </InputLabel>

                <Select
                  labelId="filtro-estado-activos-label"
                  label="Estado"
                  value={filtroEstado}
                  onChange={(event) =>
                    setFiltroEstado(event.target.value as FiltroEstado)
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ACTIVO">Activos</MenuItem>
                  <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                  <MenuItem value="BAJA">Baja</MenuItem>
                </Select>
              </FormControl>

              {hayFiltros && (
                <Button
                  variant="text"
                  onClick={limpiarFiltros}
                  sx={{
                    minWidth: 135,
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

      {!cargando && activosFiltrados.length > 0 && (
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
              Mostrando {activosFiltrados.length} de {activos.length} activos
              fijos.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {filtroEstado !== 'TODOS' && (
                <Chip
                  label={`Estado: ${filtroEstado}`}
                  size="small"
                  onDelete={() => setFiltroEstado('TODOS')}
                />
              )}

              {filtroCategoria !== 'TODAS' && (
                <Chip
                  label={`Categoría: ${filtroCategoria}`}
                  size="small"
                  onDelete={() => setFiltroCategoria('TODAS')}
                />
              )}
            </Stack>
          </Stack>

          <ActivosFijosTable
            activos={activosFiltrados}
            puedeEditar={!esAdminSistema}
            onEditar={abrirEditarActivo}
          />
        </>
      )}

      {!cargando && activosFiltrados.length === 0 && !error && (
        <Alert severity="info">
          {activos.length === 0
            ? 'No hay activos fijos registrados.'
            : 'No se encontraron activos que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      {/* El formulario no se monta para ADMIN_SISTEMA. */}
      {!esAdminSistema && (
        <ActivoFijoForm
          abierto={formularioAbierto}
          activo={activoEditando}
          sucursales={sucursales}
          idSucursalAsignada={idSucursalAsignada}
          guardando={guardando}
          error={errorFormulario}
          onCerrar={cerrarFormulario}
          onGuardar={guardarActivo}
        />
      )}
    </Stack>
  )
}

interface ResumenActivoProps {
  titulo: string
  valor: string
  icono: ReactNode
  color: string
}

function ResumenActivo({
  titulo,
  valor,
  icono,
  color,
}: ResumenActivoProps) {
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

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
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

export default ControlActivoFijo