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
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'

import type { Medicamento } from './medicamentosService'

interface MedicamentosTableProps {
  medicamentos: Medicamento[]
  onEditar: (medicamento: Medicamento) => void
}

function MedicamentosTable({
  medicamentos,
  onEditar,
}: MedicamentosTableProps) {
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(precio)
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
      <Table aria-label="Listado de medicamentos" sx={{ minWidth: 1150 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Medicamento</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>
              Principio activo
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Presentación</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Laboratorio</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Precio</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Venta</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>

            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {medicamentos.map((medicamento) => (
            <TableRow
              key={medicamento.id_medicamento}
              hover
              sx={{
                '&:last-child td, &:last-child th': {
                  borderBottom: 0,
                },
              }}
            >
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {medicamento.codigo}
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
                    <LocalPharmacyRoundedIcon />
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {medicamento.nombre}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {medicamento.concentracion}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>{medicamento.principio_activo}</TableCell>

              <TableCell>{medicamento.presentacion}</TableCell>

              <TableCell>{medicamento.laboratorio}</TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                {formatearPrecio(medicamento.precio_venta)}
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    medicamento.requiere_receta
                      ? 'Requiere receta'
                      : 'Venta libre'
                  }
                  color={medicamento.requiere_receta ? 'warning' : 'info'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={medicamento.estado}
                  color={
                    medicamento.estado === 'ACTIVO'
                      ? 'success'
                      : 'default'
                  }
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Editar medicamento">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => onEditar(medicamento)}
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

export default MedicamentosTable