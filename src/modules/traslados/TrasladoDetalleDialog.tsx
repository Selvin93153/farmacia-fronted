import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import type { Traslado } from './trasladosService'

interface TrasladoDetalleDialogProps {
  abierto: boolean
  traslado: Traslado | null
  onCerrar: () => void
}

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function textoUsuario(
  usuario: Traslado['usuario_envia'],
): string {
  if (!usuario) return 'Pendiente'

  return `${usuario.nombre} ${usuario.apellido}`.trim()
}

export default function TrasladoDetalleDialog({
  abierto,
  traslado,
  onCerrar,
}: TrasladoDetalleDialogProps) {
  if (!traslado) {
    return null
  }

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Detalle del traslado #{traslado.id_traslado}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Ruta
              </Typography>
              <Typography
                variant="h6"
                sx={{ mt: 0.3, fontWeight: 800 }}
              >
                {traslado.sucursal_origen.nombre} →{' '}
                {traslado.sucursal_destino.nombre}
              </Typography>
            </Box>

            <Chip
              label={traslado.estado.replace(/_/g, ' ')}
              color={
                traslado.estado === 'RECIBIDO'
                  ? 'success'
                  : traslado.estado === 'ENVIADO'
                    ? 'info'
                    : traslado.estado === 'CANCELADO'
                      ? 'error'
                      : 'warning'
              }
            />
          </Stack>

          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
          >
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2.5, flex: 1 }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                Solicitado por
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {traslado.sucursal_destino.nombre}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                {formatoFecha.format(
                  new Date(traslado.fecha_solicitud),
                )}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2.5, flex: 1 }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                Enviado por
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {textoUsuario(traslado.usuario_envia)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                {traslado.fecha_envio
                  ? formatoFecha.format(
                      new Date(traslado.fecha_envio),
                    )
                  : 'Pendiente'}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2.5, flex: 1 }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                Recibido por
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {textoUsuario(traslado.usuario_recibe)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                {traslado.fecha_recepcion
                  ? formatoFecha.format(
                      new Date(traslado.fecha_recepcion),
                    )
                  : 'Pendiente'}
              </Typography>
            </Paper>
          </Stack>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, mb: 1.5 }}
            >
              Medicamentos
            </Typography>

            <Stack spacing={1}>
              {traslado.detalles.map((detalle) => (
                <Paper
                  key={detalle.id_detalle_traslado}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2 }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ alignItems: { sm: 'center' } }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {detalle.medicamento.nombre}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {detalle.medicamento.codigo}
                      </Typography>
                    </Box>

                    <Typography variant="body2">
                      Solicitado:{' '}
                      <strong>
                        {detalle.cantidad_solicitada}
                      </strong>
                    </Typography>

                    <Typography variant="body2">
                      Enviado:{' '}
                      <strong>
                        {detalle.cantidad_enviada ?? '—'}
                      </strong>
                    </Typography>

                    <Typography variant="body2">
                      Recibido:{' '}
                      <strong>
                        {detalle.cantidad_recibida ?? '—'}
                      </strong>
                    </Typography>
                  </Stack>
                </Paper>
              ))}

              {traslado.detalles.length === 0 && (
                <Typography sx={{ color: 'text.secondary' }}>
                  Este traslado todavía no tiene medicamentos.
                </Typography>
              )}
            </Stack>
          </Box>

          {traslado.observaciones && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800 }}
              >
                Observaciones
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                {traslado.observaciones}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
