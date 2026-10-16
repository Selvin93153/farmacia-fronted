import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import {
  actualizarDetallePedido,
  agregarDetallePedido,
  asignarSucursalPedido,
  eliminarDetallePedido,
  obtenerDetallesPedido,
  obtenerSucursalesDisponibles,
  type DetallePedido,
  type MedicamentoPedido,
  type Pedido,
  type SucursalDisponible,
} from './pedidosService'

interface PrepararPedidoDialogProps {
  abierto: boolean
  pedido: Pedido | null
  medicamentos: MedicamentoPedido[]
  onCerrar: () => void
  onActualizado: () => Promise<void>
}

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

function obtenerMensajeError(error: unknown, predeterminado: string): string {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message
    if (Array.isArray(mensaje)) return mensaje.join(', ')
    if (typeof mensaje === 'string') return mensaje
    if (error.response) return `El backend respondió con error HTTP ${error.response.status}.`
    return 'No se pudo establecer comunicación con el servidor.'
  }

  if (error instanceof Error) return error.message
  return predeterminado
}

export default function PrepararPedidoDialog({
  abierto,
  pedido,
  medicamentos,
  onCerrar,
  onActualizado,
}: PrepararPedidoDialogProps) {
  const [detalles, setDetalles] = useState<DetallePedido[]>([])
  const [sucursales, setSucursales] = useState<SucursalDisponible[]>([])
  const [idSucursal, setIdSucursal] = useState<number | null>(null)
  const [medicamento, setMedicamento] = useState<MedicamentoPedido | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const cargarDetalles = async () => {
    if (!pedido) return
    const recibidos = await obtenerDetallesPedido(pedido.id_pedido)
    setDetalles(recibidos)
  }

  useEffect(() => {
    if (!abierto || !pedido) return

    setSucursales([])
    setIdSucursal(null)
    setMedicamento(null)
    setCantidad(1)
    setError('')
    setCargando(true)

    void cargarDetalles()
      .catch((errorDesconocido: unknown) => {
        setError(obtenerMensajeError(errorDesconocido, 'No se pudo cargar el pedido.'))
      })
      .finally(() => setCargando(false))
  }, [abierto, pedido?.id_pedido])

  const idsAgregados = useMemo(
    () => new Set(detalles.map((detalle) => detalle.id_medicamento)),
    [detalles],
  )

  const medicamentosDisponibles = useMemo(
    () => medicamentos.filter(
      (item) => item.estado === 'ACTIVO' && !idsAgregados.has(item.id_medicamento),
    ),
    [medicamentos, idsAgregados],
  )

  const total = detalles.reduce((acumulado, detalle) => acumulado + Number(detalle.subtotal), 0)

  const agregarMedicamento = async () => {
    if (!pedido || !medicamento || cantidad <= 0) return

    setProcesando(true)
    setError('')

    try {
      await agregarDetallePedido(pedido.id_pedido, medicamento.id_medicamento, cantidad)
      await cargarDetalles()
      setMedicamento(null)
      setCantidad(1)
      setSucursales([])
      setIdSucursal(null)
      await onActualizado()
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudo agregar el medicamento.'))
    } finally {
      setProcesando(false)
    }
  }

  const cambiarCantidad = async (detalle: DetallePedido, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return

    setProcesando(true)
    setError('')

    try {
      await actualizarDetallePedido(detalle.id_detalle_pedido, nuevaCantidad)
      await cargarDetalles()
      setSucursales([])
      setIdSucursal(null)
      await onActualizado()
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudo actualizar la cantidad.'))
    } finally {
      setProcesando(false)
    }
  }

  const quitarMedicamento = async (detalle: DetallePedido) => {
    setProcesando(true)
    setError('')

    try {
      await eliminarDetallePedido(detalle.id_detalle_pedido)
      await cargarDetalles()
      setSucursales([])
      setIdSucursal(null)
      await onActualizado()
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudo quitar el medicamento.'))
    } finally {
      setProcesando(false)
    }
  }

  const buscarSucursales = async () => {
    if (!pedido) return

    setProcesando(true)
    setError('')

    try {
      const recibidas = await obtenerSucursalesDisponibles(pedido.id_pedido)
      setSucursales(recibidas)
      setIdSucursal(recibidas[0]?.id_sucursal ?? null)
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudieron buscar sucursales disponibles.'))
    } finally {
      setProcesando(false)
    }
  }

  const confirmarPedido = async () => {
    if (!pedido || !idSucursal) return

    setProcesando(true)
    setError('')

    try {
      await asignarSucursalPedido(pedido.id_pedido, idSucursal)
      await onActualizado()
      onCerrar()
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudo confirmar el pedido.'))
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={procesando ? undefined : onCerrar} fullWidth maxWidth="lg">
      <DialogTitle>
        Preparar pedido {pedido ? `#${pedido.id_pedido}` : ''}
      </DialogTitle>

      {cargando && <LinearProgress />}

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          {pedido && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Cliente</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {pedido.cliente.nombres} {pedido.cliente.apellidos ?? ''}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {pedido.direccion_entrega}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Forma de pago</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {pedido.forma_pago?.nombre ?? 'Pendiente'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>1. Medicamentos</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Agrega los medicamentos y cantidades solicitadas por el cliente.
                </Typography>
              </Box>
              <Chip label={`${detalles.length} productos`} variant="outlined" />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mt: 2, alignItems: 'stretch' }}>
              <Autocomplete
                fullWidth
                options={medicamentosDisponibles}
                value={medicamento}
                onChange={(_, valor) => setMedicamento(valor)}
                getOptionLabel={(item) => `${item.codigo} · ${item.nombre}`}
                isOptionEqualToValue={(option, value) => option.id_medicamento === value.id_medicamento}
                renderInput={(params) => (
                  <TextField {...params} label="Medicamento" placeholder="Buscar medicamento" />
                )}
                renderOption={(props, item) => (
                  <li {...props} key={item.id_medicamento}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.nombre}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.codigo} · {formatoMoneda.format(Number(item.precio_venta))}
                      </Typography>
                    </Box>
                  </li>
                )}
              />

              <TextField
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(event) => setCantidad(Math.max(1, Number(event.target.value) || 1))}
                sx={{ width: { xs: '100%', md: 140 } }}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => void agregarMedicamento()}
                disabled={!medicamento || procesando}
                sx={{ minWidth: 130 }}
              >
                Agregar
              </Button>
            </Stack>

            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {detalles.map((detalle) => (
                <Paper key={detalle.id_detalle_pedido} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{detalle.medicamento.nombre}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {detalle.medicamento.codigo} · {formatoMoneda.format(Number(detalle.precio_unitario))} c/u
                      </Typography>
                    </Box>

                    <TextField
                      size="small"
                      label="Cantidad"
                      type="number"
                      defaultValue={detalle.cantidad}
                      onBlur={(event) => {
                        const nuevaCantidad = Number(event.target.value)
                        if (nuevaCantidad !== detalle.cantidad && nuevaCantidad > 0) {
                          void cambiarCantidad(detalle, nuevaCantidad)
                        }
                      }}
                      sx={{ width: 110 }}
                      slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    />

                    <Typography sx={{ minWidth: 95, textAlign: { sm: 'right' }, fontWeight: 800 }}>
                      {formatoMoneda.format(Number(detalle.subtotal))}
                    </Typography>

                    <Tooltip title="Quitar medicamento">
                      <IconButton color="error" onClick={() => void quitarMedicamento(detalle)} disabled={procesando}>
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              ))}

              {detalles.length === 0 && (
                <Alert severity="info" variant="outlined">
                  Agrega al menos un medicamento para poder buscar una sucursal que surta el pedido.
                </Alert>
              )}
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Total: {formatoMoneda.format(total)}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>2. Sucursal de despacho</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  El sistema mostrará únicamente sucursales con existencia suficiente para surtir todo el pedido.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<SearchRoundedIcon />}
                onClick={() => void buscarSucursales()}
                disabled={detalles.length === 0 || procesando || !pedido?.id_forma_pago}
              >
                Buscar sucursales
              </Button>
            </Stack>

            {!pedido?.id_forma_pago && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Debes seleccionar una forma de pago en los datos del pedido antes de confirmarlo.
              </Alert>
            )}

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {sucursales.map((sucursal, indice) => {
                const seleccionada = idSucursal === sucursal.id_sucursal

                return (
                  <Card
                    key={sucursal.id_sucursal}
                    variant="outlined"
                    sx={{
                      borderWidth: seleccionada ? 2 : 1,
                      borderColor: seleccionada ? 'primary.main' : 'divider',
                      borderRadius: 2.5,
                    }}
                  >
                    <CardActionArea onClick={() => setIdSucursal(sucursal.id_sucursal)}>
                      <CardContent>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46, borderRadius: 2, bgcolor: 'action.hover' }}>
                            <StorefrontRoundedIcon color={seleccionada ? 'primary' : 'action'} />
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                              <Typography sx={{ fontWeight: 800 }}>{sucursal.nombre}</Typography>
                              {indice === 0 && <Chip size="small" color="success" label="Recomendada" />}
                              <Chip size="small" variant="outlined" label={sucursal.codigo} />
                            </Stack>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {sucursal.direccion} · {sucursal.municipio}, {sucursal.departamento}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={2}>
                            <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                              <NearMeRoundedIcon fontSize="small" color="action" />
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{sucursal.distancia_km} km</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                              <TimerOutlinedIcon fontSize="small" color="action" />
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{sucursal.tiempo_estimado_min} min</Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                )
              })}

              {sucursales.length === 0 && detalles.length > 0 && pedido?.id_forma_pago && (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5, textAlign: 'center' }}>
                  <LocalPharmacyRoundedIcon color="action" />
                  <Typography sx={{ mt: 1, fontWeight: 700 }}>Aún no se ha realizado la búsqueda</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Presiona “Buscar sucursales” para comprobar disponibilidad, distancia y tiempo estimado.
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar} disabled={procesando}>Cerrar</Button>
        <Button
          variant="contained"
          startIcon={<LocalPharmacyRoundedIcon />}
          onClick={() => void confirmarPedido()}
          disabled={!idSucursal || procesando}
        >
          Confirmar pedido
        </Button>
      </DialogActions>
    </Dialog>
  )
}
