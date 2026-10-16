import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import type {
  ActualizarTraslado,
  CrearTraslado,
  SucursalTraslado,
  Traslado,
} from './trasladosService'

interface TrasladoFormDialogProps {
  abierto: boolean
  traslado: Traslado | null
  sucursales: SucursalTraslado[]
  idSucursalOrigen: number | null
  procesando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (
    datos: CrearTraslado | ActualizarTraslado,
  ) => Promise<void>
}

export default function TrasladoFormDialog({
  abierto,
  traslado,
  sucursales,
  idSucursalOrigen,
  procesando,
  error,
  onCerrar,
  onGuardar,
}: TrasladoFormDialogProps) {
  const [idSucursalDestino, setIdSucursalDestino] = useState<
    number | ''
  >('')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (!abierto) return

    setIdSucursalDestino(
      traslado?.id_sucursal_destino ?? '',
    )
    setObservaciones(traslado?.observaciones ?? '')
  }, [abierto, traslado])

  const sucursalesDestino = useMemo(
    () =>
      sucursales.filter(
        (sucursal) =>
          sucursal.estado === 'ACTIVA' &&
          sucursal.id_sucursal !== idSucursalOrigen,
      ),
    [sucursales, idSucursalOrigen],
  )

  const formularioValido =
    idSucursalOrigen !== null && idSucursalDestino !== ''

  const guardar = async () => {
    if (!formularioValido) return

    await onGuardar({
      id_sucursal_destino: Number(idSucursalDestino),
      ...(observaciones.trim()
        ? { observaciones: observaciones.trim() }
        : { observaciones: '' }),
    })
  }

  return (
    <Dialog
      open={abierto}
      onClose={() => {
        if (!procesando) onCerrar()
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {traslado
          ? `Editar traslado #${traslado.id_traslado}`
          : 'Nuevo traslado'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          {idSucursalOrigen === null && (
            <Alert severity="warning">
              Tu usuario no tiene una sucursal asignada. El backend
              requiere una sucursal de origen para crear traslados.
            </Alert>
          )}

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            La sucursal de origen se toma automáticamente de la
            sesión del usuario. Solo debes seleccionar el destino.
          </Typography>

          <FormControl fullWidth disabled={idSucursalOrigen === null}>
            <InputLabel id="sucursal-destino-traslado-label">
              Sucursal destino
            </InputLabel>
            <Select
              labelId="sucursal-destino-traslado-label"
              label="Sucursal destino"
              value={idSucursalDestino}
              onChange={(event) => {
                const valor = String(event.target.value)
                setIdSucursalDestino(
                  valor === '' ? '' : Number(valor),
                )
              }}
            >
              <MenuItem value="">
                Selecciona una sucursal
              </MenuItem>

              {sucursalesDestino.map((sucursal) => (
                <MenuItem
                  key={sucursal.id_sucursal}
                  value={sucursal.id_sucursal}
                >
                  {sucursal.codigo} · {sucursal.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={(event) =>
              setObservaciones(event.target.value)
            }
            multiline
            minRows={3}
            fullWidth
            slotProps={{
              htmlInput: {
                maxLength: 500,
              },
            }}
            helperText={`${observaciones.length}/500`}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar} disabled={procesando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void guardar()}
          disabled={procesando || !formularioValido}
        >
          {traslado ? 'Guardar cambios' : 'Crear traslado'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
