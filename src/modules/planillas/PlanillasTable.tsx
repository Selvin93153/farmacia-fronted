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
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

import type {
  EstadoPlanilla,
  Planilla,
} from './planillasService'

interface PlanillasTableProps {
  planillas: Planilla[]
  onEditar: (planilla: Planilla) => void
  onVerDetalle: (planilla: Planilla) => void
}

const nombresMeses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function PlanillasTable({
  planillas,
  onEditar,
  onVerDetalle,
}: PlanillasTableProps) {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(valor)
  }

  const formatearFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(fecha))
  }

  const obtenerColorEstado = (
    estado: EstadoPlanilla,
  ): 'default' | 'warning' | 'info' | 'success' => {
    if (estado === 'PAGADA') {
      return 'success'
    }

    if (estado === 'GENERADA') {
      return 'info'
    }

    return 'warning'
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
      <Table aria-label="Listado de planillas" sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Planilla</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Período</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>
              Fecha de creación
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {planillas.map((planilla) => (
            <TableRow
              key={planilla.id_planilla}
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
                    <ReceiptLongRoundedIcon />
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      Planilla #{planilla.id_planilla}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Registro de nómina
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
                  <BusinessRoundedIcon fontSize="small" color="action" />

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {planilla.sucursal.nombre}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {planilla.sucursal.codigo}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {nombresMeses[planilla.mes - 1]} {planilla.anio}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {formatearMoneda(planilla.total_planilla)}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={planilla.estado}
                  color={obtenerColorEstado(planilla.estado)}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {formatearFecha(planilla.fecha_generacion)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ justifyContent: 'center' }}
                >
                  <Tooltip title="Ver detalle de planilla">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onVerDetalle(planilla)}
                    >
                      <VisibilityRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Administrar planilla">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onEditar(planilla)}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default PlanillasTable