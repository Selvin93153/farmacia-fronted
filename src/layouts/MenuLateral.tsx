import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import PeopleIcon from '@mui/icons-material/People'

const opciones = [
  { nombre: 'Inicio', icono: HomeIcon },
  { nombre: 'Farmacias', icono: LocalPharmacyIcon },
  { nombre: 'Usuarios', icono: PeopleIcon },
]

interface MenuLateralProps {
  seleccion: string
  onSeleccionar: (nombre: string) => void
}

function MenuLateral({
  seleccion,
  onSeleccionar,
}: MenuLateralProps) {
  return (
    <Box component="nav" aria-label="Menú principal">
      <Toolbar sx={{ gap: 1 }}>
        <LocalPharmacyIcon color="primary" />

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Farmacias
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ p: 2 }}>
        {opciones.map(({ nombre, icono: Icono }) => (
          <ListItemButton
            key={nombre}
            selected={seleccion === nombre}
            onClick={() => onSeleccionar(nombre)}
            aria-current={seleccion === nombre ? 'page' : undefined}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <Icono />
            </ListItemIcon>

            <ListItemText primary={nombre} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

export default MenuLateral