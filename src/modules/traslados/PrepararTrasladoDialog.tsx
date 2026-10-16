import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

import {
  actualizarDetalleTraslado,
  agregarDetalleTraslado,
  eliminarDetalleTraslado,
  obtenerDetallesTraslado,
  obtenerMensajeError,
  type DetalleTraslado,
  type MedicamentoTraslado,
  type Traslado,
} from './trasladosService'

interface PrepararTrasladoDialogProps {
  abierto: boolean
  traslado: Traslado | null
  medicamentos: MedicamentoTraslado[]
  onCerrar: () => void
  onActualizado: () => Promise<void>
}

export default function PrepararTrasladoDialog({
  abierto,
  traslado,
  medicamentos,
  onCerrar,
  onActualizado,
}: PrepararTrasladoDialogProps) {
  const [detalles, setDetalles] = useState<DetalleTraslado[]>([])
  const [medicamento, setMedicamento] =
    useState<MedicamentoTraslado | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const cargarDetalles = async () => {
    if (!traslado) return

    const recibidos = await obtenerDetallesTraslado(
      traslado.id_traslado,
    )
    setDetalles(recibidos)
  }

  useEffect(() => {
    if (!abierto || !traslado) return

    setMedicamento(null)
    setCantidad(1)
    setError('')
    setCargando(true)

    void cargarDetalles()
      .catch((errorDesconocido: unknown) => {
        setError(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudieron cargar los medicamentos del traslado.',
          ),
        )
      })
      .finally(() => setCargando(false))
  }, [abierto, traslado?.id_traslado])

  const idsAgregados = useMemo(
    () =>
      new Set(
        detalles.map((detalle) => detalle.id_medicamento),
      ),
    [detalles],
  )

  const medicamentosDisponibles = useMemo(
    () =>
      medicamentos.filter(
        (item) =>
          item.estado === 'ACTIVO' &&
          !idsAgregados.has(item.id_medicamento),
      ),
    [medicamentos, idsAgregados],
  )

  const agregar = async () => {
    if (!traslado || !medicamento || cantidad <= 0) return

    setProcesando(true)
    setError('')

    try {
      await agregarDetalleTraslado(
        traslado.id_traslado,
        medicamento.id_medicamento,
        cantidad,
      )
      await cargarDetalles()
      await onActualizado()
      setMedicamento(null)
      setCantidad(1)
    } catch (errorDesconocido: unknown) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo agregar el medicamento.',
        ),
      )
    } finally {
      setProcesando(false)
    }
  }

  const cambiarCantidad = async (
    detalle: DetalleTraslado,
    nuevaCantidad: number,
  ) => {
    if (nuevaCantidad <= 0) return

    setProcesando(true)
    setError('')

    try {
      await actualizarDetalleTraslado(
        detalle.id_detalle_traslado,
        nuevaCantidad,
      )
      await cargarDetalles()
      await onActualizado()
    } catch (errorDesconocido: unknown) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo actualizar la cantidad.',
        ),
      )
    } finally {
      setProcesando(false)
    }
  }

  const quitar = async (detalle: DetalleTraslado) => {
    setProcesando(true)
    setError('')

    try {
      await eliminarDetalleTraslado(
        detalle.id_detalle_traslado,
      )
      await cargarDetalles()
      await onActualizado()
    } catch (errorDesconocido: unknown) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo eliminar el medicamento.',
        ),
      )
    } finally {
      setProcesando(false)
    }
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
        Preparar traslado{' '}
        {traslado ? `#${traslado.id_traslado}` : ''}
      </DialogTitle>

      {cargando && <LinearProgress />}

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          {traslado && (
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2.5 }}
            >
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Ruta del traslado
              </Typography>
              <Typography sx={{ mt: 0.4, fontWeight: 800 }}>
                {traslado.sucursal_origen.nombre} →{' '}
                {traslado.sucursal_destino.nombre}
              </Typography>
            </Paper>
          )}

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800 }}
            >
              Medicamentos solicitados
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.4 }}
            >
              Agrega los productos que serán enviados a la
              sucursal destino.
            </Typography>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ mt: 2, alignItems: 'stretch' }}
            >
              <Autocomplete
                fullWidth
                options={medicamentosDisponibles}
                value={medicamento}
                onChange={(_, valor) => setMedicamento(valor)}
                getOptionLabel={(item) =>
                  `${item.codigo} · ${item.nombre}`
                }
                isOptionEqualToValue={(option, value) =>
                  option.id_medicamento === value.id_medicamento
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Medicamento"
                    placeholder="Buscar medicamento"
                  />
                )}
                renderOption={(props, item) => (
                  <li {...props} key={item.id_medicamento}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700 }}
                      >
                        {item.nombre}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {item.codigo}
                        {item.concentracion
                          ? ` · ${item.concentracion}`
                          : ''}
                        {item.presentacion
                          ? ` · ${item.presentacion}`
                          : ''}
                      </Typography>
                    </Box>
                  </li>
                )}
              />

              <TextField
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(event) =>
                  setCantidad(
                    Math.max(
                      1,
                      Number(event.target.value) || 1,
                    ),
                  )
                }
                sx={{ width: { xs: '100%', md: 140 } }}
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: 1,
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => void agregar()}
                disabled={!medicamento || procesando}
                sx={{ minWidth: 130 }}
              >
                Agregar
              </Button>
            </Stack>

            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {detalles.map((detalle) => (
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

                    <TextField
                      size="small"
                      label="Solicitado"
                      type="number"
                      defaultValue={detalle.cantidad_solicitada}
                      onBlur={(event) => {
                        const nuevaCantidad = Number(
                          event.target.value,
                        )

                        if (
                          nuevaCantidad > 0 &&
                          nuevaCantidad !==
                            detalle.cantidad_solicitada
                        ) {
                          void cambiarCantidad(
                            detalle,
                            nuevaCantidad,
                          )
                        }
                      }}
                      sx={{ width: 125 }}
                      slotProps={{
                        htmlInput: {
                          min: 1,
                          step: 1,
                        },
                      }}
                    />

                    <Tooltip title="Quitar medicamento">
                      <IconButton
                        color="error"
                        onClick={() => void quitar(detalle)}
                        disabled={procesando}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              ))}

              {detalles.length === 0 && (
                <Alert severity="info" variant="outlined">
                  Agrega al menos un medicamento antes de enviar
                  el traslado.
                </Alert>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar} disabled={procesando}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
