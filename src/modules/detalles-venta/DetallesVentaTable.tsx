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

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'

import type { DetalleVenta } from './detallesVentaService'

interface DetallesVentaTableProps {
  detalles: DetalleVenta[]
  editable: boolean
  procesandoId: number | null
  onCambiarCantidad: (
    detalle: DetalleVenta,
    nuevaCantidad: number,
  ) => void
  onEliminar: (detalle: DetalleVenta) => void
}

function DetallesVentaTable({
  detalles,
  editable,
  procesandoId,
  onCambiarCantidad,
  onEliminar,
}: DetallesVentaTableProps) {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor)
  }

  if (detalles.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <MedicationRoundedIcon
          sx={{
            fontSize: 48,
            color: 'text.disabled',
            mb: 1,
          }}
        />

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Venta sin medicamentos
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Busca y agrega los medicamentos solicitados por el
          cliente.
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
        overflow: 'hidden',
      }}
    >
      <Table
        aria-label="Medicamentos de la venta"
        sx={{ minWidth: 850 }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>
              Medicamento
            </TableCell>

            <TableCell
              align="right"
              sx={{ fontWeight: 700 }}
            >
              Precio
            </TableCell>

            <TableCell
              align="center"
              sx={{ fontWeight: 700 }}
            >
              Cantidad
            </TableCell>

            <TableCell
              align="right"
              sx={{ fontWeight: 700 }}
            >
              Subtotal
            </TableCell>

            {editable && (
              <TableCell
                align="center"
                sx={{ fontWeight: 700 }}
              >
                Acción
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {detalles.map((detalle) => {
            const procesando =
              procesandoId === detalle.id_detalle_venta

            return (
              <TableRow
                key={detalle.id_detalle_venta}
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
                      <MedicationRoundedIcon />
                    </Box>

                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography sx={{ fontWeight: 700 }}>
                          {detalle.medicamento.nombre}{' '}
                          {detalle.medicamento.concentracion}
                        </Typography>

                        {detalle.medicamento
                          .requiere_receta && (
                          <Chip
                            icon={
                              <ReceiptLongRoundedIcon />
                            }
                            label="Receta"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {detalle.medicamento.codigo} ·{' '}
                        {detalle.medicamento.presentacion}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell align="right">
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatearMoneda(
                      detalle.precio_unitario,
                    )}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  {editable ? (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Tooltip title="Disminuir cantidad">
                        <span>
                          <IconButton
                            size="small"
                            disabled={
                              procesando ||
                              detalle.cantidad <= 1
                            }
                            onClick={() =>
                              onCambiarCantidad(
                                detalle,
                                detalle.cantidad - 1,
                              )
                            }
                          >
                            <RemoveRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Box
                        sx={{
                          minWidth: 42,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1.5,
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                          }}
                        >
                          {detalle.cantidad}
                        </Typography>
                      </Box>

                      <Tooltip title="Aumentar cantidad">
                        <span>
                          <IconButton
                            size="small"
                            disabled={procesando}
                            onClick={() =>
                              onCambiarCantidad(
                                detalle,
                                detalle.cantidad + 1,
                              )
                            }
                          >
                            <AddRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Typography sx={{ fontWeight: 700 }}>
                      {detalle.cantidad}
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="right">
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: 'text.primary',
                    }}
                  >
                    {formatearMoneda(detalle.subtotal)}
                  </Typography>
                </TableCell>

                {editable && (
                  <TableCell align="center">
                    <Tooltip title="Quitar medicamento">
                      <span>
                        <IconButton
                          color="error"
                          disabled={procesando}
                          onClick={() => onEliminar(detalle)}
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DetallesVentaTable