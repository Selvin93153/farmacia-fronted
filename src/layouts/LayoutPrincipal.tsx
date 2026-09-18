import { useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Drawer, Toolbar } from '@mui/material'
import BarraSuperior from './BarraSuperior'
import MenuLateral from './MenuLateral'

const anchoMenu = 250

interface LayoutPrincipalProps {
  seleccion: string
  onSeleccionar: (nombre: string) => void
  children: ReactNode
}

function LayoutPrincipal({
  seleccion,
  onSeleccionar,
  children,
}: LayoutPrincipalProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const seleccionarOpcion = (nombre: string) => {
    onSeleccionar(nombre)
    setMenuAbierto(false)
  }

  const menu = (
    <MenuLateral
      seleccion={seleccion}
      onSeleccionar={seleccionarOpcion}
    />
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <BarraSuperior
        titulo={seleccion}
        anchoMenu={anchoMenu}
        onAbrirMenu={() => setMenuAbierto(true)}
      />

      <Box
        sx={{
          width: { md: anchoMenu },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={menuAbierto}
          onClose={() => setMenuAbierto(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: anchoMenu,
              boxSizing: 'border-box',
            },
          }}
        >
          {menu}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: anchoMenu,
              boxSizing: 'border-box',
            },
          }}
        >
          {menu}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, md: 4 },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default LayoutPrincipal