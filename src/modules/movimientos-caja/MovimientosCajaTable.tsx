import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import type { MovimientoCaja } from './movimientosCajaService'

interface MovimientosCajaTableProps {
  movimientos: MovimientoCaja[]
  onVerDetalle: (movimiento: MovimientoCaja) => void
}

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function MovimientosCajaTable({ movimientos, onVerDetalle }: MovimientosCajaTableProps) {
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  // Regresa a la primera página cuando cambia el resultado de los filtros.
  useEffect(() => {
    setPagina(0)
  }, [movimientos])

  const movimientosPagina = movimientos.slice(
    pagina * filasPorPagina,
    (pagina + 1) * filasPorPagina,
  )

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 920 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sucursal / Caja</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Origen</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientosPagina.map((movimiento) => (
              <TableRow hover key={movimiento.id_movimiento_caja}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatoFecha.format(new Date(movimiento.fecha))}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {movimiento.caja.sucursal.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {movimiento.caja.nombre}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={movimiento.tipo_movimiento === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                    color={movimiento.tipo_movimiento === 'INGRESO' ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 240 }} noWrap title={movimiento.concepto}>
                    {movimiento.concepto}
                  </Typography>
                </TableCell>
                <TableCell>
                  {movimiento.id_venta !== null
                    ? `Venta #${movimiento.id_venta}`
                    : 'Manual'}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: movimiento.tipo_movimiento === 'INGRESO' ? 'success.main' : 'error.main', whiteSpace: 'nowrap' }}
                  >
                    {movimiento.tipo_movimiento === 'INGRESO' ? '+' : '-'}
                    {formatoMoneda.format(movimiento.monto)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityRoundedIcon />}
                    onClick={() => onVerDetalle(movimiento)}
                    sx={{ textTransform: 'none' }}
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box>
        <TablePagination
          component="div"
          count={movimientos.length}
          page={pagina}
          onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina)}
          rowsPerPage={filasPorPagina}
          onRowsPerPageChange={(event) => {
            setFilasPorPagina(Number(event.target.value))
            setPagina(0)
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Box>
    </Paper>
  )
}

export default MovimientosCajaTable
