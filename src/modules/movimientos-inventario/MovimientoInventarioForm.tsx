import { useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'

import type { Inventario } from '../inventarios/inventariosService'

import type {
  CrearMovimientoInventario,
  MotivoMovimiento,
  TipoMovimiento,
} from './movimientosInventarioService'

interface MovimientoInventarioFormProps {
  abierto: boolean
  inventarios: Inventario[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearMovimientoInventario) => Promise<void>
}

interface FormularioMovimiento {
  id_sucursal: string
  id_inventario: string
  tipo_movimiento: TipoMovimiento
  motivo: MotivoMovimiento
  cantidad: string
  referencia: string
  observacion: string
}

const formularioInicial: FormularioMovimiento = {
  id_sucursal: '',
  id_inventario: '',
  tipo_movimiento: 'ENTRADA',
  motivo: 'COMPRA',
  cantidad: '',
  referencia: '',
  observacion: '',
}

function MovimientoInventarioForm({
  abierto,
  inventarios,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: MovimientoInventarioFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioMovimiento>(formularioInicial)

  const [errorFormulario, setErrorFormulario] = useState('')

  const sucursales = useMemo(() => {
    const mapaSucursales = new Map()

    inventarios.forEach((inventario) => {
      mapaSucursales.set(inventario.sucursal.id_sucursal, inventario.sucursal)
    })

    return Array.from(mapaSucursales.values())
  }, [inventarios])

  const inventariosSucursal = useMemo(() => {
    if (!formulario.id_sucursal) {
      return []
    }

    return inventarios.filter(
      (inventario) =>
        inventario.id_sucursal === Number(formulario.id_sucursal),
    )
  }, [inventarios, formulario.id_sucursal])

  const inventarioSeleccionado = useMemo(() => {
    if (!formulario.id_inventario) {
      return null
    }

    return (
      inventarios.find(
        (inventario) =>
          inventario.id_inventario === Number(formulario.id_inventario),
      ) ?? null
    )
  }, [inventarios, formulario.id_inventario])

  const cantidad = Number(formulario.cantidad)

  const cantidadValida =
    formulario.cantidad !== '' &&
    Number.isInteger(cantidad) &&
    cantidad > 0

  const stockProyectado = inventarioSeleccionado
    ? formulario.tipo_movimiento === 'ENTRADA'
      ? inventarioSeleccionado.stock_actual + (cantidadValida ? cantidad : 0)
      : inventarioSeleccionado.stock_actual - (cantidadValida ? cantidad : 0)
    : 0

  const salidaSinStock =
    inventarioSeleccionado !== null &&
    formulario.tipo_movimiento === 'SALIDA' &&
    cantidadValida &&
    cantidad > inventarioSeleccionado.stock_actual

  const cambiarCampo = (
    campo: keyof FormularioMovimiento,
    valor: string,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const cambiarSucursal = (idSucursal: string) => {
    setFormulario((actual) => ({
      ...actual,
      id_sucursal: idSucursal,
      id_inventario: '',
    }))
  }

  const cambiarTipoMovimiento = (tipo: TipoMovimiento) => {
    setFormulario((actual) => ({
      ...actual,
      tipo_movimiento: tipo,
    }))
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormulario(formularioInicial)
    setErrorFormulario('')
    onCerrar()
  }

  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (!formulario.id_sucursal) {
      setErrorFormulario('Debes seleccionar una sucursal.')
      return
    }

    if (!formulario.id_inventario) {
      setErrorFormulario('Debes seleccionar un medicamento.')
      return
    }

    if (!cantidadValida) {
      setErrorFormulario(
        'La cantidad debe ser un número entero mayor que cero.',
      )
      return
    }

    if (salidaSinStock) {
      setErrorFormulario(
        'No hay suficiente stock disponible para realizar esta salida.',
      )
      return
    }

    const datos: CrearMovimientoInventario = {
      id_inventario: Number(formulario.id_inventario),
      tipo_movimiento: formulario.tipo_movimiento,
      motivo: formulario.motivo,
      cantidad,
    }

    const referencia = formulario.referencia.trim()
    const observacion = formulario.observacion.trim()

    if (referencia) {
      datos.referencia = referencia
    }

    if (observacion) {
      datos.observacion = observacion
    }

    await onGuardar(datos)
  }

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : cerrarFormulario}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Registrar movimiento de inventario
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {(error || errorFormulario) && (
            <Alert severity="error">{errorFormulario || error}</Alert>
          )}

          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', mb: 2 }}
            >
              <BusinessRoundedIcon color="primary" />

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Ubicación del inventario
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel id="sucursal-movimiento-label">
                  Sucursal
                </InputLabel>

                <Select
                  labelId="sucursal-movimiento-label"
                  label="Sucursal"
                  value={formulario.id_sucursal}
                  onChange={(event) =>
                    cambiarSucursal(event.target.value)
                  }
                >
                  {sucursales.map((sucursal) => (
                    <MenuItem
                      key={sucursal.id_sucursal}
                      value={sucursal.id_sucursal.toString()}
                    >
                      {sucursal.codigo} - {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                required
                disabled={!formulario.id_sucursal}
              >
                <InputLabel id="inventario-movimiento-label">
                  Medicamento
                </InputLabel>

                <Select
                  labelId="inventario-movimiento-label"
                  label="Medicamento"
                  value={formulario.id_inventario}
                  onChange={(event) =>
                    cambiarCampo('id_inventario', event.target.value)
                  }
                >
                  {inventariosSucursal.map((inventario) => (
                    <MenuItem
                      key={inventario.id_inventario}
                      value={inventario.id_inventario.toString()}
                    >
                      {inventario.medicamento.codigo} -{' '}
                      {inventario.medicamento.nombre} -{' '}
                      {inventario.medicamento.concentracion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {inventarioSeleccionado && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                sx={{
                  justifyContent: 'space-between',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center' }}
                >
                  <MedicationRoundedIcon color="primary" />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Medicamento seleccionado
                    </Typography>

                    <Typography sx={{ fontWeight: 700 }}>
                      {inventarioSeleccionado.medicamento.nombre}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {inventarioSeleccionado.medicamento.concentracion} ·{' '}
                      {inventarioSeleccionado.medicamento.presentacion}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Stock disponible
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {inventarioSeleccionado.stock_actual}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Stock mínimo
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {inventarioSeleccionado.stock_minimo}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Divider />

          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', mb: 2 }}
            >
              <InventoryRoundedIcon color="primary" />

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Movimiento
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel id="tipo-movimiento-label">
                    Tipo de movimiento
                  </InputLabel>

                  <Select
                    labelId="tipo-movimiento-label"
                    label="Tipo de movimiento"
                    value={formulario.tipo_movimiento}
                    onChange={(event) =>
                      cambiarTipoMovimiento(
                        event.target.value as TipoMovimiento,
                      )
                    }
                  >
                    <MenuItem value="ENTRADA">Entrada</MenuItem>
                    <MenuItem value="SALIDA">Salida</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel id="motivo-movimiento-label">
                    Motivo
                  </InputLabel>

                  <Select
                    labelId="motivo-movimiento-label"
                    label="Motivo"
                    value={formulario.motivo}
                    onChange={(event) =>
                      cambiarCampo('motivo', event.target.value)
                    }
                  >
                    <MenuItem value="COMPRA">Compra</MenuItem>
                    <MenuItem value="VENTA">Venta</MenuItem>
                    <MenuItem value="TRASLADO">Traslado</MenuItem>
                    <MenuItem value="AJUSTE">Ajuste</MenuItem>
                    <MenuItem value="DEVOLUCION">Devolución</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TextField
                label="Cantidad"
                type="number"
                value={formulario.cantidad}
                onChange={(event) =>
                  cambiarCampo('cantidad', event.target.value)
                }
                required
                fullWidth
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: 1,
                  },
                }}
              />
            </Stack>
          </Box>

          {inventarioSeleccionado && cantidadValida && (
            <>
              <Divider />

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Proyección del movimiento
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  <ResumenStock
                    titulo="Stock actual"
                    valor={inventarioSeleccionado.stock_actual}
                  />

                  <ResumenStock
                    titulo={
                      formulario.tipo_movimiento === 'ENTRADA'
                        ? 'Cantidad a ingresar'
                        : 'Cantidad a retirar'
                    }
                    valor={cantidad}
                    icono={
                      formulario.tipo_movimiento === 'ENTRADA' ? (
                        <TrendingUpRoundedIcon color="success" />
                      ) : (
                        <TrendingDownRoundedIcon color="error" />
                      )
                    }
                  />

                  <ResumenStock
                    titulo="Stock resultante"
                    valor={stockProyectado}
                    error={salidaSinStock}
                  />
                </Box>

                {salidaSinStock && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Esta salida dejaría el inventario con stock negativo. Solo
                    hay {inventarioSeleccionado.stock_actual} unidades
                    disponibles.
                  </Alert>
                )}

                {!salidaSinStock &&
                  stockProyectado <= inventarioSeleccionado.stock_minimo && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Después de este movimiento el medicamento quedará en el
                      nivel mínimo de existencias o por debajo de él.
                    </Alert>
                  )}
              </Box>
            </>
          )}

          <Divider />

          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', mb: 2 }}
            >
              <NotesRoundedIcon color="primary" />

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Trazabilidad
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <TextField
                label="Referencia"
                placeholder="Ej. factura, pedido, traslado o documento relacionado"
                value={formulario.referencia}
                onChange={(event) =>
                  cambiarCampo('referencia', event.target.value)
                }
                fullWidth
                slotProps={{
                  htmlInput: {
                    maxLength: 150,
                  },
                }}
              />

              <TextField
                label="Observación"
                placeholder="Información adicional sobre el movimiento"
                value={formulario.observacion}
                onChange={(event) =>
                  cambiarCampo('observacion', event.target.value)
                }
                multiline
                minRows={3}
                fullWidth
                slotProps={{
                  htmlInput: {
                    maxLength: 500,
                  },
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={cerrarFormulario} disabled={guardando}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={manejarGuardar}
          disabled={guardando || salidaSinStock}
        >
          {guardando ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Registrando...
            </>
          ) : (
            'Registrar movimiento'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface ResumenStockProps {
  titulo: string
  valor: number
  icono?: React.ReactNode
  error?: boolean
}

function ResumenStock({
  titulo,
  valor,
  icono,
  error = false,
}: ResumenStockProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: 1,
        borderColor: error ? 'error.main' : 'divider',
        bgcolor: error ? 'error.50' : 'background.paper',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {titulo}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mt: 0.5,
              fontWeight: 800,
              color: error ? 'error.main' : 'text.primary',
            }}
          >
            {valor}
          </Typography>
        </Box>

        {icono}
      </Stack>
    </Box>
  )
}

export default MovimientoInventarioForm