import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {
  Box,
  CircularProgress,
} from '@mui/material'

import { obtenerSesion } from '../modules/auth/authService'

function PrivateRoute() {
  const [verificando, setVerificando] = useState(true)
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        await obtenerSesion()

        setAutenticado(true)
      } catch {
        setAutenticado(false)
      } finally {
        setVerificando(false)
      }
    }

    verificarSesion()
  }, [])

  if (verificando) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}

export default PrivateRoute