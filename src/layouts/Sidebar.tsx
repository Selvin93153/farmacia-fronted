import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'

import { NavLink } from 'react-router-dom'

export const drawerWidth = 240

interface SidebarProps {
  abierto: boolean
}

function Sidebar({
  abierto,
}: SidebarProps) {
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

      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            fontWeight: 700,
          }}
        >
          MENÚ PRINCIPAL
        </Typography>
      </Box>

      <Divider />

      <List>
        <ListItemButton
          component={NavLink}
          to="/app/inicio"
          sx={{
            '&.active': {
              bgcolor: 'action.selected',
            },
          }}
        >
          <ListItemText
            primary="Inicio"
          />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to="/app/farmacias"
          sx={{
            '&.active': {
              bgcolor: 'action.selected',
            },
          }}
        >
          <ListItemText
            primary="Farmacias"
          />
        </ListItemButton>
      </List>
    </Drawer>
  )
}

export default Sidebar