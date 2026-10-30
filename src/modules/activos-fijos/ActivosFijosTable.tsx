import { useEffect, useState } from 'react'

import {
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

import EditRoundedIcon from '@mui/icons-material/EditRounded'

import type { ActivoFijo } from './activosFijosService'

interface ActivosFijosTableProps {
  activos: ActivoFijo[]
  puedeEditar: boolean
  onEditar: (activo: ActivoFijo) => void
}

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
})

function ActivosFijosTable({
  activos,
  puedeEditar,
  onEditar,
}: ActivosFijosTableProps) {
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  useEffect(() => {
    setPagina(0)
  }, [activos])

  const activosPagina = activos.slice(
    pagina * filasPorPagina,
    (pagina + 1) * filasPorPagina,
  )

  const obtenerColorEstado = (estado: ActivoFijo['estado']) => {
    if (estado === 'ACTIVO') {
      return 'success' as const
    }

    if (estado === 'MANTENIMIENTO') {
      return 'warning' as const
    }

    return 'default' as const
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: puedeEditar ? 1100 : 1000 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Activo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Adquisición</TableCell>

              <TableCell sx={{ fontWeight: 700 }} align="right">
                Valor adquisición
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }} align="right">
                Valor actual
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>

              {puedeEditar && (
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {activosPagina.map((activo) => (
              <TableRow hover key={activo.id_activo}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {activo.codigo}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, maxWidth: 260 }}
                    noWrap
                    title={activo.descripcion}
                  >
                    {activo.descripcion}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {activo.categoria}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {activo.sucursal.nombre}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {activo.sucursal.codigo}
                  </Typography>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatoFecha.format(
                    new Date(`${activo.fecha_adquisicion}T00:00:00`),
                  )}
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {formatoMoneda.format(Number(activo.valor_adquisicion))}
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatoMoneda.format(Number(activo.valor_actual))}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={
                      activo.estado === 'MANTENIMIENTO'
                        ? 'Mantenimiento'
                        : activo.estado === 'BAJA'
                          ? 'Baja'
                          : 'Activo'
                    }
                    color={obtenerColorEstado(activo.estado)}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>

                {puedeEditar && (
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditRoundedIcon />}
                      onClick={() => onEditar(activo)}
                      sx={{ textTransform: 'none' }}
                    >
                      Editar
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={activos.length}
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
    </Paper>
  )
}

export default ActivosFijosTable