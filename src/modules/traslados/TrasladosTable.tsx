import {
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
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

import type { Traslado } from './trasladosService'

interface TrasladosTableProps {
  traslados: Traslado[]
  idSucursalUsuario: number | null
  pagina: number
  filasPorPagina: number
  onCambiarPagina: (pagina: number) => void
  onCambiarFilasPorPagina: (filas: number) => void
  onVer: (traslado: Traslado) => void
  onEditar: (traslado: Traslado) => void
  onPreparar: (traslado: Traslado) => void
  onEnviar: (traslado: Traslado) => void
  onRecibir: (traslado: Traslado) => void
  onCancelar: (traslado: Traslado) => void
}

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function colorEstado(
  estado: string,
): 'default' | 'info' | 'success' | 'warning' | 'error' {
  if (estado === 'SOLICITADO') return 'warning'
  if (estado === 'ENVIADO') return 'info'
  if (estado === 'RECIBIDO') return 'success'
  if (estado === 'CANCELADO') return 'error'
  return 'default'
}

export default function TrasladosTable({
  traslados,
  idSucursalUsuario,
  pagina,
  filasPorPagina,
  onCambiarPagina,
  onCambiarFilasPorPagina,
  onVer,
  onEditar,
  onPreparar,
  onEnviar,
  onRecibir,
  onCancelar,
}: TrasladosTableProps) {
  const inicio = pagina * filasPorPagina
  const trasladosPagina = traslados.slice(
    inicio,
    inicio + filasPorPagina,
  )

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 3, overflow: 'hidden' }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell>
                <strong>Traslado</strong>
              </TableCell>
              <TableCell>
                <strong>Origen</strong>
              </TableCell>
              <TableCell>
                <strong>Destino</strong>
              </TableCell>
              <TableCell>
                <strong>Medicamentos</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
              <TableCell>
                <strong>Fecha</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Acciones</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {trasladosPagina.map((traslado) => {
              const esOrigen =
                idSucursalUsuario !== null &&
                traslado.id_sucursal_origen === idSucursalUsuario

              const esDestino =
                idSucursalUsuario !== null &&
                traslado.id_sucursal_destino === idSucursalUsuario

              const puedeModificar =
                traslado.estado === 'SOLICITADO' && esOrigen

              const puedeRecibir =
                traslado.estado === 'ENVIADO' && esDestino

              return (
                <TableRow key={traslado.id_traslado} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800 }}
                    >
                      #{traslado.id_traslado}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {esOrigen
                        ? 'Salida'
                        : esDestino
                          ? 'Entrada'
                          : 'General'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      {traslado.sucursal_origen.nombre}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {traslado.sucursal_origen.codigo}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      {traslado.sucursal_destino.nombre}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {traslado.sucursal_destino.codigo}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {traslado.detalles?.length ?? 0}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={traslado.estado.replace(/_/g, ' ')}
                      color={colorEstado(traslado.estado)}
                      variant={
                        traslado.estado === 'SOLICITADO'
                          ? 'outlined'
                          : 'filled'
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatoFecha.format(
                        new Date(traslado.fecha_solicitud),
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() => onVer(traslado)}
                      >
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {puedeModificar && (
                      <>
                        <Tooltip title="Editar traslado">
                          <IconButton
                            size="small"
                            onClick={() => onEditar(traslado)}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Preparar medicamentos">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onPreparar(traslado)}
                          >
                            <Inventory2RoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Enviar traslado">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => onEnviar(traslado)}
                          >
                            <LocalShippingRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Cancelar traslado">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onCancelar(traslado)}
                          >
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {puedeRecibir && (
                      <Tooltip title="Recibir traslado">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onRecibir(traslado)}
                        >
                          <MoveToInboxRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {trasladosPagina.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography sx={{ color: 'text.secondary' }}>
                    No hay traslados que coincidan con los filtros.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={traslados.length}
        page={pagina}
        onPageChange={(_, nuevaPagina) =>
          onCambiarPagina(nuevaPagina)
        }
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={(event) =>
          onCambiarFilasPorPagina(Number(event.target.value))
        }
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página:"
      />
    </Paper>
  )
}
