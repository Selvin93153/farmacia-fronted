import { useEffect, useState } from 'react'
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
  Button,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import {
  obtenerDetallesPedido,
  type DetallePedido,
  type Pedido,
} from './pedidosService'

interface PedidoDetalleDialogProps {
  abierto: boolean
  pedido: Pedido | null
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

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message
    if (Array.isArray(mensaje)) return mensaje.join(', ')
    if (typeof mensaje === 'string') return mensaje
  }

  return 'No se pudo cargar el detalle del pedido.'
}

function pasoActivo(estado: string): number {
  if (estado === 'BORRADOR') return 0
  if (estado === 'CONFIRMADO') return 1
  if (estado === 'EN_PREPARACION') return 2
  if (estado === 'EN_ENTREGA') return 3
  if (estado === 'ENTREGADO') return 4
  return 0
}

function textoCanal(canal: string): string {
  if (canal === 'CALL_CENTER') return 'Call center'
  if (canal === 'PORTAL_WEB') return 'Portal web'
  if (canal === 'TELEFONO') return 'Teléfono'
  return canal
}

export default function PedidoDetalleDialog({
  abierto,
  pedido,
  onCerrar,
}: PedidoDetalleDialogProps) {
  const [detalles, setDetalles] = useState<DetallePedido[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto || !pedido) return

    setCargando(true)
    setError('')

    void obtenerDetallesPedido(pedido.id_pedido)
      .then(setDetalles)
      .catch((errorDesconocido: unknown) => setError(obtenerMensajeError(errorDesconocido)))
      .finally(() => setCargando(false))
  }, [abierto, pedido])

  if (!pedido) return null

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="lg">
      <DialogTitle>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>Pedido #{pedido.id_pedido}</Typography>
            <Typography variant="body2" color="text.secondary">
              Registrado {formatoFecha.format(new Date(pedido.fecha))}
            </Typography>
          </Box>
          <Chip label={pedido.estado.replaceAll('_', ' ')} color={pedido.estado === 'ENTREGADO' ? 'success' : 'primary'} />
        </Stack>
      </DialogTitle>

      {cargando && <LinearProgress />}

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stepper activeStep={pasoActivo(pedido.estado)} alternativeLabel>
              {['Borrador', 'Confirmado', 'Preparación', 'En entrega', 'Entregado'].map((etiqueta) => (
                <Step key={etiqueta}><StepLabel>{etiqueta}</StepLabel></Step>
              ))}
            </Stepper>
          </Paper>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <PersonRoundedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={800}>Cliente</Typography>
              </Stack>
              <Typography fontWeight={700}>
                {pedido.cliente.nombres} {pedido.cliente.apellidos ?? ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">{pedido.cliente.telefono}</Typography>
              {pedido.cliente.correo && (
                <Typography variant="body2" color="text.secondary">{pedido.cliente.correo}</Typography>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <LocationOnRoundedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={800}>Entrega</Typography>
              </Stack>
              <Typography variant="body2">{pedido.direccion_entrega}</Typography>
              <Typography variant="caption" color="text.secondary">
                {pedido.latitud_entrega}, {pedido.longitud_entrega}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <ReceiptLongRoundedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={800}>Registro</Typography>
              </Stack>
              <Typography variant="body2"><strong>Canal:</strong> {textoCanal(pedido.canal)}</Typography>
              <Typography variant="body2"><strong>Pago:</strong> {pedido.forma_pago?.nombre ?? 'Pendiente'}</Typography>
              <Typography variant="body2"><strong>Usuario:</strong> {pedido.usuario_registra ? `${pedido.usuario_registra.nombre} ${pedido.usuario_registra.apellido}` : 'No disponible'}</Typography>
            </Paper>
          </Stack>

          {pedido.sucursal_asignada && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <StorefrontRoundedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={800}>Sucursal responsable</Typography>
              </Stack>
              <Typography fontWeight={700}>{pedido.sucursal_asignada.nombre}</Typography>
              <Typography variant="body2" color="text.secondary">
                {pedido.sucursal_asignada.codigo} · {pedido.sucursal_asignada.direccion}
              </Typography>
            </Paper>
          )}

          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6" fontWeight={800}>Medicamentos</Typography>
              <Chip label={`${detalles.length} productos`} variant="outlined" />
            </Stack>

            <Stack spacing={1}>
              {detalles.map((detalle) => (
                <Paper key={detalle.id_detalle_pedido} variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700}>{detalle.medicamento.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {detalle.medicamento.codigo}
                        {detalle.medicamento.concentracion ? ` · ${detalle.medicamento.concentracion}` : ''}
                        {detalle.medicamento.presentacion ? ` · ${detalle.medicamento.presentacion}` : ''}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{detalle.cantidad} × {formatoMoneda.format(Number(detalle.precio_unitario))}</Typography>
                    <Typography fontWeight={800} sx={{ minWidth: 100, textAlign: { sm: 'right' } }}>
                      {formatoMoneda.format(Number(detalle.subtotal))}
                    </Typography>
                  </Stack>
                </Paper>
              ))}

              {!cargando && detalles.length === 0 && (
                <Alert severity="info" variant="outlined">Este pedido todavía no tiene medicamentos agregados.</Alert>
              )}
            </Stack>
          </Box>

          <Divider />

          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">Total del pedido</Typography>
              <Typography variant="h5" fontWeight={900}>{formatoMoneda.format(Number(pedido.total))}</Typography>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
