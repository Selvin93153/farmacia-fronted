import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded'

import type { Usuario } from './usuariosService'

interface UsuariosTableProps {
  usuarios: Usuario[]
  onEditarUsuario: (usuario: Usuario) => void
}

function UsuariosTable({
  usuarios,
  onEditarUsuario,
}: UsuariosTableProps) {
  if (usuarios.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 5,
          textAlign: 'center',
        }}
      >
        <PersonOffRoundedIcon
          color="disabled"
          sx={{
            fontSize: 48,
            mb: 1,
          }}
        />

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
          }}
        >
          No se encontraron usuarios
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          No existen usuarios que coincidan con los filtros seleccionados.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflowX: 'auto',
      }}
    >
      <Table sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              Usuario
            </TableCell>

            <TableCell>
              Correo
            </TableCell>

            <TableCell>
              Rol
            </TableCell>

            <TableCell>
              Sucursal
            </TableCell>

            <TableCell>
              Teléfono
            </TableCell>

            <TableCell align="center">
              Estado
            </TableCell>

            <TableCell align="center">
              Acción
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow
              key={usuario.id_usuario}
              hover
              sx={{
                '&:last-child td, &:last-child th': {
                  border: 0,
                },
              }}
            >
              <TableCell>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {usuario.nombre} {usuario.apellido}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    ID #{usuario.id_usuario}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {usuario.correo}
                </Typography>
              </TableCell>

              <TableCell>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {usuario.rol?.nombre ?? 'Sin rol'}
                  </Typography>

                  {usuario.rol?.codigo && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {usuario.rol.codigo}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell>
                {usuario.sucursal ? (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {usuario.sucursal.nombre}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {usuario.sucursal.codigo}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Sin sucursal
                  </Typography>
                )}
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {usuario.telefono}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Chip
                  label={usuario.estado}
                  size="small"
                  color={
                    usuario.estado === 'ACTIVO'
                      ? 'success'
                      : 'default'
                  }
                  variant={
                    usuario.estado === 'ACTIVO'
                      ? 'filled'
                      : 'outlined'
                  }
                  sx={{
                    fontWeight: 700,
                  }}
                />
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Editar usuario">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEditarUsuario(usuario)
                    }
                  >
                    <EditRoundedIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UsuariosTable