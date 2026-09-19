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

import type { Empleado } from './empleadosService'

interface EmpleadosTableProps {
  empleados: Empleado[]
  onEditar: (empleado: Empleado) => void
}

function EmpleadosTable({
  empleados,
  onEditar,
}: EmpleadosTableProps) {
  const formatearSalario = (salario: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(salario)
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
      <Table aria-label="Listado de empleados" sx={{ minWidth: 1050 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Empleado</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Puesto</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Salario</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>

            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {empleados.map((empleado) => (
            <TableRow
              key={empleado.id_empleado}
              hover
              sx={{
                '&:last-child td, &:last-child th': {
                  borderBottom: 0,
                },
              }}
            >
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {empleado.codigo_empleado}
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
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor: 'action.selected',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonRoundedIcon fontSize="small" />
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {empleado.nombres} {empleado.apellidos}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      ID #{empleado.id_empleado}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>{empleado.puesto}</TableCell>

              <TableCell>
                <Typography sx={{ fontWeight: 600 }}>
                  {empleado.sucursal?.nombre ??
                    `Sucursal ${empleado.id_sucursal}`}
                </Typography>

                {empleado.sucursal?.codigo && (
                  <Typography variant="caption" color="text.secondary">
                    {empleado.sucursal.codigo}
                  </Typography>
                )}
              </TableCell>

              <TableCell>{empleado.telefono}</TableCell>

              <TableCell sx={{ fontWeight: 600 }}>
                {formatearSalario(empleado.salario_base)}
              </TableCell>

              <TableCell>
                <Chip
                  label={empleado.estado}
                  color={empleado.estado === 'ACTIVO' ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>

              <TableCell align="center">
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    justifyContent: 'center',
                  }}
                >
                  <Tooltip title="Editar empleado">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onEditar(empleado)}
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

export default EmpleadosTable