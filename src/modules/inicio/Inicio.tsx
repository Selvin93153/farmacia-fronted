import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'

import { obtenerSesion, type UsuarioSesion } from '../auth/authService'

function Inicio() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const sesion = await obtenerSesion()
        setUsuario(sesion)
      } catch {
        setError('No se pudo obtener la información del usuario.')
      } finally {
        setCargando(false)
      }
    }

    cargarUsuario()
  }, [])

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary">Cargando SIGFAR...</Typography>
        </Stack>
      </Box>
    )
  }

  const nombreCompleto = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : 'Usuario'

  const iniciales = usuario
    ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`
    : 'U'

  const nombreRol =
    usuario?.rol?.nombre ?? `Rol ${usuario?.id_rol ?? '-'}`

  const nombreSucursal =
    usuario?.sucursal?.nombre ??
    (usuario?.id_sucursal
      ? `Sucursal ${usuario.id_sucursal}`
      : 'Sin sucursal asignada')

  return (
    <Stack spacing={4}>
      {error && <Alert severity="error">{error}</Alert>}

      <Paper
        elevation={0}
        sx={(theme) => ({
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          color: theme.palette.primary.contrastText,
          background: `linear-gradient(
            135deg,
            ${theme.palette.primary.dark} 0%,
            ${theme.palette.primary.main} 65%,
            ${theme.palette.primary.light} 130%
          )`,

          '&::before': {
            content: '""',
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            top: -100,
            right: -60,
          },

          '&::after': {
            content: '""',
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            bottom: -100,
            right: 180,
          },
        })}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{
            position: 'relative',
            zIndex: 1,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                bgcolor: 'background.paper',
                color: 'primary.main',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {iniciales}
            </Avatar>

            <Box>
              <Typography variant="body1" sx={{ opacity: 0.85, mb: 0.5 }}>
                Bienvenido nuevamente
              </Typography>

              <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                {nombreCompleto}
              </Typography>

              <Typography sx={{ mt: 0.5, opacity: 0.9 }}>
                Sistema Integral de Gestión Farmacéutica
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/app/farmacias')}
            sx={{
              bgcolor: 'background.paper',
              color: 'primary.main',
              px: 3,
              py: 1.2,
              fontWeight: 700,

              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Ir a Farmacias
          </Button>
        </Stack>
      </Paper>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Resumen de tu sesión
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2.5 }}>
          Información asociada a tu usuario dentro de SIGFAR.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
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
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  <AdminPanelSettingsRoundedIcon />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rol
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {nombreRol}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

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
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                  }}
                >
                  <BusinessRoundedIcon />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sucursal asignada
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {nombreSucursal}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

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
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                  }}
                >
                  <CheckCircleRoundedIcon />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estado de usuario
                  </Typography>

                  <Chip
                    label={usuario?.estado ?? 'Desconocido'}
                    color={usuario?.estado === 'ACTIVO' ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 700 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Accesos rápidos
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2.5 }}>
          Accede a los principales módulos del sistema.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: '100%',
              transition: '0.2s',

              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-4px)',
                borderColor: 'primary.main',
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate('/app/farmacias')}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocalPharmacyRoundedIcon />
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Farmacias
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.7 }}
                    >
                      Consulta y administra las sucursales registradas en
                      SIGFAR.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    >
                      Abrir módulo
                    </Typography>

                    <ArrowForwardRoundedIcon color="primary" fontSize="small" />
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: '100%',
              opacity: 0.75,
            }}
          >
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: 'action.selected',
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Inventory2RoundedIcon />
                  </Box>

                  <Chip label="Próximamente" size="small" />
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Inventario
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.7 }}
                  >
                    Control de existencias y disponibilidad de medicamentos.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: '100%',
              opacity: 0.75,
            }}
          >
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: 'action.selected',
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PointOfSaleRoundedIcon />
                  </Box>

                  <Chip label="Próximamente" size="small" />
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Ventas
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.7 }}
                  >
                    Consulta y registra las operaciones de venta de las
                    farmacias.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: '100%',
              opacity: 0.75,
            }}
          >
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: 'action.selected',
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SwapHorizRoundedIcon />
                  </Box>

                  <Chip label="Próximamente" size="small" />
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Traslados
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.7 }}
                  >
                    Gestiona movimientos de medicamentos entre las diferentes
                    sucursales.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Stack>
  )
}

export default Inicio