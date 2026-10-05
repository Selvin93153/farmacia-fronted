import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

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
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DoNotDisturbOnRoundedIcon from '@mui/icons-material/DoNotDisturbOnRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import { obtenerSesion } from '../auth/authService'
import { obtenerSucursales } from '../sucursales/sucursalesService'
import CajaForm, { type SucursalOpcion } from './CajaForm'
import CajasTable from './CajasTable'
import {
  actualizarCaja,
  crearCaja,
  obtenerCajas,
  obtenerCajasMiSucursal,
  type ActualizarCaja,
  type Caja,
  type CrearCaja,
  type EstadoCaja,
} from './cajasService'

type FiltroEstado = 'TODAS' | EstadoCaja

// Convierte errores del backend en mensajes claros para la interfaz.
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

function ControlCaja() {
  const [cajas, setCajas] = useState<Caja[]>([])
  const [sucursales, setSucursales] = useState<SucursalOpcion[]>([])
  const [idSucursalAsignada, setIdSucursalAsignada] = useState<number | null>(null)
  const [sesionVerificada, setSesionVerificada] = useState(false)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODAS')
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [cajaEditando, setCajaEditando] = useState<Caja | null>(null)

  // Determina el alcance de los datos usando la sucursal de la sesión activa.
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')
    setSesionVerificada(false)

    try {
      const sesion = await obtenerSesion()

      if (sesion.id_sucursal !== null && !Number.isInteger(sesion.id_sucursal)) {
        throw new Error('No se pudo determinar la sucursal del usuario.')
      }

      if (sesion.id_sucursal === null) {
        const [cajasRecibidas, sucursalesRecibidas] = await Promise.all([
          obtenerCajas(),
          obtenerSucursales(),
        ])

        setCajas(cajasRecibidas)
        setSucursales(sucursalesRecibidas)
        setIdSucursalAsignada(null)
      } else {
        const cajasRecibidas = await obtenerCajasMiSucursal()
        const cajasDeSucursal = cajasRecibidas.filter(
          (caja) => caja.id_sucursal === sesion.id_sucursal,
        )

        const sucursalDeSesion = sesion.sucursal
        const sucursalDeCaja = cajasDeSucursal[0]?.sucursal
        const sucursalAsignada: SucursalOpcion = {
          id_sucursal: sesion.id_sucursal,
          codigo: sucursalDeSesion?.codigo ?? sucursalDeCaja?.codigo ?? '',
          nombre:
            sucursalDeSesion?.nombre ??
            sucursalDeCaja?.nombre ??
            `Sucursal #${sesion.id_sucursal}`,
        }

        setCajas(cajasDeSucursal)
        setSucursales([sucursalAsignada])
        setIdSucursalAsignada(sesion.id_sucursal)
      }

      setFiltroSucursal('TODAS')
      setSesionVerificada(true)
    } catch (error: unknown) {
      // No reutiliza datos anteriores cuando falla la sesión o la carga.
      setCajas([])
      setSucursales([])
      setSesionVerificada(false)
      setError(obtenerMensajeError(error, 'Ocurrió un error al cargar las cajas.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  // Filtra únicamente las cajas que devolvió la consulta autorizada.
  const cajasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return cajas.filter((caja) => {
      const coincideSucursal =
        idSucursalAsignada !== null ||
        filtroSucursal === 'TODAS' ||
        caja.id_sucursal === Number(filtroSucursal)

      const coincideEstado = filtroEstado === 'TODAS' || caja.estado === filtroEstado
      const coincideBusqueda =
        texto === '' ||
        caja.nombre.toLowerCase().includes(texto) ||
        caja.sucursal.nombre.toLowerCase().includes(texto) ||
        caja.sucursal.codigo.toLowerCase().includes(texto) ||
        Boolean(caja.sucursal.municipio?.nombre?.toLowerCase().includes(texto)) ||
        Boolean(
          caja.sucursal.municipio?.departamento?.nombre?.toLowerCase().includes(texto),
        )

      return coincideSucursal && coincideEstado && coincideBusqueda
    })
  }, [cajas, busqueda, filtroSucursal, filtroEstado, idSucursalAsignada])

  const totalCajas = cajas.length
  const totalActivas = cajas.filter((caja) => caja.estado === 'ACTIVA').length
  const totalInactivas = cajas.filter((caja) => caja.estado === 'INACTIVA').length
  const sucursalesConCaja = new Set(cajas.map((caja) => caja.id_sucursal)).size

  const abrirNuevaCaja = () => {
    if (!sesionVerificada || cargando || error) return
    setCajaEditando(null)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const abrirEditarCaja = (caja: Caja) => {
    if (!sesionVerificada || cargando) return

    if (idSucursalAsignada !== null && caja.id_sucursal !== idSucursalAsignada) {
      setError('No puedes administrar cajas de otra sucursal.')
      return
    }

    setCajaEditando(caja)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) return
    setFormularioAbierto(false)
    setCajaEditando(null)
    setErrorFormulario('')
  }

  // Crea o edita una caja, respetando la sucursal asignada al usuario.
  const guardarCaja = async (datos: CrearCaja | ActualizarCaja) => {
    if (!sesionVerificada) {
      setErrorFormulario('No se ha podido validar la sesión del usuario.')
      return
    }

    setGuardando(true)
    setErrorFormulario('')

    try {
      if (cajaEditando) {
        if (
          idSucursalAsignada !== null &&
          cajaEditando.id_sucursal !== idSucursalAsignada
        ) {
          throw new Error('No puedes editar cajas de otra sucursal.')
        }

        await actualizarCaja(cajaEditando.id_caja, datos as ActualizarCaja)
      } else {
        const datosCreacion = datos as CrearCaja
        const cajaNueva: CrearCaja = {
          ...datosCreacion,
          id_sucursal: idSucursalAsignada ?? datosCreacion.id_sucursal,
        }

        await crearCaja(cajaNueva)
      }

      setFormularioAbierto(false)
      setCajaEditando(null)
      await cargarDatos()
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          cajaEditando
            ? 'Ocurrió un error al actualizar la caja.'
            : 'Ocurrió un error al crear la caja.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroSucursal('TODAS')
    setFiltroEstado('TODAS')
  }

  const hayFiltros =
    busqueda !== '' ||
    (idSucursalAsignada === null && filtroSucursal !== 'TODAS') ||
    filtroEstado !== 'TODAS'

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
            Cajas
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {idSucursalAsignada === null
              ? 'Administra las cajas disponibles en las sucursales de SIGFAR.'
              : `Administra las cajas de ${sucursales[0]?.nombre ?? 'tu sucursal'}.`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void cargarDatos()}
            disabled={cargando || guardando}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={abrirNuevaCaja}
            disabled={cargando || !sesionVerificada || Boolean(error)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Nueva caja
          </Button>
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando cajas" />}
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
        <ResumenCaja
          titulo="Total cajas"
          valor={totalCajas}
          icono={<PointOfSaleRoundedIcon />}
          color="primary.main"
        />
        <ResumenCaja
          titulo="Cajas activas"
          valor={totalActivas}
          icono={<CheckCircleRoundedIcon />}
          color="success.main"
        />
        <ResumenCaja
          titulo="Cajas inactivas"
          valor={totalInactivas}
          icono={<DoNotDisturbOnRoundedIcon />}
          color="warning.main"
        />
        <ResumenCaja
          titulo="Sucursales con cajas"
          valor={sucursalesConCaja}
          icono={<BusinessRoundedIcon />}
          color="info.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              placeholder="Buscar por caja, sucursal, municipio o departamento..."
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
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
            >
              {idSucursalAsignada === null && (
                <FormControl fullWidth>
                  <InputLabel id="filtro-sucursal-caja-label">Sucursal</InputLabel>
                  <Select
                    labelId="filtro-sucursal-caja-label"
                    label="Sucursal"
                    value={filtroSucursal}
                    onChange={(event) => setFiltroSucursal(event.target.value)}
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
              )}

              <FormControl fullWidth>
                <InputLabel id="filtro-estado-caja-label">Estado</InputLabel>
                <Select
                  labelId="filtro-estado-caja-label"
                  label="Estado"
                  value={filtroEstado}
                  onChange={(event) =>
                    setFiltroEstado(event.target.value as FiltroEstado)
                  }
                >
                  <MenuItem value="TODAS">Todos los estados</MenuItem>
                  <MenuItem value="ACTIVA">Activas</MenuItem>
                  <MenuItem value="INACTIVA">Inactivas</MenuItem>
                </Select>
              </FormControl>

              {hayFiltros && (
                <Button
                  onClick={limpiarFiltros}
                  sx={{ minWidth: 130, textTransform: 'none', fontWeight: 600 }}
                >
                  Limpiar filtros
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && cajasFiltradas.length > 0 && (
        <>
          <Typography color="text.secondary">
            Mostrando {cajasFiltradas.length} de {cajas.length} cajas.
          </Typography>
          <CajasTable cajas={cajasFiltradas} onEditar={abrirEditarCaja} />
        </>
      )}

      {!cargando && cajasFiltradas.length === 0 && !error && (
        <Alert severity="info">
          {cajas.length === 0
            ? 'No hay cajas registradas.'
            : 'No se encontraron cajas que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      <CajaForm
        abierto={formularioAbierto}
        caja={cajaEditando}
        sucursales={sucursales}
        idSucursalAsignada={idSucursalAsignada}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarCaja}
      />
    </Stack>
  )
}

interface ResumenCajaProps {
  titulo: string
  valor: number
  icono: ReactNode
  color: string
}

function ResumenCaja({ titulo, valor, icono, color }: ResumenCajaProps) {
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

export default ControlCaja
