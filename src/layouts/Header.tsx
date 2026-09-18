import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'

import {
  AppBar,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'

import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onToggleMenu: () => void
  onCerrarSesion: () => void
  cerrandoSesion: boolean
}

function Header({
  onToggleMenu,
  onCerrarSesion,
  cerrandoSesion,
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleMenu}
          aria-label="Abrir o cerrar menú"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

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

        <Stack direction="row" spacing={1}>
          <Button
            color="inherit"
            startIcon={<AccountCircleRoundedIcon />}
            onClick={() => navigate('/app/perfil')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Perfil
          </Button>

          <Button
            color="inherit"
            onClick={onCerrarSesion}
            disabled={cerrandoSesion}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {cerrandoSesion ? 'Cerrando...' : 'Cerrar sesión'}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default Header