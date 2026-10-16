import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'

import type {
  EnviarDetalleTraslado,
  Traslado,
} from './trasladosService'

interface EnviarTrasladoDialogProps {
  abierto: boolean
  traslado: Traslado | null
  procesando: boolean
  error: string
  onCerrar: () => void
  onEnviar: (
    detalles: EnviarDetalleTraslado[],
  ) => Promise<void>
}

export default function EnviarTrasladoDialog({
  abierto,
  traslado,
  procesando,
  error,
  onCerrar,
  onEnviar,
}: EnviarTrasladoDialogProps) {
  const [cantidades, setCantidades] = useState<
    Record<number, number>
  >({})

  useEffect(() => {
    if (!abierto || !traslado) return

    const iniciales: Record<number, number> = {}

    traslado.detalles.forEach((detalle) => {
      iniciales[detalle.id_detalle_traslado] =
        detalle.cantidad_solicitada
    })

    setCantidades(iniciales)
  }, [abierto, traslado])

  const totalEnviado = useMemo(
    () =>
      Object.values(cantidades).reduce(
        (total, cantidad) => total + cantidad,
        0,
      ),
    [cantidades],
  )

  const formularioValido =
    Boolean(traslado?.detalles.length) &&
    totalEnviado > 0 &&
    traslado?.detalles.every((detalle) => {
      const cantidad =
        cantidades[detalle.id_detalle_traslado] ?? 0

      return (
        Number.isInteger(cantidad) &&
        cantidad >= 0 &&
        cantidad <= detalle.cantidad_solicitada
      )
    })

  const enviar = async () => {
    if (!traslado || !formularioValido) return

    await onEnviar(
      traslado.detalles.map((detalle) => ({
        id_detalle_traslado:
          detalle.id_detalle_traslado,
        cantidad_enviada:
          cantidades[detalle.id_detalle_traslado] ?? 0,
      })),
    )
  }

  return (
    <Dialog
      open={abierto}
      onClose={() => {
        if (!procesando) onCerrar()
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Enviar traslado{' '}
        {traslado ? `#${traslado.id_traslado}` : ''}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <Alert severity="info" variant="outlined">
            Al confirmar, el backend descontará automáticamente
            del inventario de la sucursal origen las cantidades
            indicadas.
          </Alert>

          {traslado?.detalles.map((detalle) => (
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
                <Typography sx={{ flex: 1, fontWeight: 700 }}>
                  {detalle.medicamento.codigo} ·{' '}
                  {detalle.medicamento.nombre}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Solicitado: {detalle.cantidad_solicitada}
                </Typography>

                <TextField
                  size="small"
                  label="Enviar"
                  type="number"
                  value={
                    cantidades[
                      detalle.id_detalle_traslado
                    ] ?? 0
                  }
                  onChange={(event) => {
                    const valor = Math.max(
                      0,
                      Number(event.target.value) || 0,
                    )

                    setCantidades((actual) => ({
                      ...actual,
                      [detalle.id_detalle_traslado]: valor,
                    }))
                  }}
                  sx={{ width: 120 }}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: detalle.cantidad_solicitada,
                      step: 1,
                    },
                  }}
                />
              </Stack>
            </Paper>
          ))}

          <Typography
            variant="body2"
            sx={{
              textAlign: 'right',
              color: 'text.secondary',
              fontWeight: 700,
            }}
          >
            Total de unidades a enviar: {totalEnviado}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar} disabled={procesando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<LocalShippingRoundedIcon />}
          onClick={() => void enviar()}
          disabled={procesando || !formularioValido}
        >
          Confirmar envío
        </Button>
      </DialogActions>
    </Dialog>
  )
}
