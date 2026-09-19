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

import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'

import type { DetallePlanilla } from './detallesPlanillaService'

interface DetallesPlanillaTableProps {
  detalles: DetallePlanilla[]
  editable: boolean
  onEditar: (detalle: DetallePlanilla) => void
}

function DetallesPlanillaTable({
  detalles,
  editable,
  onEditar,
}: DetallesPlanillaTableProps) {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(valor)
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
      <Table aria-label="Detalle de planilla" sx={{ minWidth: 1100 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Empleado</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Puesto</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Salario base</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Bonificaciones</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Descuentos</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Total pagado</TableCell>

            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {detalles.map((detalle) => (
            <TableRow
              key={detalle.id_detalle_planilla}
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
                    <PersonRoundedIcon />
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {detalle.empleado.nombres} {detalle.empleado.apellidos}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {detalle.empleado.codigo_empleado}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>{detalle.empleado.puesto}</TableCell>

              <TableCell>
                <Typography sx={{ fontWeight: 600 }}>
                  {formatearMoneda(detalle.salario_base)}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={`+ ${formatearMoneda(detalle.bonificaciones)}`}
                  color={detalle.bonificaciones > 0 ? 'success' : 'default'}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={`- ${formatearMoneda(detalle.descuentos)}`}
                  color={detalle.descuentos > 0 ? 'error' : 'default'}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              <TableCell>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: 'success.main',
                  }}
                >
                  {formatearMoneda(detalle.total_pagado)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                {editable ? (
                  <Tooltip title="Editar bonificaciones y descuentos">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onEditar(detalle)}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Chip
                    label="Solo lectura"
                    size="small"
                    variant="outlined"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DetallesPlanillaTable