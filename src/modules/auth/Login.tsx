import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
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
      await iniciarSesion(
        correo,
        password,
      )

      navigate('/app/inicio', {
        replace: true,
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError(
            'Correo o contraseña incorrectos.',
          )
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

        p: {
          xs: 2,
          sm: 3,
        },

        background:
          'linear-gradient(135deg, #0f766e 0%, #0b6b61 50%, #065f57 100%)',

        '&::before': {
          content: '""',
          position: 'absolute',

          width: {
            xs: 280,
            sm: 420,
          },

          height: {
            xs: 280,
            sm: 420,
          },

          borderRadius: '50%',

          top: {
            xs: -100,
            sm: -170,
          },

          left: {
            xs: -100,
            sm: -130,
          },

          background:
            'rgba(255, 255, 255, 0.06)',
        },

        '&::after': {
          content: '""',
          position: 'absolute',

          width: {
            xs: 340,
            sm: 500,
          },

          height: {
            xs: 340,
            sm: 500,
          },

          borderRadius: '50%',

          right: {
            xs: -150,
            sm: -180,
          },

          bottom: {
            xs: -160,
            sm: -220,
          },

          background:
            'rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      <Paper
        component="form"
        onSubmit={manejarLogin}
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 1,

          width: '100%',
          maxWidth: 440,

          borderRadius: 4,

          p: {
            xs: 3,
            sm: 4,
          },

          bgcolor: 'background.paper',

          border: '1px solid',
          borderColor:
            'rgba(255, 255, 255, 0.25)',

          boxShadow:
            '0 24px 70px rgba(0, 0, 0, 0.22)',
        }}
      >
        <Stack spacing={3}>
          {/* Identidad principal de SIGFAR */}
          <Stack
            spacing={1.5}
            sx={{
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,

                borderRadius: 3,

                bgcolor: 'primary.main',
                color: 'primary.contrastText',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                boxShadow:
                  '0 8px 22px rgba(15, 118, 110, 0.22)',
              }}
            >
              <LocalPharmacyRoundedIcon
                sx={{
                  fontSize: 36,
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 0.5,
                }}
              >
                SIGFAR
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Sistema Integral de Gestión Farmacéutica
              </Typography>
            </Box>
          </Stack>

          {/* Encabezado del formulario */}
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              Iniciar sesión
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.75,
                textAlign: 'center',
              }}
            >
              Ingresa tus credenciales para acceder al sistema.
            </Typography>
          </Box>

          {/* Correo */}
          <TextField
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={(event) => {
              setCorreo(
                event.target.value,
              )

              if (error) {
                setError('')
              }
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
                        color:
                          'text.secondary',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
              },
            }}
          />

          {/* Contraseña */}
          <TextField
            label="Contraseña"
            type={
              mostrarPassword
                ? 'text'
                : 'password'
            }
            value={password}
            onChange={(event) => {
              setPassword(
                event.target.value,
              )

              if (error) {
                setError('')
              }
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
                        color:
                          'text.secondary',
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
              },
            }}
          />

          {/* Mensaje de error */}
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2.5,
              }}
            >
              {error}
            </Alert>
          )}

          {/* Botón para iniciar sesión */}
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
              minHeight: 50,
              borderRadius: 2.5,

              textTransform: 'none',
              fontWeight: 700,
              fontSize: 16,

              boxShadow:
                '0 10px 24px rgba(15, 118, 110, 0.20)',
            }}
          >
            {cargando ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                }}
              >
                <CircularProgress
                  size={20}
                  color="inherit"
                />

                <span>
                  Ingresando...
                </span>
              </Stack>
            ) : (
              'Iniciar sesión'
            )}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: 'center',
            }}
          >
            Acceso exclusivo para usuarios autorizados.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Login