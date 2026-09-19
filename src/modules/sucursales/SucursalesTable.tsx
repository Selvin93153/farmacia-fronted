import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

import type { Sucursal } from './sucursalesService'

interface SucursalesTableProps {
  sucursales: Sucursal[]
  onVerSucursal: (sucursal: Sucursal) => void
}

function SucursalesTable({
  sucursales,
  onVerSucursal,
}: SucursalesTableProps) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Table aria-label="Listado de sucursales" sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Ubicación</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sucursales.map((sucursal) => (
            <TableRow
              key={sucursal.id_sucursal}
              hover
              sx={{
                '&:last-child td, &:last-child th': {
                  borderBottom: 0,
                },
              }}
            >
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {sucursal.codigo}
                </Typography>
              </TableCell>

              <TableCell>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center' }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: 'action.selected',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BusinessRoundedIcon />
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {sucursal.nombre}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      ID #{sucursal.id_sucursal}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>
                <Chip
                  label={sucursal.tipo_sucursal}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              <TableCell>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'flex-start' }}
                >
                  <LocationOnRoundedIcon
                    fontSize="small"
                    color="action"
                    sx={{ mt: 0.2 }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 260,
                      wordBreak: 'break-word',
                    }}
                  >
                    {sucursal.direccion}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <PhoneRoundedIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {sucursal.telefono || 'No registrado'}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Chip
                  label={sucursal.estado}
                  color={sucursal.estado === 'ACTIVO' ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>

              <TableCell align="center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityRoundedIcon />}
                  onClick={() => onVerSucursal(sucursal)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Ver sucursal
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SucursalesTable