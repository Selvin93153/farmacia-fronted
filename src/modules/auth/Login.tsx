import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'

import { iniciarSesion } from './authService'

function Login() {
  const navigate = useNavigate()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const manejarLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setCargando(true)
    setError('')

    try {
      await iniciarSesion(correo, password)

      navigate('/app/inicio', {
        replace: true,
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Correo o contraseña incorrectos.')
        } else if (error.response) {
          setError(
            `El backend respondió con error HTTP ${error.response.status}.`,
          )
        } else {
          setError(
            'No se pudo conectar con el servidor. Verifica que el backend esté activo.',
          )
        }
      } else {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error al iniciar sesión.',
        )
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        background:
          'linear-gradient(135deg, #eef8f4 0%, #f7fbff 45%, #eef4ff 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          top: -150,
          left: -120,
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 72%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          right: -180,
          bottom: -220,
          background:
            'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(37, 99, 235, 0) 72%)',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1120,
          minHeight: { md: 650 },
          overflow: 'hidden',
          borderRadius: { xs: 4, md: 5 },
          border: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.28)',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 28px 80px rgba(15, 23, 42, 0.14)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ minHeight: { md: 650 } }}
        >
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: '48%',
              position: 'relative',
              overflow: 'hidden',
              p: 6,
              color: '#ffffff',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background:
                'linear-gradient(145deg, #0f766e 0%, #0f9f7d 45%, #2563eb 125%)',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 360,
                height: 360,
                borderRadius: '50%',
                right: -140,
                top: -120,
                border: '1px solid rgba(255,255,255,0.18)',
                background:
                  'rgba(255,255,255,0.05)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 260,
                height: 260,
                borderRadius: '50%',
                left: -100,
                bottom: -90,
                border: '1px solid rgba(255,255,255,0.14)',
                background:
                  'rgba(255,255,255,0.04)',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack
                direction="row"
                spacing={1.4}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <LocalPharmacyRoundedIcon
                    sx={{ fontSize: 30 }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: 0.8,
                      lineHeight: 1,
                    }}
                  >
                    SIGFAR
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.8,
                      letterSpacing: 0.5,
                    }}
                  >
                    Gestión farmacéutica integral
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="h3"
                sx={{
                  mt: 7,
                  maxWidth: 430,
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: -1,
                }}
              >
                Toda la operación de tu farmacia, en un solo lugar.
              </Typography>

              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 440,
                  fontSize: 16,
                  lineHeight: 1.7,
                  opacity: 0.86,
                }}
              >
                Administra sucursales, ventas, inventarios,
                traslados, entregas y auditoría con información
                centralizada y segura.
              </Typography>
            </Box>

            <Stack
              spacing={1.5}
              sx={{ position: 'relative', zIndex: 1 }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <StorefrontRoundedIcon />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    Operación multisucursal
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.72 }}
                  >
                    Control centralizado de toda la red.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <Inventory2RoundedIcon />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    Inventario en tiempo real
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.72 }}
                  >
                    Existencias, movimientos y traslados.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <SecurityRoundedIcon />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    Acceso seguro
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.72 }}
                  >
                    Sesiones protegidas y acceso por roles.
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Typography
              variant="caption"
              sx={{
                position: 'relative',
                zIndex: 1,
                opacity: 0.62,
              }}
            >
              Sistema Integral de Gestión Farmacéutica
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={manejarLogin}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: {
                xs: 3,
                sm: 5,
                md: 6,
              },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 430 }}>
              <Box
                sx={{
                  display: { xs: 'block', md: 'none' },
                  mb: 4,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{ alignItems: 'center' }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      background:
                        'linear-gradient(135deg, #0f9f7d, #2563eb)',
                    }}
                  >
                    <LocalPharmacyRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: 0.5,
                      }}
                    >
                      SIGFAR
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Gestión farmacéutica integral
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 800,
                    letterSpacing: 1.4,
                  }}
                >
                  ACCESO AL SISTEMA
                </Typography>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    mt: 0.7,
                    fontWeight: 900,
                    letterSpacing: -0.6,
                    color: 'text.primary',
                  }}
                >
                  Bienvenido de nuevo
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  Ingresa tus credenciales para acceder a SIGFAR.
                </Typography>
              </Box>

              <Stack spacing={2.2} sx={{ mt: 4 }}>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={correo}
                  onChange={(event) => {
                    setCorreo(event.target.value)
                    if (error) setError('')
                  }}
                  required
                  fullWidth
                  autoComplete="email"
                  disabled={cargando}
                  placeholder="usuario@sigfar.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailRoundedIcon
                            sx={{
                              fontSize: 21,
                              color: 'text.secondary',
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      transition:
                        'box-shadow 180ms ease, transform 180ms ease',
                      '&.Mui-focused': {
                        boxShadow:
                          '0 0 0 4px rgba(37, 99, 235, 0.08)',
                      },
                    },
                  }}
                />

                <TextField
                  label="Contraseña"
                  type={
                    mostrarPassword ? 'text' : 'password'
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (error) setError('')
                  }}
                  required
                  fullWidth
                  autoComplete="current-password"
                  disabled={cargando}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon
                            sx={{
                              fontSize: 21,
                              color: 'text.secondary',
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setMostrarPassword(
                                (estadoActual) =>
                                  !estadoActual,
                              )
                            }
                            disabled={cargando}
                            edge="end"
                            aria-label={
                              mostrarPassword
                                ? 'Ocultar contraseña'
                                : 'Mostrar contraseña'
                            }
                          >
                            {mostrarPassword ? (
                              <VisibilityOffRoundedIcon />
                            ) : (
                              <VisibilityRoundedIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      transition:
                        'box-shadow 180ms ease, transform 180ms ease',
                      '&.Mui-focused': {
                        boxShadow:
                          '0 0 0 4px rgba(37, 99, 235, 0.08)',
                      },
                    },
                  }}
                />

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2.5,
                      alignItems: 'center',
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    cargando ||
                    !correo.trim() ||
                    !password.trim()
                  }
                  sx={{
                    minHeight: 52,
                    mt: 0.5,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontSize: 16,
                    fontWeight: 800,
                    background:
                      'linear-gradient(135deg, #0f9f7d 0%, #2563eb 110%)',
                    boxShadow:
                      '0 12px 28px rgba(37, 99, 235, 0.20)',
                    transition:
                      'transform 180ms ease, box-shadow 180ms ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow:
                        '0 16px 34px rgba(37, 99, 235, 0.26)',
                      background:
                        'linear-gradient(135deg, #0d8f72 0%, #1d4ed8 110%)',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'action.disabledBackground',
                    },
                  }}
                >
                  {cargando ? (
                    <Stack
                      direction="row"
                      spacing={1.2}
                      sx={{ alignItems: 'center' }}
                    >
                      <CircularProgress
                        size={21}
                        color="inherit"
                      />
                      <span>Ingresando...</span>
                    </Stack>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>
              </Stack>

              <Divider sx={{ my: 3.5 }} />

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SecurityRoundedIcon
                  sx={{
                    fontSize: 18,
                    color: 'success.main',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  Acceso protegido mediante sesión segura
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Login
