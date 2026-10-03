import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import StoreRoundedIcon from '@mui/icons-material/StoreRounded'

import DetalleVentaForm from './DetalleVentaForm'
import DetallesVentaTable from './DetallesVentaTable'

import {
  actualizarDetalleVenta,
  crearDetalleVenta,
  eliminarDetalleVenta,
  obtenerDetallesDeVenta,
  type DetalleVenta,
} from './detallesVentaService'

import {
  actualizarVenta,
  cancelarVenta,
  finalizarVenta,
  obtenerVenta,
  type ActualizarVenta,
  type Venta,
} from '../ventas/ventasService'

import {
  obtenerFormasPago,
  type FormaPago,
} from '../formas-pago/formasPagoService'

import { obtenerInventarios } from '../inventarios/inventariosService'
import { obtenerMedicamentos } from '../medicamentos/medicamentosService'

import type { MedicamentoVentaDisponible } from './DetalleVentaForm'

function ControlDetalleVenta() {
  const navigate = useNavigate()
  const { id } = useParams()

  const idVenta = Number(id)

  const [venta, setVenta] = useState<Venta | null>(null)
  const [detalles, setDetalles] = useState<DetalleVenta[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState<
    MedicamentoVentaDisponible[]
  >([])

  const [cargando, setCargando] = useState(true)
  const [guardandoDetalle, setGuardandoDetalle] = useState(false)
  const [guardandoVenta, setGuardandoVenta] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  const [idFormaPago, setIdFormaPago] = useState('')
  const [descuento, setDescuento] = useState('0')

  const [detalleEliminar, setDetalleEliminar] =
    useState<DetalleVenta | null>(null)

  const [confirmarFinalizacion, setConfirmarFinalizacion] = useState(false)
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false)

  const ventaEditable = venta?.estado === 'BORRADOR'

  // Convierte los errores del backend en mensajes entendibles.
  const obtenerMensajeError = (
    error: unknown,
    mensajePredeterminado: string,
  ) => {
    if (axios.isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message

      if (Array.isArray(mensajeBackend)) {
        return mensajeBackend.join(', ')
      }

      if (typeof mensajeBackend === 'string') {
        return mensajeBackend
      }

      if (error.response) {
        return `El backend respondió con error HTTP ${error.response.status}.`
      }

      return 'No se pudo establecer comunicación con el servidor.'
    }

    if (error instanceof Error) {
      return error.message
    }

    return mensajePredeterminado
  }

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor)
  }

  const formatearFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(fecha))
  }

  // Obtiene nuevamente la venta y sus productos después de una modificación.
  const recargarVenta = async () => {
    if (!Number.isInteger(idVenta) || idVenta < 1) {
      return
    }

    const [ventaRecibida, detallesRecibidos] = await Promise.all([
      obtenerVenta(idVenta),
      obtenerDetallesDeVenta(idVenta),
    ])

    setVenta(ventaRecibida)
    setDetalles(detallesRecibidos)

    setIdFormaPago(ventaRecibida.id_forma_pago.toString())
    setDescuento(ventaRecibida.descuento.toString())
  }

  // Carga toda la información necesaria para operar el punto de venta.
  const cargarDatos = async () => {
    if (!Number.isInteger(idVenta) || idVenta < 1) {
      setError('El identificador de la venta no es válido.')
      setCargando(false)
      return
    }

    setCargando(true)
    setError('')

    try {
      const ventaRecibida = await obtenerVenta(idVenta)

      const [
        detallesRecibidos,
        inventariosRecibidos,
        medicamentosRecibidos,
        formasPagoRecibidas,
      ] = await Promise.all([
        obtenerDetallesDeVenta(idVenta),
        obtenerInventarios(),
        obtenerMedicamentos(),
        obtenerFormasPago(),
      ])

      const inventariosSucursal = inventariosRecibidos.filter(
        (inventario) =>
          inventario.id_sucursal === ventaRecibida.id_sucursal,
      )

      const medicamentosVenta: MedicamentoVentaDisponible[] =
        inventariosSucursal
          .map((inventario) => {
            const medicamento = medicamentosRecibidos.find(
              (medicamento) =>
                medicamento.id_medicamento === inventario.id_medicamento,
            )

            if (!medicamento) {
              return null
            }

            return {
              id_medicamento: medicamento.id_medicamento,
              codigo: medicamento.codigo,
              nombre: medicamento.nombre,
              principio_activo: medicamento.principio_activo,
              concentracion: medicamento.concentracion,
              presentacion: medicamento.presentacion,
              precio_venta: medicamento.precio_venta,
              requiere_receta: medicamento.requiere_receta,
              estado: medicamento.estado,
              stock_actual: inventario.stock_actual,
            }
          })
          .filter(
            (
              medicamento,
            ): medicamento is MedicamentoVentaDisponible =>
              medicamento !== null,
          )

      setVenta(ventaRecibida)
      setDetalles(detallesRecibidos)
      setFormasPago(formasPagoRecibidas)
      setMedicamentosDisponibles(medicamentosVenta)

      setIdFormaPago(ventaRecibida.id_forma_pago.toString())
      setDescuento(ventaRecibida.descuento.toString())
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar la venta.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [id])

  const formasPagoActivas = useMemo(
    () =>
      formasPago.filter(
        (formaPago) => formaPago.estado === 'ACTIVO',
      ),
    [formasPago],
  )

  const idsMedicamentosAgregados = useMemo(
    () => detalles.map((detalle) => detalle.id_medicamento),
    [detalles],
  )

  const totalUnidades = useMemo(
    () =>
      detalles.reduce(
        (total, detalle) => total + detalle.cantidad,
        0,
      ),
    [detalles],
  )

  const medicamentosConReceta = useMemo(
    () =>
      detalles.filter(
        (detalle) => detalle.medicamento.requiere_receta,
      ),
    [detalles],
  )

  const formaPagoSeleccionada = formasPago.find(
    (formaPago) =>
      formaPago.id_forma_pago === Number(idFormaPago),
  )

  const descuentoActual = Number(descuento) || 0

  const totalActual = venta
    ? Math.max(venta.subtotal - descuentoActual, 0)
    : 0

  // Valida y prepara los datos de cobro actuales.
  const obtenerDatosCobro = (): ActualizarVenta | null => {
    if (!venta) {
      return null
    }

    if (!idFormaPago) {
      setError('Debes seleccionar una forma de pago.')
      return null
    }

    const descuentoNumerico = Number(descuento)

    if (
      Number.isNaN(descuentoNumerico) ||
      descuentoNumerico < 0
    ) {
      setError(
        'El descuento debe ser un valor válido mayor o igual a cero.',
      )
      return null
    }

    if (descuentoNumerico > venta.subtotal) {
      setError(
        'El descuento no puede ser mayor que el subtotal de la venta.',
      )
      return null
    }

    return {
      id_forma_pago: Number(idFormaPago),
      descuento: descuentoNumerico,
    }
  }

  // Agrega un medicamento al carrito de la venta.
  const agregarMedicamento = async (
    idMedicamento: number,
    cantidad: number,
  ) => {
    setGuardandoDetalle(true)
    setError('')
    setMensajeExito('')

    try {
      await crearDetalleVenta({
        id_venta: idVenta,
        id_medicamento: idMedicamento,
        cantidad,
      })

      await recargarVenta()

      setMensajeExito(
        'Medicamento agregado correctamente a la venta.',
      )
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'No se pudo agregar el medicamento a la venta.',
        ),
      )
    } finally {
      setGuardandoDetalle(false)
    }
  }

  // Modifica la cantidad validando el stock visible.
  const cambiarCantidad = async (
    detalle: DetalleVenta,
    nuevaCantidad: number,
  ) => {
    if (nuevaCantidad < 1) {
      return
    }

    const medicamentoDisponible = medicamentosDisponibles.find(
      (medicamento) =>
        medicamento.id_medicamento === detalle.id_medicamento,
    )

    if (
      medicamentoDisponible &&
      nuevaCantidad > medicamentoDisponible.stock_actual
    ) {
      setError(
        `Solo hay ${medicamentoDisponible.stock_actual} unidades disponibles de ${medicamentoDisponible.nombre}.`,
      )
      return
    }

    if (venta && venta.descuento > 0) {
      const nuevoSubtotalDetalle =
        nuevaCantidad * detalle.precio_unitario

      const nuevoSubtotalVenta =
        venta.subtotal - detalle.subtotal + nuevoSubtotalDetalle

      if (venta.descuento > nuevoSubtotalVenta) {
        setError(
          'No puedes reducir la cantidad porque el descuento actual sería mayor que el nuevo subtotal. Reduce primero el descuento.',
        )
        return
      }
    }

    setProcesandoId(detalle.id_detalle_venta)
    setError('')
    setMensajeExito('')

    try {
      await actualizarDetalleVenta(
        detalle.id_detalle_venta,
        {
          cantidad: nuevaCantidad,
        },
      )

      await recargarVenta()
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'No se pudo modificar la cantidad del medicamento.',
        ),
      )
    } finally {
      setProcesandoId(null)
    }
  }

  // Solicita confirmación antes de quitar un medicamento.
  const solicitarEliminar = (detalle: DetalleVenta) => {
    if (venta && venta.descuento > 0) {
      const nuevoSubtotal =
        venta.subtotal - detalle.subtotal

      if (venta.descuento > nuevoSubtotal) {
        setError(
          'No puedes quitar este medicamento porque el descuento actual sería mayor que el nuevo subtotal. Reduce primero el descuento.',
        )
        return
      }
    }

    setDetalleEliminar(detalle)
  }

  // Quita un medicamento de la venta.
  const confirmarEliminar = async () => {
    if (!detalleEliminar) {
      return
    }

    setProcesandoId(detalleEliminar.id_detalle_venta)
    setError('')
    setMensajeExito('')

    try {
      await eliminarDetalleVenta(
        detalleEliminar.id_detalle_venta,
      )

      setDetalleEliminar(null)

      await recargarVenta()

      setMensajeExito(
        'Medicamento retirado de la venta.',
      )
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'No se pudo quitar el medicamento de la venta.',
        ),
      )
    } finally {
      setProcesandoId(null)
    }
  }

  // Guarda manualmente la forma de pago y descuento.
  const guardarDatosVenta = async () => {
    const datosCobro = obtenerDatosCobro()

    if (!datosCobro) {
      return
    }

    setGuardandoVenta(true)
    setError('')
    setMensajeExito('')

    try {
      await actualizarVenta(idVenta, datosCobro)

      await recargarVenta()

      setMensajeExito(
        'Los datos de cobro se actualizaron correctamente.',
      )
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'No se pudieron actualizar los datos de la venta.',
        ),
      )
    } finally {
      setGuardandoVenta(false)
    }
  }

  // Guarda automáticamente los datos de cobro y finaliza la venta.
  const confirmarVenta = async () => {
    const datosCobro = obtenerDatosCobro()

    if (!datosCobro) {
      setConfirmarFinalizacion(false)
      return
    }

    setFinalizando(true)
    setError('')
    setMensajeExito('')

    try {
      await actualizarVenta(idVenta, datosCobro)

      const ventaFinalizada =
        await finalizarVenta(idVenta)

      const detallesActualizados =
        await obtenerDetallesDeVenta(idVenta)

      setVenta(ventaFinalizada)
      setDetalles(detallesActualizados)

      setIdFormaPago(
        ventaFinalizada.id_forma_pago.toString(),
      )

      setDescuento(
        ventaFinalizada.descuento.toString(),
      )

      setConfirmarFinalizacion(false)

      setMensajeExito(
        'Venta completada correctamente.',
      )
    } catch (error: unknown) {
      setConfirmarFinalizacion(false)

      setError(
        obtenerMensajeError(
          error,
          'No se pudo finalizar la venta.',
        ),
      )
    } finally {
      setFinalizando(false)
    }
  }

  // Cancela definitivamente una venta en estado BORRADOR.
  const cancelarVentaActual = async () => {
    setCancelando(true)
    setError('')
    setMensajeExito('')

    try {
      await cancelarVenta(idVenta)

      navigate('/app/ventas', {
        replace: true,
      })
    } catch (error: unknown) {
      setConfirmarCancelacion(false)

      setError(
        obtenerMensajeError(
          error,
          'No se pudo cancelar la venta.',
        ),
      )
    } finally {
      setCancelando(false)
    }
  }

  if (cargando) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Cargando venta...
        </Typography>

        <LinearProgress />
      </Stack>
    )
  }

  if (!venta) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {error || 'No fue posible cargar la venta.'}
        </Alert>

        <Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/app/ventas')}
          >
            Volver a ventas
          </Button>
        </Box>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center' }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/app/ventas')}
            sx={{
              minWidth: 44,
              width: 44,
              height: 44,
              p: 0,
            }}
          >
            <ArrowBackRoundedIcon />
          </Button>

          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 800 }}
              >
                Venta #{venta.id_venta}
              </Typography>

              <Chip
                label={venta.estado}
                color={
                  venta.estado === 'COMPLETADA'
                    ? 'success'
                    : 'warning'
                }
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {formatearFecha(venta.fecha)}
            </Typography>
          </Box>
        </Stack>

        {ventaEditable && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelRoundedIcon />}
              onClick={() =>
                setConfirmarCancelacion(true)
              }
              disabled={finalizando || cancelando}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Cancelar venta
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={() =>
                setConfirmarFinalizacion(true)
              }
              disabled={
                finalizando ||
                cancelando ||
                detalles.length === 0
              }
              sx={{
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Finalizar venta
            </Button>
          </Stack>
        )}
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {mensajeExito && (
        <Alert
          severity="success"
          onClose={() => setMensajeExito('')}
        >
          {mensajeExito}
        </Alert>
      )}

      {venta.estado === 'COMPLETADA' && (
        <Alert
          severity="success"
          icon={<CheckCircleRoundedIcon />}
        >
          Esta venta ya fue completada. La información se
          muestra únicamente para consulta.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        <InfoVenta
          titulo="Sucursal"
          valor={venta.sucursal.nombre}
          detalle={`${venta.sucursal.municipio.nombre}, ${venta.sucursal.municipio.departamento.nombre}`}
          icono={<StoreRoundedIcon />}
        />

        <InfoVenta
          titulo="Caja"
          valor={venta.caja.nombre}
          detalle={`Código: ${venta.sucursal.codigo}`}
          icono={<PointOfSaleRoundedIcon />}
        />

        <InfoVenta
          titulo="Atendido por"
          valor={`${venta.usuario.nombre} ${venta.usuario.apellido}`}
          detalle={venta.usuario.rol.nombre}
          icono={<ReceiptLongRoundedIcon />}
        />

        <InfoVenta
          titulo="Forma de pago"
          valor={venta.forma_pago.nombre}
          detalle={
            venta.estado === 'BORRADOR'
              ? 'Puede modificarse'
              : 'Forma de pago registrada'
          }
          icono={<PaymentsRoundedIcon />}
        />
      </Box>

      {ventaEditable && (
        <DetalleVentaForm
          medicamentos={medicamentosDisponibles}
          idsMedicamentosAgregados={
            idsMedicamentosAgregados
          }
          guardando={guardandoDetalle}
          onAgregar={agregarMedicamento}
        />
      )}

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1.5,
          }}
        >
          Productos de la venta
        </Typography>

        <DetallesVentaTable
          detalles={detalles}
          editable={ventaEditable}
          procesandoId={procesandoId}
          onCambiarCantidad={cambiarCantidad}
          onEliminar={solicitarEliminar}
        />
      </Box>

      {medicamentosConReceta.length > 0 && (
        <Alert
          severity="warning"
          icon={<ReceiptLongRoundedIcon />}
        >
          Esta venta contiene{' '}
          {medicamentosConReceta.length === 1
            ? 'un medicamento que requiere receta'
            : `${medicamentosConReceta.length} medicamentos que requieren receta`}
          . Verifica la documentación correspondiente antes de
          finalizar la venta.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 420px',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Card
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          <CardContent>
            <Stack spacing={2.5}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                Datos de cobro
              </Typography>

              <FormControl
                fullWidth
                disabled={!ventaEditable || guardandoVenta}
              >
                <InputLabel id="forma-pago-detalle-venta-label">
                  Forma de pago
                </InputLabel>

                <Select
                  labelId="forma-pago-detalle-venta-label"
                  label="Forma de pago"
                  value={idFormaPago}
                  onChange={(event) =>
                    setIdFormaPago(event.target.value)
                  }
                >
                  {formasPagoActivas.map((formaPago) => (
                    <MenuItem
                      key={formaPago.id_forma_pago}
                      value={formaPago.id_forma_pago.toString()}
                    >
                      {formaPago.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Descuento"
                type="number"
                value={descuento}
                onChange={(event) =>
                  setDescuento(event.target.value)
                }
                disabled={!ventaEditable || guardandoVenta}
                fullWidth
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 0.01,
                    max: venta.subtotal,
                  },
                }}
              />

              {ventaEditable && (
                <Button
                  variant="outlined"
                  onClick={guardarDatosVenta}
                  disabled={guardandoVenta}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  {guardandoVenta ? (
                    <>
                      <CircularProgress
                        size={18}
                        sx={{ mr: 1 }}
                      />
                      Guardando...
                    </>
                  ) : (
                    'Guardar datos de cobro'
                  )}
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            position: {
              lg: 'sticky',
            },
            top: {
              lg: 20,
            },
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                Resumen
              </Typography>

              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography color="text.secondary">
                  Productos
                </Typography>

                <Typography sx={{ fontWeight: 700 }}>
                  {detalles.length}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography color="text.secondary">
                  Unidades
                </Typography>

                <Typography sx={{ fontWeight: 700 }}>
                  {totalUnidades}
                </Typography>
              </Stack>

              <Divider />

              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography>Subtotal</Typography>

                <Typography sx={{ fontWeight: 700 }}>
                  {formatearMoneda(venta.subtotal)}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography>Descuento</Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    color:
                      descuentoActual > 0
                        ? 'error.main'
                        : 'text.primary',
                  }}
                >
                  - {formatearMoneda(descuentoActual)}
                </Typography>
              </Stack>

              <Divider />

              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800 }}
                >
                  TOTAL
                </Typography>

                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: 900 }}
                >
                  {formatearMoneda(totalActual)}
                </Typography>
              </Stack>

              {ventaEditable && (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircleRoundedIcon />}
                  onClick={() =>
                    setConfirmarFinalizacion(true)
                  }
                  disabled={
                    finalizando ||
                    cancelando ||
                    detalles.length === 0
                  }
                  sx={{
                    mt: 1,
                    textTransform: 'none',
                    fontWeight: 800,
                  }}
                >
                  Finalizar venta
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={detalleEliminar !== null}
        onClose={() => {
          if (!procesandoId) {
            setDetalleEliminar(null)
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Quitar medicamento
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Deseas quitar{' '}
            <strong>
              {detalleEliminar?.medicamento.nombre}{' '}
              {detalleEliminar?.medicamento.concentracion}
            </strong>{' '}
            de esta venta?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDetalleEliminar(null)}
            disabled={procesandoId !== null}
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmarEliminar}
            disabled={procesandoId !== null}
          >
            Quitar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmarFinalizacion}
        onClose={() => {
          if (!finalizando) {
            setConfirmarFinalizacion(false)
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirmar venta
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              Una vez finalizada, la venta ya no podrá
              modificarse.
            </Alert>

            {medicamentosConReceta.length > 0 && (
              <Alert
                severity="warning"
                icon={<ReceiptLongRoundedIcon />}
              >
                La venta contiene medicamentos que requieren
                receta. Confirma que la documentación fue
                verificada.
              </Alert>
            )}

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography color="text.secondary">
                Productos
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>
                {detalles.length}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography color="text.secondary">
                Unidades
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>
                {totalUnidades}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography color="text.secondary">
                Forma de pago
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>
                {formaPagoSeleccionada?.nombre ??
                  venta.forma_pago.nombre}
              </Typography>
            </Stack>

            <Divider />

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography>Subtotal</Typography>

              <Typography sx={{ fontWeight: 700 }}>
                {formatearMoneda(venta.subtotal)}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography>Descuento</Typography>

              <Typography sx={{ fontWeight: 700 }}>
                {formatearMoneda(descuentoActual)}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800 }}
              >
                Total
              </Typography>

              <Typography
                variant="h5"
                color="primary"
                sx={{ fontWeight: 900 }}
              >
                {formatearMoneda(totalActual)}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() =>
              setConfirmarFinalizacion(false)
            }
            disabled={finalizando}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={confirmarVenta}
            disabled={finalizando}
            startIcon={
              finalizando ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <CheckCircleRoundedIcon />
              )
            }
          >
            {finalizando
              ? 'Finalizando...'
              : 'Confirmar venta'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmarCancelacion}
        onClose={() => {
          if (!cancelando) {
            setConfirmarCancelacion(false)
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Cancelar venta
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              Esta acción cancelará la venta en borrador y
              quitará todos los medicamentos agregados.
            </Alert>

            <Typography>
              ¿Deseas cancelar definitivamente la{' '}
              <strong>Venta #{venta.id_venta}</strong>?
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              La venta todavía no ha sido completada, por lo
              que no se realizarán movimientos de inventario
              ni de caja.
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography color="text.secondary">
                  Productos agregados
                </Typography>

                <Typography sx={{ fontWeight: 700 }}>
                  {detalles.length}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  mt: 1,
                }}
              >
                <Typography color="text.secondary">
                  Total actual
                </Typography>

                <Typography sx={{ fontWeight: 700 }}>
                  {formatearMoneda(totalActual)}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() =>
              setConfirmarCancelacion(false)
            }
            disabled={cancelando}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={cancelarVentaActual}
            disabled={cancelando}
            startIcon={
              cancelando ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <CancelRoundedIcon />
              )
            }
          >
            {cancelando
              ? 'Cancelando...'
              : 'Cancelar venta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

interface InfoVentaProps {
  titulo: string
  valor: string
  detalle: string
  icono: ReactNode
}

function InfoVenta({
  titulo,
  valor,
  detalle,
  icono,
}: InfoVentaProps) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center' }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'action.selected',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icono}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {titulo}
            </Typography>

            <Typography
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {valor}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {detalle}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ControlDetalleVenta