import { useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material'

import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import {
  divIcon,
  type LatLngBoundsExpression,
  type LatLngExpression,
} from 'leaflet'

import 'leaflet/dist/leaflet.css'

interface MapaEntregaPedidoProps {
  latitud: string
  longitud: string
  onSeleccionar: (latitud: string, longitud: string) => void
}

const CENTRO_GUATEMALA: LatLngExpression = [15.7835, -90.2308]

const LIMITES_GUATEMALA: LatLngBoundsExpression = [
  [13.6, -92.4],
  [18.1, -88.0],
]

const iconoUbicacion = divIcon({
  className: '',
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #0f766e;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.30);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #ffffff;
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
})

interface SelectorMapaProps {
  onSeleccionar: (latitud: string, longitud: string) => void
}

function SelectorMapa({ onSeleccionar }: SelectorMapaProps) {
  // Captura el punto seleccionado en el mapa y lo convierte a coordenadas del pedido.
  useMapEvents({
    click(event) {
      onSeleccionar(
        event.latlng.lat.toFixed(7),
        event.latlng.lng.toFixed(7),
      )
    },
  })

  return null
}

interface SincronizarMapaProps {
  posicion: LatLngExpression | null
}

function SincronizarMapa({ posicion }: SincronizarMapaProps) {
  const mapa = useMap()

  // Ajusta el tamaño del mapa dentro del diálogo y centra la ubicación seleccionada.
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      mapa.invalidateSize()

      if (posicion) {
        mapa.setView(posicion, Math.max(mapa.getZoom(), 14))
      }
    }, 180)

    return () => window.clearTimeout(temporizador)
  }, [mapa, posicion])

  return null
}

export default function MapaEntregaPedido({
  latitud,
  longitud,
  onSeleccionar,
}: MapaEntregaPedidoProps) {
  const [errorUbicacion, setErrorUbicacion] = useState('')

  const posicion = useMemo<LatLngExpression | null>(() => {
    const latitudNumero = Number(latitud)
    const longitudNumero = Number(longitud)

    if (
      !Number.isFinite(latitudNumero) ||
      !Number.isFinite(longitudNumero)
    ) {
      return null
    }

    return [latitudNumero, longitudNumero]
  }, [latitud, longitud])

  // Obtiene la ubicación del navegador como alternativa al clic manual sobre el mapa.
  const usarUbicacionActual = () => {
    setErrorUbicacion('')

    if (!navigator.geolocation) {
      setErrorUbicacion(
        'El navegador no permite obtener la ubicación actual.',
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      (resultado) => {
        onSeleccionar(
          resultado.coords.latitude.toFixed(7),
          resultado.coords.longitude.toFixed(7),
        )
      },
      () => {
        setErrorUbicacion(
          'No fue posible obtener tu ubicación. Puedes seleccionar el punto directamente en el mapa.',
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    )
  }

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            Ubicación de entrega
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.3, color: 'text.secondary' }}
          >
            Haz clic en el mapa para marcar el punto exacto de entrega.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<MyLocationRoundedIcon />}
          onClick={usarUbicacionActual}
          sx={{
            flexShrink: 0,
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          Usar mi ubicación
        </Button>
      </Stack>

      {errorUbicacion && (
        <Alert severity="warning">
          {errorUbicacion}
        </Alert>
      )}

      {/* Mapa interactivo: permite seleccionar visualmente las coordenadas del pedido. */}
      <Box
        sx={{
          height: { xs: 320, sm: 380 },
          overflow: 'hidden',
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          '& .leaflet-container': {
            width: '100%',
            height: '100%',
            fontFamily: 'inherit',
          },
        }}
      >
        <MapContainer
          center={posicion ?? CENTRO_GUATEMALA}
          zoom={posicion ? 14 : 7}
          minZoom={6}
          maxZoom={19}
          maxBounds={LIMITES_GUATEMALA}
          maxBoundsViscosity={0.75}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <SelectorMapa onSeleccionar={onSeleccionar} />
          <SincronizarMapa posicion={posicion} />

          {posicion && (
            <Marker
              position={posicion}
              icon={iconoUbicacion}
            />
          )}
        </MapContainer>
      </Box>

      <PaperCoordenadas
        latitud={latitud}
        longitud={longitud}
      />
    </Stack>
  )
}

interface PaperCoordenadasProps {
  latitud: string
  longitud: string
}

function PaperCoordenadas({
  latitud,
  longitud,
}: PaperCoordenadasProps) {
  const hayUbicacion = Boolean(latitud && longitud)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
        px: 1.5,
        py: 1.2,
        borderRadius: 2,
        bgcolor: hayUbicacion
          ? 'success.50'
          : 'action.hover',
        border: '1px solid',
        borderColor: hayUbicacion
          ? 'success.200'
          : 'divider',
      }}
    >
      <PlaceRoundedIcon
        sx={{
          color: hayUbicacion
            ? 'success.main'
            : 'text.secondary',
        }}
      />

      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700 }}
        >
          {hayUbicacion
            ? 'Ubicación seleccionada'
            : 'Ubicación pendiente'}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: 'text.secondary' }}
        >
          {hayUbicacion
            ? `Latitud ${latitud} · Longitud ${longitud}`
            : 'Selecciona un punto en el mapa para continuar.'}
        </Typography>
      </Box>
    </Box>
  )
}
