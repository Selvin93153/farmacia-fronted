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
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded'

import type {
  RecibirDetalleTraslado,
  Traslado,
} from './trasladosService'

interface RecibirTrasladoDialogProps {
  abierto: boolean
  traslado: Traslado | null
  procesando: boolean
  error: string
  onCerrar: () => void
  onRecibir: (
    detalles: RecibirDetalleTraslado[],
  ) => Promise<void>
}

export default function RecibirTrasladoDialog({
  abierto,
  traslado,
  procesando,
  error,
  onCerrar,
  onRecibir,
}: RecibirTrasladoDialogProps) {
  const [cantidades, setCantidades] = useState<
    Record<number, number>
  >({})

  useEffect(() => {
    if (!abierto || !traslado) return

    const iniciales: Record<number, number> = {}

    traslado.detalles.forEach((detalle) => {
      iniciales[detalle.id_detalle_traslado] =
        detalle.cantidad_enviada ?? 0
    })

    setCantidades(iniciales)
  }, [abierto, traslado])

  const totalRecibido = useMemo(
    () =>
      Object.values(cantidades).reduce(
        (total, cantidad) => total + cantidad,
        0,
      ),
    [cantidades],
  )

  const formularioValido =
    Boolean(traslado?.detalles.length) &&
    totalRecibido > 0 &&
    traslado?.detalles.every((detalle) => {
      const cantidad =
        cantidades[detalle.id_detalle_traslado] ?? 0
      const maximo = detalle.cantidad_enviada ?? 0

      return (
        Number.isInteger(cantidad) &&
        cantidad >= 0 &&
        cantidad <= maximo
      )
    })

  const recibir = async () => {
    if (!traslado || !formularioValido) return

    await onRecibir(
      traslado.detalles.map((detalle) => ({
        id_detalle_traslado:
          detalle.id_detalle_traslado,
        cantidad_recibida:
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
        Recibir traslado{' '}
        {traslado ? `#${traslado.id_traslado}` : ''}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <Alert severity="success" variant="outlined">
            Confirma las cantidades que llegaron físicamente. El
            backend aumentará automáticamente el inventario de la
            sucursal destino.
          </Alert>

          {traslado?.detalles.map((detalle) => {
            const cantidadEnviada =
              detalle.cantidad_enviada ?? 0

            return (
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
                  <Typography
                    sx={{ flex: 1, fontWeight: 700 }}
                  >
                    {detalle.medicamento.codigo} ·{' '}
                    {detalle.medicamento.nombre}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                  >
                    Enviado: {cantidadEnviada}
                  </Typography>

                  <TextField
                    size="small"
                    label="Recibido"
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
                    sx={{ width: 125 }}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: cantidadEnviada,
                        step: 1,
                      },
                    }}
                  />
                </Stack>
              </Paper>
            )
          })}

          <Typography
            variant="body2"
            sx={{
              textAlign: 'right',
              color: 'text.secondary',
              fontWeight: 700,
            }}
          >
            Total de unidades recibidas: {totalRecibido}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar} disabled={procesando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<MoveToInboxRoundedIcon />}
          onClick={() => void recibir()}
          disabled={procesando || !formularioValido}
        >
          Confirmar recepción
        </Button>
      </DialogActions>
    </Dialog>
  )
}
