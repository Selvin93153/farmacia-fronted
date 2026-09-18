import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

import type { Sucursal } from './sucursalesService'

interface SucursalesTableProps {
  sucursales: Sucursal[]
  onVerSucursal: (sucursal: Sucursal) => void
}

function SucursalesTable({
  sucursales,
  onVerSucursal,
}: SucursalesTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="Listado de sucursales" sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sucursales.map((sucursal) => (
            <TableRow key={sucursal.id_sucursal} hover>
              <TableCell>{sucursal.codigo}</TableCell>
              <TableCell>{sucursal.nombre}</TableCell>
              <TableCell>{sucursal.tipo_sucursal}</TableCell>
              <TableCell>{sucursal.direccion}</TableCell>
              <TableCell>{sucursal.telefono}</TableCell>
              <TableCell>{sucursal.estado}</TableCell>

              <TableCell align="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onVerSucursal(sucursal)}
                >
                  Ver sucursal
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SucursalesTable