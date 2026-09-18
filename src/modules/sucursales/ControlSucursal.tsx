import { useEffect, useState } from 'react'
import axios from 'axios'

import {
  Alert,
  Button,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'

import {
  obtenerSucursales,
  type Sucursal,
} from './sucursalesService'

import SucursalesTable from './SucursalesTable'

function ControlSucursal() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const consultarSucursales = async () => {
    setCargando(true)
    setError('')

    try {
      const datos = await obtenerSucursales()
      setSucursales(datos)
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(
            `El backend respondió con error HTTP ${error.response.status}.`,
          )
        } else {
          setError(
            'No se pudo obtener respuesta. Revisa que el backend esté activo, la dirección de la API y CORS.',
          )
        }
      } else {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error al consultar las sucursales.',
        )
      }
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    consultarSucursales()
  }, [])

  const verSucursal = (sucursal: Sucursal) => {
    setSucursalSeleccionada(sucursal)
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
        }}
      >
        <BoxTitulo />

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={consultarSucursales}
          disabled={cargando}
        >
          {cargando ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando sucursales" />}

      {error && <Alert severity="error">{error}</Alert>}

      {!cargando && !error && sucursales.length === 0 && (
        <Alert severity="info">
          No hay sucursales registradas para mostrar.
        </Alert>
      )}

      {!cargando && !error && sucursales.length > 0 && (
        <SucursalesTable
          sucursales={sucursales}
          onVerSucursal={verSucursal}
        />
      )}

      {sucursalSeleccionada && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {sucursalSeleccionada.nombre}
            </Typography>

            <Divider />

            <Typography>
              <strong>Código:</strong> {sucursalSeleccionada.codigo}
            </Typography>

            <Typography>
              <strong>Tipo:</strong> {sucursalSeleccionada.tipo_sucursal}
            </Typography>

            <Typography>
              <strong>Dirección:</strong> {sucursalSeleccionada.direccion}
            </Typography>

            <Typography>
              <strong>Teléfono:</strong> {sucursalSeleccionada.telefono}
            </Typography>

            <Typography>
              <strong>Estado:</strong> {sucursalSeleccionada.estado}
            </Typography>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}

function BoxTitulo() {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
        Farmacias
      </Typography>

      <Typography color="text.secondary">
        Consulta y administra las sucursales registradas en SIGFAR.
      </Typography>
    </Stack>
  )
}

export default ControlSucursal