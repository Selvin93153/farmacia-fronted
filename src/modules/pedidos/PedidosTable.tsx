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
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import type { Pedido } from './pedidosService'

interface PedidosTableProps {
  pedidos: Pedido[]
  pagina: number
  filasPorPagina: number
  onCambiarPagina: (pagina: number) => void
  onCambiarFilasPorPagina: (filas: number) => void
  onVer: (pedido: Pedido) => void
  onEditar: (pedido: Pedido) => void
  onPreparar: (pedido: Pedido) => void
  onEliminar: (pedido: Pedido) => void
}

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function colorEstado(estado: string): 'default' | 'info' | 'success' | 'warning' | 'primary' {
  if (estado === 'BORRADOR') return 'default'
  if (estado === 'CONFIRMADO') return 'info'
  if (estado === 'EN_PREPARACION') return 'warning'
  if (estado === 'EN_ENTREGA') return 'primary'
  if (estado === 'ENTREGADO') return 'success'
  return 'default'
}

function textoCanal(canal: string): string {
  if (canal === 'CALL_CENTER') return 'Call center'
  if (canal === 'PORTAL_WEB') return 'Portal web'
  if (canal === 'TELEFONO') return 'Teléfono'
  return canal
}

export default function PedidosTable({
  pedidos,
  pagina,
  filasPorPagina,
  onCambiarPagina,
  onCambiarFilasPorPagina,
  onVer,
  onEditar,
  onPreparar,
  onEliminar,
}: PedidosTableProps) {
  const inicio = pagina * filasPorPagina
  const pedidosPagina = pedidos.slice(inicio, inicio + filasPorPagina)

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell><strong>Pedido</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Canal</strong></TableCell>
              <TableCell><strong>Sucursal asignada</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pedidosPagina.map((pedido) => (
              <TableRow key={pedido.id_pedido} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    #{pedido.id_pedido}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatoFecha.format(new Date(pedido.fecha))}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {pedido.cliente.nombres} {pedido.cliente.apellidos ?? ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {pedido.cliente.telefono}
                  </Typography>
                </TableCell>

                <TableCell>{textoCanal(pedido.canal)}</TableCell>

                <TableCell>
                  {pedido.sucursal_asignada ? (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {pedido.sucursal_asignada.nombre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {pedido.sucursal_asignada.codigo}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Sin asignar
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={pedido.estado.replaceAll('_', ' ')}
                    color={colorEstado(pedido.estado)}
                    variant={pedido.estado === 'BORRADOR' ? 'outlined' : 'filled'}
                  />
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatoMoneda.format(Number(pedido.total))}
                  </Typography>
                </TableCell>

                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Ver detalle">
                    <IconButton size="small" onClick={() => onVer(pedido)}>
                      <VisibilityRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {pedido.estado === 'BORRADOR' && (
                    <>
                      <Tooltip title="Editar datos">
                        <IconButton size="small" onClick={() => onEditar(pedido)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Preparar y asignar sucursal">
                        <IconButton size="small" color="primary" onClick={() => onPreparar(pedido)}>
                          <HubRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar pedido">
                        <IconButton size="small" color="error" onClick={() => onEliminar(pedido)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {pedidosPagina.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    No hay pedidos que coincidan con los filtros seleccionados.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pedidos.length}
        page={pagina}
        onPageChange={(_, nuevaPagina) => onCambiarPagina(nuevaPagina)}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={(event) => onCambiarFilasPorPagina(Number(event.target.value))}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página:"
      />
    </Paper>
  )
}
