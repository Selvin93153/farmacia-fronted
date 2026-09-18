import { useState } from 'react'
import {
  Box,
  Toolbar,
} from '@mui/material'

import {
  Outlet,
  useNavigate,
} from 'react-router-dom'

import Header from './Header'
import Sidebar from './Sidebar'

import { cerrarSesion } from '../modules/auth/authService'

function AppLayout() {
  const navigate = useNavigate()

  const [menuAbierto, setMenuAbierto] =
    useState(true)

  const [
    cerrandoSesion,
    setCerrandoSesion,
  ] = useState(false)

  const alternarMenu = () => {
    setMenuAbierto((estadoActual) =>
      !estadoActual
    )
  }

  const manejarCerrarSesion = async () => {
    setCerrandoSesion(true)

    try {
      await cerrarSesion()

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Error al cerrar sesión:',
        error,
      )
    } finally {
      setCerrandoSesion(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <Header
        onToggleMenu={alternarMenu}
        onCerrarSesion={
          manejarCerrarSesion
        }
        cerrandoSesion={
          cerrandoSesion
        }
      />

      <Sidebar
        abierto={menuAbierto}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />

        <Box
          sx={{
            p: {
              xs: 2,
              md: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AppLayout