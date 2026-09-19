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
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

import type { MovimientoInventario } from './movimientosInventarioService'

interface MovimientosInventarioTableProps {
  movimientos: MovimientoInventario[]
  onVerDetalle: (movimiento: MovimientoInventario) => void
}

function MovimientosInventarioTable({
  movimientos,
  onVerDetalle,
}: MovimientosInventarioTableProps) {
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
      <Table aria-label="Movimientos de inventario" sx={{ minWidth: 1250 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Medicamento</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Movimiento</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Motivo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Cantidad</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>

            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Detalle
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {movimientos.map((movimiento) => (
            <TableRow
              key={movimiento.id_movimiento}
              hover
              sx={{
                '&:last-child td, &:last-child th': {
                  borderBottom: 0,
                },
              }}
            >
              <TableCell>
                <Typography variant="body2">
                  {formatearFecha(movimiento.fecha)}
                </Typography>
              </TableCell>

              <TableCell>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <BusinessRoundedIcon fontSize="small" color="action" />

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {movimiento.inventario.sucursal.nombre}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {movimiento.inventario.sucursal.codigo}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {movimiento.inventario.medicamento.nombre}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {movimiento.inventario.medicamento.codigo} ·{' '}
                  {movimiento.inventario.medicamento.concentracion}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  icon={
                    movimiento.tipo_movimiento === 'ENTRADA' ? (
                      <TrendingUpRoundedIcon />
                    ) : (
                      <TrendingDownRoundedIcon />
                    )
                  }
                  label={movimiento.tipo_movimiento}
                  color={
                    movimiento.tipo_movimiento === 'ENTRADA'
                      ? 'success'
                      : 'error'
                  }
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={movimiento.motivo}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              <TableCell>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color:
                      movimiento.tipo_movimiento === 'ENTRADA'
                        ? 'success.main'
                        : 'error.main',
                  }}
                >
                  {movimiento.tipo_movimiento === 'ENTRADA' ? '+' : '-'}
                  {movimiento.cantidad}
                </Typography>
              </TableCell>

              <TableCell>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Typography color="text.secondary">
                    {movimiento.stock_anterior}
                  </Typography>

                  <Typography color="text.secondary">→</Typography>

                  <Typography sx={{ fontWeight: 800 }}>
                    {movimiento.stock_nuevo}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {movimiento.usuario.nombre} {movimiento.usuario.apellido}
                </Typography>

                {movimiento.usuario.rol?.nombre && (
                  <Typography variant="caption" color="text.secondary">
                    {movimiento.usuario.rol.nombre}
                  </Typography>
                )}
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Ver detalle">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => onVerDetalle(movimiento)}
                  >
                    <VisibilityRoundedIcon fontSize="small" />
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

export default MovimientosInventarioTable