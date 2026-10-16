import {
  Box,
  Button,
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
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Entrega, EstadoEntrega } from './entregasService'

interface EntregasTableProps {
  entregas: Entrega[]
  cargando?: boolean
  onVerDetalle: (entrega: Entrega) => void
  onAsignarRepartidor: (entrega: Entrega) => void
  onEditarObservaciones: (entrega: Entrega) => void
  onIniciar: (entrega: Entrega) => void
  onCompletar: (entrega: Entrega) => void
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

function etiquetaEstado(estado: EstadoEntrega): string {
  if (estado === 'EN_RUTA') return 'En ruta'
  if (estado === 'ENTREGADA') return 'Entregada'
  if (estado === 'ASIGNADA') return 'Asignada'
  return 'Pendiente'
}

function colorEstado(estado: EstadoEntrega): 'default' | 'warning' | 'info' | 'success' {
  if (estado === 'PENDIENTE') return 'warning'
  if (estado === 'ASIGNADA') return 'info'
  if (estado === 'EN_RUTA') return 'info'
  if (estado === 'ENTREGADA') return 'success'
  return 'default'
}

function obtenerEstadoTiempo(entrega: Entrega): {
  texto: string
  color: 'default' | 'success' | 'warning' | 'error'
} | null {
  if (!entrega.fecha_salida || !['EN_RUTA', 'ENTREGADA'].includes(entrega.estado)) {
    return null
  }

  const inicio = new Date(entrega.fecha_salida).getTime()
  const fin = entrega.fecha_entrega
    ? new Date(entrega.fecha_entrega).getTime()
    : Date.now()

  if (!Number.isFinite(inicio) || !Number.isFinite(fin)) return null

  const minutos = Math.max(0, Math.floor((fin - inicio) / 60000))
  const dentroDelTiempo = minutos <= entrega.tiempo_estimado_min

  if (entrega.estado === 'ENTREGADA') {
    return dentroDelTiempo
      ? { texto: 'Cumplida a tiempo', color: 'success' }
      : { texto: 'Fuera de tiempo', color: 'warning' }
  }

  return dentroDelTiempo
    ? { texto: 'A tiempo', color: 'success' }
    : { texto: 'Retrasada', color: 'error' }
}

function EntregasTable({
  entregas,
  cargando = false,
  onVerDetalle,
  onAsignarRepartidor,
  onEditarObservaciones,
  onIniciar,
  onCompletar,
}: EntregasTableProps) {
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  const paginaValida = Math.min(
    pagina,
    Math.max(0, Math.ceil(entregas.length / filasPorPagina) - 1),
  )

  const filasVisibles = useMemo(() => {
    const inicio = paginaValida * filasPorPagina
    return entregas.slice(inicio, inicio + filasPorPagina)
  }, [entregas, paginaValida, filasPorPagina])

  const cambiarPagina = (_event: unknown, nuevaPagina: number) => {
    setPagina(nuevaPagina)
  }

  const cambiarFilasPorPagina = (event: ChangeEvent<HTMLInputElement>) => {
    setFilasPorPagina(Number(event.target.value))
    setPagina(0)
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 1120 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Entrega</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pedido / Cliente</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Repartidor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tiempo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!cargando && filasVisibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      No hay entregas para mostrar
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Ajusta los filtros o registra una entrega para un pedido confirmado.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {filasVisibles.map((entrega) => {
              const cliente = entrega.pedido.cliente
              const sucursal = entrega.pedido.sucursal_asignada
              const estadoTiempo = obtenerEstadoTiempo(entrega)

              return (
                <TableRow key={entrega.id_entrega} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      #{entrega.id_entrega}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entrega.fecha_asignacion
                        ? `Asignada ${formatoFecha.format(new Date(entrega.fecha_asignacion))}`
                        : 'Sin asignar'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Pedido #{entrega.id_pedido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cliente.nombres} {cliente.apellidos ?? ''}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {sucursal?.nombre ?? 'Sin sucursal'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sucursal?.codigo ?? '—'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {entrega.repartidor ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entrega.repartidor.nombre} {entrega.repartidor.apellido}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entrega.repartidor.telefono || entrega.repartidor.correo}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin asignar
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={etiquetaEstado(entrega.estado)}
                      color={colorEstado(entrega.estado)}
                      variant={entrega.estado === 'ENTREGADA' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {entrega.tiempo_estimado_min} min estimados
                    </Typography>
                    {estadoTiempo && (
                      <Chip
                        size="small"
                        label={estadoTiempo.texto}
                        color={estadoTiempo.color}
                        variant="outlined"
                        sx={{ mt: 0.5, fontWeight: 600 }}
                      />
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatoMoneda.format(Number(entrega.pedido.total))}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onVerDetalle(entrega)}>
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {entrega.estado !== 'ENTREGADA' && (
                        <Tooltip title="Editar observaciones">
                          <IconButton size="small" onClick={() => onEditarObservaciones(entrega)}>
                            <EditNoteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {['PENDIENTE', 'ASIGNADA'].includes(entrega.estado) && (
                        <Tooltip title={entrega.estado === 'ASIGNADA' ? 'Cambiar repartidor' : 'Asignar repartidor'}>
                          <IconButton size="small" onClick={() => onAsignarRepartidor(entrega)}>
                            <PersonAddAlt1RoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {entrega.estado === 'ASIGNADA' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LocalShippingRoundedIcon />}
                          onClick={() => onIniciar(entrega)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Iniciar
                        </Button>
                      )}

                      {entrega.estado === 'EN_RUTA' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleRoundedIcon />}
                          onClick={() => onCompletar(entrega)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Entregar
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={entregas.length}
        page={paginaValida}
        onPageChange={cambiarPagina}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={cambiarFilasPorPagina}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página:"
      />
    </Paper>
  )
}

export default EntregasTable
