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
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'

import type { Inventario } from './inventariosService'

interface InventariosTableProps {
  inventarios: Inventario[]
  onEditar: (inventario: Inventario) => void
}

type NivelStock = 'NORMAL' | 'BAJO' | 'SIN_STOCK'

function obtenerNivelStock(inventario: Inventario): NivelStock {
  if (inventario.stock_actual === 0) {
    return 'SIN_STOCK'
  }

  if (inventario.stock_actual <= inventario.stock_minimo) {
    return 'BAJO'
  }

  return 'NORMAL'
}

function InventariosTable({
  inventarios,
  onEditar,
}: InventariosTableProps) {
  const formatearFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(fecha))
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Table aria-label="Listado de inventarios" sx={{ minWidth: 1100 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Medicamento</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Stock actual</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Stock mínimo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Nivel</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>
              Última actualización
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {inventarios.map((inventario) => {
            const nivel = obtenerNivelStock(inventario)

            return (
              <TableRow
                key={inventario.id_inventario}
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
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'action.selected',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <BusinessRoundedIcon fontSize="small" />
                    </Box>

                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {inventario.sucursal.nombre}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {inventario.sucursal.codigo}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'action.selected',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <MedicationRoundedIcon fontSize="small" />
                    </Box>

                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {inventario.medicamento.nombre}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {inventario.medicamento.codigo} ·{' '}
                        {inventario.medicamento.concentracion}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color:
                        nivel === 'SIN_STOCK'
                          ? 'error.main'
                          : nivel === 'BAJO'
                            ? 'warning.main'
                            : 'text.primary',
                    }}
                  >
                    {inventario.stock_actual}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>
                    {inventario.stock_minimo}
                  </Typography>
                </TableCell>

                <TableCell>
                  {nivel === 'NORMAL' && (
                    <Chip
                      label="Stock normal"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  )}

                  {nivel === 'BAJO' && (
                    <Chip
                      label="Stock bajo"
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  )}

                  {nivel === 'SIN_STOCK' && (
                    <Chip
                      label="Sin existencias"
                      color="error"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatearFecha(inventario.fecha_actualizacion)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Configurar inventario">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onEditar(inventario)}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default InventariosTable