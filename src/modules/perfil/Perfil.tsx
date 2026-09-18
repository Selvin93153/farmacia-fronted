import { useEffect, useState } from 'react'

import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'

import {
  obtenerSesion,
  type UsuarioSesion,
} from '../auth/authService'

function Perfil() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const sesion = await obtenerSesion()
        setUsuario(sesion)
      } catch {
        setError('No se pudo obtener la información del perfil.')
      } finally {
        setCargando(false)
      }
    }

    cargarPerfil()
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
          <Typography color="text.secondary">Cargando perfil...</Typography>
        </Stack>
      </Box>
    )
  }

  if (!usuario) {
    return (
      <Alert severity="error">
        No se encontró información del usuario autenticado.
      </Alert>
    )
  }

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`

  const iniciales = `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`

  const nombreRol =
    usuario.rol?.nombre ?? `Rol ${usuario.id_rol}`

  const nombreSucursal =
    usuario.sucursal?.nombre ??
    (usuario.id_sucursal
      ? `Sucursal ${usuario.id_sucursal}`
      : 'Sin sucursal asignada')

  return (
    <Stack spacing={4}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          Mi perfil
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Consulta la información asociada a tu cuenta de SIGFAR.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={(theme) => ({
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          color: theme.palette.primary.contrastText,
          background: `linear-gradient(
            135deg,
            ${theme.palette.primary.dark} 0%,
            ${theme.palette.primary.main} 65%,
            ${theme.palette.primary.light} 130%
          )`,
          p: {
            xs: 3,
            md: 4,
          },

          '&::before': {
            content: '""',
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            top: -130,
            right: -70,
          },

          '&::after': {
            content: '""',
            position: 'absolute',
            width: 170,
            height: 170,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            bottom: -90,
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
            alignItems: {
              xs: 'flex-start',
              md: 'center',
            },
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'background.paper',
              color: 'primary.main',
              fontSize: 34,
              fontWeight: 800,
              boxShadow: 3,
            }}
          >
            {iniciales}
          </Avatar>

          <Box>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.85,
                mb: 0.5,
              }}
            >
              Usuario SIGFAR
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
              }}
            >
              {nombreCompleto}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                opacity: 0.9,
              }}
            >
              {usuario.correo}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip
                label={nombreRol}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: 'inherit',
                  fontWeight: 700,
                }}
              />

              <Chip
                label={usuario.estado}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: 'inherit',
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: 3,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                md: 3,
              },
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <AccountCircleRoundedIcon color="primary" />

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Información personal
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Datos principales asociados a tu usuario.
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                  },
                  gap: 2.5,
                }}
              >
                <InformacionPerfil
                  icono={<PersonRoundedIcon />}
                  titulo="Nombre"
                  valor={usuario.nombre}
                />

                <InformacionPerfil
                  icono={<PersonRoundedIcon />}
                  titulo="Apellido"
                  valor={usuario.apellido}
                />

                <InformacionPerfil
                  icono={<EmailRoundedIcon />}
                  titulo="Correo electrónico"
                  valor={usuario.correo}
                />

                <InformacionPerfil
                  icono={<PhoneRoundedIcon />}
                  titulo="Teléfono"
                  valor={usuario.telefono || 'No registrado'}
                />

                <InformacionPerfil
                  icono={<BadgeRoundedIcon />}
                  titulo="ID de usuario"
                  valor={`#${usuario.id_usuario}`}
                />

                <InformacionPerfil
                  icono={<CheckCircleRoundedIcon />}
                  titulo="Estado"
                  valor={usuario.estado}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={3}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2.5,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AdminPanelSettingsRoundedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Rol asignado
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {nombreRol}
                  </Typography>
                </Box>

                {usuario.rol?.descripcion && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {usuario.rol.descripcion}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2.5,
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BusinessRoundedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Sucursal asignada
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {nombreSucursal}
                  </Typography>
                </Box>

                {usuario.sucursal?.codigo && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Código: {usuario.sucursal.codigo}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Seguridad de la cuenta
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Tu sesión se encuentra protegida mediante autenticación segura
                de SIGFAR.
              </Typography>
            </Box>

            <Chip
              icon={<CheckCircleRoundedIcon />}
              label="Sesión activa"
              color="success"
              variant="outlined"
              sx={{
                fontWeight: 700,
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

interface InformacionPerfilProps {
  icono: React.ReactNode
  titulo: string
  valor: string
}

function InformacionPerfil({
  icono,
  titulo,
  valor,
}: InformacionPerfilProps) {
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

export default Perfil