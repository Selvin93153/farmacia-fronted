import { useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { cerrarSesion } from '../modules/auth/authService'

const drawerWidth = 240

function AppLayout() {
  const navigate = useNavigate()

  const [cerrandoSesion, setCerrandoSesion] =
    useState(false)

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
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) =>
            theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
            }}
          >
            SIGFAR
          </Typography>

          <Button
            color="inherit"
            onClick={manejarCerrarSesion}
            disabled={cerrandoSesion}
          >
            {cerrandoSesion
              ? 'Cerrando...'
              : 'Cerrar sesión'}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,

          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />

        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            MENÚ PRINCIPAL
          </Typography>
        </Box>

        <Divider />

        <List>
          <ListItemButton
            component={NavLink}
            to="/app/farmacias"
            sx={{
              '&.active': {
                bgcolor: 'action.selected',
                fontWeight: 700,
              },
            }}
          >
            <ListItemText primary="Farmacias" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />

        <Box sx={{ p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AppLayout