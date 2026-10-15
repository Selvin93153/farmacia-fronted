import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'

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
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

import type { MovimientoAuditoriaEfectivo } from './auditoriaEfectivoService'

interface AuditoriaEfectivoTableProps {
  movimientos: MovimientoAuditoriaEfectivo[]
  onVerDetalle: (movimiento: MovimientoAuditoriaEfectivo) => void
}

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(valor)

const formatearFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha))

function AuditoriaEfectivoTable({
  movimientos,
  onVerDetalle,
}: AuditoriaEfectivoTableProps) {
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  const movimientosPaginados = useMemo(() => {
    const inicio = pagina * filasPorPagina
    return movimientos.slice(inicio, inicio + filasPorPagina)
  }, [movimientos, pagina, filasPorPagina])

  useEffect(() => {
    setPagina(0)
  }, [movimientos])

  const manejarCambioPagina = (_event: unknown, nuevaPagina: number) => {
    setPagina(nuevaPagina)
  }

  const manejarCambioFilas = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFilasPorPagina(Number(event.target.value))
    setPagina(0)
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Caja</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Origen</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Responsable</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Monto
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Acción
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {movimientosPaginados.map((movimiento) => {
              const esIngreso = movimiento.tipo_movimiento === 'INGRESO'
              const origen = movimiento.id_venta !== null ? 'VENTA' : 'MANUAL'

              return (
                <TableRow
                  key={movimiento.id_movimiento_caja}
                  hover
                  sx={{ '&:last-child td': { borderBottom: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatearFecha(movimiento.fecha)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {movimiento.caja.sucursal.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movimiento.caja.sucursal.codigo}
                    </Typography>
                  </TableCell>

                  <TableCell>{movimiento.caja.nombre}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={origen === 'VENTA' ? 'Venta' : 'Manual'}
                      variant={origen === 'VENTA' ? 'filled' : 'outlined'}
                      color={origen === 'VENTA' ? 'primary' : 'default'}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={movimiento.tipo_movimiento}
                      color={esIngreso ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>

                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      title={movimiento.concepto}
                    >
                      {movimiento.concepto}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {movimiento.usuario.nombre} {movimiento.usuario.apellido}
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: esIngreso ? 'success.main' : 'error.main',
                      }}
                    >
                      {esIngreso ? '+' : '-'} {formatearMoneda(movimiento.monto)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() => onVerDetalle(movimiento)}
                        aria-label="Ver detalle del movimiento"
                      >
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        <TablePagination
          component="div"
          count={movimientos.length}
          page={pagina}
          onPageChange={manejarCambioPagina}
          rowsPerPage={filasPorPagina}
          onRowsPerPageChange={manejarCambioFilas}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Filas por página"
        />
      </Box>
    </Paper>
  )
}

export default AuditoriaEfectivoTable
