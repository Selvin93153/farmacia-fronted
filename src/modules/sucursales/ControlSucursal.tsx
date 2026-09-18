import { useState } from 'react'
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

import {
  obtenerSucursales,
  type Sucursal,
} from './sucursalesService'

import SucursalesTable from './SucursalesTable'

function ControlSucursal() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null)

  const [cargando, setCargando] = useState(false)
  const [consultado, setConsultado] = useState(false)
  const [error, setError] = useState('')

  const consultarSucursales = async () => {
    setCargando(true)
    setError('')
    setConsultado(false)
    setSucursales([])
    setSucursalSeleccionada(null)

    try {
      const datos = await obtenerSucursales()

      setSucursales(datos)
      setConsultado(true)
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

  const verSucursal = (sucursal: Sucursal) => {
    setSucursalSeleccionada(sucursal)
  }

  return (
    <Stack spacing={3}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700 }}
      >
        Farmacias
      </Typography>

      <Button
        variant="contained"
        onClick={consultarSucursales}
        disabled={cargando}
        sx={{ alignSelf: 'flex-start' }}
      >
        {cargando ? 'Consultando...' : 'Consultar sucursales'}
      </Button>

      {cargando && (
        <LinearProgress aria-label="Cargando sucursales" />
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {consultado && (
        <>
          <Alert severity="success">
            Consulta exitosa. Sucursales recibidas: {sucursales.length}.
          </Alert>

          {sucursales.length > 0 ? (
            <SucursalesTable
              sucursales={sucursales}
              onVerSucursal={verSucursal}
            />
          ) : (
            <Typography>No hay sucursales para mostrar.</Typography>
          )}
        </>
      )}

      {sucursalSeleccionada && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {sucursalSeleccionada.nombre}
            </Typography>

            <Divider />

            <Typography>
              <strong>Código:</strong>{' '}
              {sucursalSeleccionada.codigo}
            </Typography>

            <Typography>
              <strong>Tipo:</strong>{' '}
              {sucursalSeleccionada.tipo_sucursal}
            </Typography>

            <Typography>
              <strong>Dirección:</strong>{' '}
              {sucursalSeleccionada.direccion}
            </Typography>

            <Typography>
              <strong>Teléfono:</strong>{' '}
              {sucursalSeleccionada.telefono}
            </Typography>

            <Typography>
              <strong>Estado:</strong>{' '}
              {sucursalSeleccionada.estado}
            </Typography>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}

export default ControlSucursal