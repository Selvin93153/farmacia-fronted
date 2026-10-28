import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'

import {
  obtenerSesion,
  type UsuarioSesion,
} from '../modules/auth/authService'
import {
  esCodigoRol,
  type CodigoRol,
} from '../modules/config/menuConfig'

interface RoleRouteProps {
  children: ReactNode
  rolesPermitidos: CodigoRol[]
}

function RoleRoute({
  children,
  rolesPermitidos,
}: RoleRouteProps) {
  const navigate = useNavigate()

  const [usuario, setUsuario] =
    useState<UsuarioSesion | null>(null)

  const [cargando, setCargando] = useState(true)

  // Obtiene la sesión actual para validar si el rol puede acceder a la vista.
  useEffect(() => {
    const validarRol = async () => {
      try {
        const sesion = await obtenerSesion()
        setUsuario(sesion)
      } catch {
        setUsuario(null)
      } finally {
        setCargando(false)
      }
    }

    void validarRol()
  }, [])

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  const codigoRol = usuario?.rol?.codigo

  // Bloquea la vista cuando no existe un rol válido o no está autorizado.
  if (
    !esCodigoRol(codigoRol) ||
    !rolesPermitidos.includes(codigoRol)
  ) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 560,
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
          }}
        >
          <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'error.50',
                color: 'error.main',
              }}
            >
              <LockRoundedIcon sx={{ fontSize: 34 }} />
            </Box>

            <Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 800 }}
              >
                Acceso restringido
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                }}
              >
                Tu usuario no tiene permisos para acceder a esta
                sección de SIGFAR.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<HomeRoundedIcon />}
              onClick={() => navigate('/app/inicio')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Volver al inicio
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  return <>{children}</>
}

export default RoleRoute
