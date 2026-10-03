import { useEffect, useMemo, useState } from 'react'

import {
  Box,
  CircularProgress,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'

import { NavLink } from 'react-router-dom'

import {
  esCodigoRol,
  menuConfig,
  type CodigoRol,
} from '../modules/config/menuConfig'

import {
  obtenerSesion,
  type UsuarioSesion,
} from '../modules/auth/authService'

export const drawerWidth = 260

interface SidebarProps {
  abierto: boolean
}

function Sidebar({
  abierto,
}: SidebarProps) {
  const [sesion, setSesion] =
    useState<UsuarioSesion | null>(null)

  const [cargando, setCargando] = useState(true)

  // Obtiene la sesión actual para determinar qué opciones debe mostrar.
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const datos = await obtenerSesion()
        setSesion(datos)
      } catch {
        setSesion(null)
      } finally {
        setCargando(false)
      }
    }

    cargarSesion()
  }, [])

  const codigoRol: CodigoRol | null =
    esCodigoRol(sesion?.rol?.codigo)
      ? sesion.rol.codigo
      : null

  // Filtra las secciones y opciones visibles según el rol autenticado.
  const seccionesPermitidas = useMemo(() => {
    if (!codigoRol) {
      return []
    }

    return menuConfig
      .map((seccion) => ({
        ...seccion,
        opciones: seccion.opciones.filter(
          (opcion) =>
            opcion.roles.includes(codigoRol),
        ),
      }))
      .filter(
        (seccion) =>
          seccion.opciones.length > 0,
      )
  }, [codigoRol])

  return (
    <Drawer
      variant="permanent"
      open={abierto}
      sx={{
        width: abierto ? drawerWidth : 0,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: abierto ? drawerWidth : 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          overflowY: 'auto',

          transition: (theme) =>
            theme.transitions.create(
              'width',
              {
                easing:
                  theme.transitions.easing.sharp,
                duration:
                  theme.transitions.duration
                    .enteringScreen,
              },
            ),
        },
      }}
    >
      <Toolbar />

      <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            fontWeight: 800,
            letterSpacing: 0.7,
          }}
        >
          MENÚ PRINCIPAL
        </Typography>

        {sesion?.rol?.nombre && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.5,
            }}
          >
            {sesion.rol.nombre}
          </Typography>
        )}
      </Box>

      <Divider />

      {cargando ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box sx={{ py: 1 }}>
          {seccionesPermitidas.map(
            (seccion, indiceSeccion) => (
              <Box
                key={seccion.titulo}
                sx={{
                  mt:
                    indiceSeccion === 0
                      ? 0
                      : 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    px: 2.5,
                    py: 1,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                  }}
                >
                  {seccion.titulo}
                </Typography>

                <List
                  disablePadding
                  sx={{
                    px: 1,
                  }}
                >
                  {seccion.opciones.map(
                    (opcion) => {
                      const Icono =
                        opcion.icono

                      return (
                        <ListItemButton
                          key={opcion.ruta}
                          component={NavLink}
                          to={opcion.ruta}
                          sx={{
                            mb: 0.5,
                            borderRadius: 2,
                            minHeight: 44,

                            '&.active': {
                              bgcolor:
                                'action.selected',
                              color:
                                'primary.main',

                              '& .MuiListItemIcon-root':
                                {
                                  color:
                                    'primary.main',
                                },

                              '& .MuiListItemText-primary':
                                {
                                  fontWeight: 700,
                                },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 40,
                              color:
                                'text.secondary',
                            }}
                          >
                            <Icono />
                          </ListItemIcon>

                         <ListItemText
                         primary={opcion.texto}
                          slotProps={{
                           primary: {
                            sx: {
                           fontSize: 14,
                          },
                         },
                        }}
                     />
                        </ListItemButton>
                      )
                    },
                  )}
                </List>
              </Box>
            ),
          )}

          {!codigoRol && (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No se pudo determinar el rol
                de la sesión.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  )
}

export default Sidebar