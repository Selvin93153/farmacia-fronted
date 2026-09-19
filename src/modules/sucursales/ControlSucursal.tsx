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

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import StoreRoundedIcon from '@mui/icons-material/StoreRounded'

import SucursalesTable from './SucursalesTable'

import {
  obtenerSucursales,
  type Sucursal,
} from './sucursalesService'

function ControlSucursal() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

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

  const consultarSucursales = async () => {
    setCargando(true)
    setError('')

    try {
      const datos = await obtenerSucursales()
      setSucursales(datos)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al consultar las sucursales.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    consultarSucursales()
  }, [])

  const sucursalesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return sucursales.filter((sucursal) => {
      const coincideEstado =
        filtroEstado === 'TODOS' || sucursal.estado === filtroEstado

      const coincideBusqueda =
        texto === '' ||
        sucursal.codigo.toLowerCase().includes(texto) ||
        sucursal.nombre.toLowerCase().includes(texto) ||
        sucursal.tipo_sucursal.toLowerCase().includes(texto) ||
        sucursal.direccion.toLowerCase().includes(texto) ||
        sucursal.telefono?.toLowerCase().includes(texto)

      return coincideEstado && coincideBusqueda
    })
  }, [sucursales, busqueda, filtroEstado])

  const totalSucursales = sucursales.length

  const sucursalesActivas = sucursales.filter(
    (sucursal) => sucursal.estado === 'ACTIVO',
  ).length

  const sucursalesInactivas = sucursales.filter(
    (sucursal) => sucursal.estado === 'INACTIVO',
  ).length

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
            Farmacias
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta y administra las sucursales registradas en SIGFAR.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={consultarSucursales}
          disabled={cargando}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Actualizar
        </Button>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando sucursales" />}

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
        <ResumenSucursal
          titulo="Total de sucursales"
          valor={totalSucursales}
          icono={<BusinessRoundedIcon />}
          color="primary.main"
        />

        <ResumenSucursal
          titulo="Sucursales activas"
          valor={sucursalesActivas}
          icono={<CheckCircleRoundedIcon />}
          color="success.main"
        />

        <ResumenSucursal
          titulo="Sucursales inactivas"
          valor={sucursalesInactivas}
          icono={<StoreRoundedIcon />}
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
              placeholder="Buscar por código, nombre, tipo, dirección o teléfono..."
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
              <InputLabel id="filtro-estado-sucursal-label">Estado</InputLabel>

              <Select
                labelId="filtro-estado-sucursal-label"
                label="Estado"
                value={filtroEstado}
                onChange={(event) => setFiltroEstado(event.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="ACTIVO">Activas</MenuItem>
                <MenuItem value="INACTIVO">Inactivas</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && sucursalesFiltradas.length > 0 && (
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
              Mostrando {sucursalesFiltradas.length} de {sucursales.length}{' '}
              sucursales.
            </Typography>

            {filtroEstado !== 'TODOS' && (
              <Chip
                label={`Filtro: ${filtroEstado}`}
                size="small"
                onDelete={() => setFiltroEstado('TODOS')}
              />
            )}
          </Stack>

          <SucursalesTable
            sucursales={sucursalesFiltradas}
            onVerSucursal={setSucursalSeleccionada}
          />
        </>
      )}

      {!cargando && sucursalesFiltradas.length === 0 && !error && (
        <Alert severity="info">
          {sucursales.length === 0
            ? 'No hay sucursales registradas.'
            : 'No se encontraron sucursales que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      <Dialog
        open={sucursalSeleccionada !== null}
        onClose={() => setSucursalSeleccionada(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center' }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StorefrontRoundedIcon />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {sucursalSeleccionada?.nombre}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {sucursalSeleccionada?.codigo}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {sucursalSeleccionada && (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{
                  alignItems: {
                    xs: 'flex-start',
                    sm: 'center',
                  },
                }}
              >
                <Chip
                  label={sucursalSeleccionada.tipo_sucursal}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />

                <Chip
                  label={sucursalSeleccionada.estado}
                  color={
                    sucursalSeleccionada.estado === 'ACTIVO'
                      ? 'success'
                      : 'default'
                  }
                  sx={{ fontWeight: 700 }}
                />
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
                <DetalleSucursal
                  icono={<BusinessRoundedIcon />}
                  titulo="Tipo de sucursal"
                  valor={sucursalSeleccionada.tipo_sucursal}
                />

                <DetalleSucursal
                  icono={<PhoneRoundedIcon />}
                  titulo="Teléfono"
                  valor={sucursalSeleccionada.telefono || 'No registrado'}
                />

                <DetalleSucursal
                  icono={<LocationOnRoundedIcon />}
                  titulo="Dirección"
                  valor={sucursalSeleccionada.direccion}
                />

                <DetalleSucursal
                  icono={<CheckCircleRoundedIcon />}
                  titulo="Estado"
                  valor={sucursalSeleccionada.estado}
                />
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Ubicación geográfica
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Latitud
                    </Typography>

                    <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                      {sucursalSeleccionada.latitud}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Longitud
                    </Typography>

                    <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                      {sucursalSeleccionada.longitud}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSucursalSeleccionada(null)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

interface ResumenSucursalProps {
  titulo: string
  valor: number
  icono: ReactNode
  color: string
}

function ResumenSucursal({
  titulo,
  valor,
  icono,
  color,
}: ResumenSucursalProps) {
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

interface DetalleSucursalProps {
  icono: ReactNode
  titulo: string
  valor: string
}

function DetalleSucursal({
  icono,
  titulo,
  valor,
}: DetalleSucursalProps) {
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

        <Typography
          sx={{
            mt: 0.25,
            fontWeight: 600,
            wordBreak: 'break-word',
          }}
        >
          {valor}
        </Typography>
      </Box>
    </Stack>
  )
}

export default ControlSucursal