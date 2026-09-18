import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { iniciarSesion } from './authService'

function Login() {
  const navigate = useNavigate()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')

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

      navigate(
        '/app/inicio',
        {
          replace: true,
        },
      )
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={manejarLogin}
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
              }}
            >
              SIGFAR
            </Typography>

            <Typography color="text.secondary">
              Sistema Integral de Gestión Farmacéutica
            </Typography>
          </Box>

          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
            }}
          >
            Iniciar sesión
          </Typography>

          <TextField
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={(event) =>
              setCorreo(event.target.value)
            }
            required
            fullWidth
            autoComplete="email"
          />

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            fullWidth
            autoComplete="current-password"
          />

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={cargando}
          >
            {cargando ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Login