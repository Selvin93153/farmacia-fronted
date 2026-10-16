import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import {
  obtenerDetallesPedido,
  type DetallePedidoEntrega,
  type Entrega,
  type EstadoEntrega,
} from './entregasService'

interface EntregaDetalleDialogProps {
  abierto: boolean
  entrega: Entrega | null
  onCerrar: () => void
}

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const pasos = ['Preparación', 'Asignada', 'En ruta', 'Entregada']

function pasoActivo(estado: EstadoEntrega): number {
  if (estado === 'PENDIENTE') return 0
  if (estado === 'ASIGNADA') return 1
  if (estado === 'EN_RUTA') return 2
  return 3
}

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message
    if (Array.isArray(mensaje)) return mensaje.join(', ')
    if (typeof mensaje === 'string') return mensaje
  }

  return 'No se pudieron cargar los medicamentos del pedido.'
}

function fechaTexto(fecha: string | null): string {
  if (!fecha) return 'Pendiente'
  return formatoFecha.format(new Date(fecha))
}

function EntregaDetalleDialog({ abierto, entrega, onCerrar }: EntregaDetalleDialogProps) {
  const [detalles, setDetalles] = useState<DetallePedidoEntrega[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto || !entrega) {
      setDetalles([])
      setError('')
      return
    }

    let activo = true

    const cargarDetalles = async () => {
      setCargando(true)
      setError('')

      try {
        const datos = await obtenerDetallesPedido(entrega.id_pedido)
        if (activo) setDetalles(datos)
      } catch (errorDesconocido: unknown) {
        if (activo) setError(obtenerMensajeError(errorDesconocido))
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarDetalles()

    return () => {
      activo = false
    }
  }, [abierto, entrega])

  if (!entrega) return null

  const pedido = entrega.pedido
  const cliente = pedido.cliente
  const sucursal = pedido.sucursal_asignada
  const nombreCliente = `${cliente.nombres} ${cliente.apellidos ?? ''}`.trim()

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Entrega #{entrega.id_entrega}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pedido #{entrega.id_pedido} · {nombreCliente}
            </Typography>
          </Box>
          <Chip
            label={entrega.estado.replace('_', ' ')}
            color={entrega.estado === 'ENTREGADA' ? 'success' : entrega.estado === 'PENDIENTE' ? 'warning' : 'info'}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {cargando && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            Seguimiento de la entrega
          </Typography>
          <Stepper activeStep={pasoActivo(entrega.estado)} alternativeLabel>
            {pasos.map((paso) => (
              <Step key={paso} completed={pasoActivo(entrega.estado) > pasos.indexOf(paso) || entrega.estado === 'ENTREGADA'}>
                <StepLabel>{paso}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Cliente y destino
            </Typography>
            <Stack spacing={1.6}>
              <DatoDetalle icono={<PersonRoundedIcon fontSize="small" />} titulo="Cliente" valor={nombreCliente} />
              <DatoDetalle icono={<PhoneRoundedIcon fontSize="small" />} titulo="Teléfono" valor={cliente.telefono} />
              <DatoDetalle icono={<LocationOnRoundedIcon fontSize="small" />} titulo="Dirección de entrega" valor={pedido.direccion_entrega} />
              <DatoDetalle icono={<StorefrontRoundedIcon fontSize="small" />} titulo="Sucursal responsable" valor={sucursal ? `${sucursal.codigo} · ${sucursal.nombre}` : 'Sin sucursal asignada'} />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Operación logística
            </Typography>
            <Stack spacing={1.6}>
              <DatoDetalle
                icono={<LocalShippingRoundedIcon fontSize="small" />}
                titulo="Repartidor"
                valor={entrega.repartidor ? `${entrega.repartidor.nombre} ${entrega.repartidor.apellido}` : 'Sin asignar'}
              />
              <DatoDetalle icono={<AccessTimeRoundedIcon fontSize="small" />} titulo="Tiempo estimado" valor={`${entrega.tiempo_estimado_min} minutos`} />
              <DatoDetalle icono={<AccessTimeRoundedIcon fontSize="small" />} titulo="Asignación" valor={fechaTexto(entrega.fecha_asignacion)} />
              <DatoDetalle icono={<AccessTimeRoundedIcon fontSize="small" />} titulo="Salida" valor={fechaTexto(entrega.fecha_salida)} />
              <DatoDetalle icono={<AccessTimeRoundedIcon fontSize="small" />} titulo="Entrega" valor={fechaTexto(entrega.fecha_entrega)} />
            </Stack>
          </Paper>
        </Box>

        <Paper variant="outlined" sx={{ mt: 2, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Medicamentos del pedido
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Productos preparados y descontados del inventario al crear la entrega.
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Total: {formatoMoneda.format(Number(pedido.total))}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Medicamento</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Precio</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!cargando && detalles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No se encontraron medicamentos para este pedido.
                    </TableCell>
                  </TableRow>
                )}

                {detalles.map((detalle) => (
                  <TableRow key={detalle.id_detalle_pedido}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {detalle.medicamento.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[detalle.medicamento.concentracion, detalle.medicamento.presentacion]
                          .filter(Boolean)
                          .join(' · ') || detalle.medicamento.codigo || `ID ${detalle.id_medicamento}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{detalle.cantidad}</TableCell>
                    <TableCell align="right">
                      {formatoMoneda.format(Number(detalle.precio_unitario))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatoMoneda.format(Number(detalle.subtotal))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper variant="outlined" sx={{ mt: 2, p: 2.5, borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Información adicional
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">Canal</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{pedido.canal}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Forma de pago</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{pedido.forma_pago?.nombre ?? 'No especificada'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Pedido registrado</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatoFecha.format(new Date(pedido.fecha))}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">Observaciones</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {entrega.observaciones || 'Sin observaciones registradas.'}
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar} sx={{ textTransform: 'none', fontWeight: 700 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface DatoDetalleProps {
  icono: ReactNode
  titulo: string
  valor: string
}

function DatoDetalle({ icono, titulo, valor }: DatoDetalleProps) {
  return (
    <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.15 }}>{icono}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{titulo}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{valor}</Typography>
      </Box>
    </Stack>
  )
}

export default EntregaDetalleDialog
