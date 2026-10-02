import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'

import type { Caja } from './cajasService'

interface CajasTableProps {
  cajas: Caja[]
  onEditar: (caja: Caja) => void
}

function CajasTable({
  cajas,
  onEditar,
}: CajasTableProps) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Table
        aria-label="Listado de cajas"
        sx={{ minWidth: 900 }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>
              Caja
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Sucursal
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Ubicación
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Estado
            </TableCell>

            <TableCell
              align="center"
              sx={{ fontWeight: 700 }}
            >
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {cajas.map((caja) => (
            <TableRow
              key={caja.id_caja}
              hover
              sx={{
                '&:last-child td, &:last-child th': {
                  borderBottom: 0,
                },
              }}
            >
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
                    <PointOfSaleRoundedIcon />
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {caja.nombre}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Caja #{caja.id_caja}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <BusinessRoundedIcon
                    fontSize="small"
                    color="action"
                  />

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {caja.sucursal.nombre}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {caja.sucursal.codigo}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {caja.sucursal.municipio?.nombre ?? 'Sin municipio'}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {caja.sucursal.municipio?.departamento?.nombre ??
                    'Sin departamento'}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={caja.estado}
                  color={
                    caja.estado === 'ACTIVA'
                      ? 'success'
                      : 'default'
                  }
                  size="small"
                  variant={
                    caja.estado === 'ACTIVA'
                      ? 'filled'
                      : 'outlined'
                  }
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Editar caja">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => onEditar(caja)}
                  >
                    <EditRoundedIcon fontSize="small" />
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

export default CajasTable