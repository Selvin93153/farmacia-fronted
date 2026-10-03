import { useMemo, useState } from 'react'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'

export interface MedicamentoVentaDisponible {
  id_medicamento: number
  codigo: string
  nombre: string
  principio_activo: string
  concentracion: string
  presentacion: string
  precio_venta: number
  requiere_receta: boolean
  estado: string
  stock_actual: number
}

interface DetalleVentaFormProps {
  medicamentos: MedicamentoVentaDisponible[]
  idsMedicamentosAgregados: number[]
  guardando: boolean
  deshabilitado?: boolean
  onAgregar: (
    idMedicamento: number,
    cantidad: number,
  ) => Promise<void>
}

function DetalleVentaForm({
  medicamentos,
  idsMedicamentosAgregados,
  guardando,
  deshabilitado = false,
  onAgregar,
}: DetalleVentaFormProps) {
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] =
    useState<MedicamentoVentaDisponible | null>(null)

  const [cantidad, setCantidad] = useState('1')
  const [errorFormulario, setErrorFormulario] = useState('')

  const medicamentosDisponibles = useMemo(() => {
    return medicamentos.filter((medicamento) => {
      return (
        medicamento.estado === 'ACTIVO' &&
        !idsMedicamentosAgregados.includes(
          medicamento.id_medicamento,
        )
      )
    })
  }, [medicamentos, idsMedicamentosAgregados])

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor)
  }

  // Valida stock y agrega el medicamento seleccionado a la venta.
  const manejarAgregar = async () => {
    setErrorFormulario('')

    if (!medicamentoSeleccionado) {
      setErrorFormulario(
        'Debes seleccionar un medicamento.',
      )
      return
    }

    const cantidadNumerica = Number(cantidad)

    if (
      !Number.isInteger(cantidadNumerica) ||
      cantidadNumerica < 1
    ) {
      setErrorFormulario(
        'La cantidad debe ser un número entero mayor que cero.',
      )
      return
    }

    if (
      cantidadNumerica >
      medicamentoSeleccionado.stock_actual
    ) {
      setErrorFormulario(
        `Solo hay ${medicamentoSeleccionado.stock_actual} unidades disponibles.`,
      )
      return
    }

    await onAgregar(
      medicamentoSeleccionado.id_medicamento,
      cantidadNumerica,
    )

    setMedicamentoSeleccionado(null)
    setCantidad('1')
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center' }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MedicationRoundedIcon />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Agregar medicamento
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Busca el medicamento solicitado por el cliente.
              </Typography>
            </Box>
          </Stack>

          {errorFormulario && (
            <Alert severity="error">
              {errorFormulario}
            </Alert>
          )}

          {medicamentosDisponibles.length === 0 && (
            <Alert severity="info">
              No hay más medicamentos disponibles para agregar
              a esta venta.
            </Alert>
          )}

          <Autocomplete
            options={medicamentosDisponibles}
            value={medicamentoSeleccionado}
            onChange={(_, nuevoValor) => {
              setMedicamentoSeleccionado(nuevoValor)
              setCantidad('1')
              setErrorFormulario('')
            }}
            getOptionLabel={(medicamento) =>
              `${medicamento.codigo} - ${medicamento.nombre} ${medicamento.concentracion}`
            }
            getOptionDisabled={(medicamento) =>
              medicamento.stock_actual <= 0
            }
            filterOptions={(options, state) => {
              const texto = state.inputValue
                .trim()
                .toLowerCase()

              if (!texto) {
                return options
              }

              return options.filter((medicamento) => {
                return (
                  medicamento.codigo
                    .toLowerCase()
                    .includes(texto) ||
                  medicamento.nombre
                    .toLowerCase()
                    .includes(texto) ||
                  medicamento.principio_activo
                    .toLowerCase()
                    .includes(texto) ||
                  medicamento.concentracion
                    .toLowerCase()
                    .includes(texto)
                )
              })
            }}
            renderOption={(props, medicamento) => (
              <Box
                component="li"
                {...props}
                key={medicamento.id_medicamento}
              >
                <Box sx={{ width: '100%' }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {medicamento.nombre}{' '}
                      {medicamento.concentracion}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                      }}
                    >
                      {formatearMoneda(
                        medicamento.precio_venta,
                      )}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {medicamento.codigo} ·{' '}
                    {medicamento.presentacion} · Stock:{' '}
                    {medicamento.stock_actual}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar medicamento"
                placeholder="Código, nombre, principio activo o concentración..."
              />
            )}
            noOptionsText="No se encontraron medicamentos"
            disabled={
              deshabilitado ||
              guardando ||
              medicamentosDisponibles.length === 0
            }
          />

          {medicamentoSeleccionado && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'action.hover',
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: {
                      xs: 'flex-start',
                      sm: 'center',
                    },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {medicamentoSeleccionado.nombre}{' '}
                      {medicamentoSeleccionado.concentracion}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {medicamentoSeleccionado.presentacion} ·{' '}
                      {
                        medicamentoSeleccionado.principio_activo
                      }
                    </Typography>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800 }}
                  >
                    {formatearMoneda(
                      medicamentoSeleccionado.precio_venta,
                    )}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Chip
                    label={`Stock: ${medicamentoSeleccionado.stock_actual}`}
                    size="small"
                    color={
                      medicamentoSeleccionado.stock_actual > 0
                        ? 'success'
                        : 'error'
                    }
                    variant="outlined"
                  />

                  {medicamentoSeleccionado.requiere_receta && (
                    <Chip
                      icon={<ReceiptLongRoundedIcon />}
                      label="Requiere receta"
                      size="small"
                      color="warning"
                    />
                  )}
                </Stack>

                {medicamentoSeleccionado.requiere_receta && (
                  <Alert severity="warning">
                    Este medicamento requiere receta. Verifica
                    la documentación correspondiente antes de
                    finalizar la venta.
                  </Alert>
                )}
              </Stack>
            </Box>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <TextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={(event) =>
                setCantidad(event.target.value)
              }
              disabled={
                deshabilitado ||
                guardando ||
                !medicamentoSeleccionado
              }
              sx={{ width: { xs: '100%', sm: 180 } }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  step: 1,
                  max:
                    medicamentoSeleccionado?.stock_actual ??
                    undefined,
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={
                guardando ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <AddShoppingCartRoundedIcon />
                )
              }
              onClick={manejarAgregar}
              disabled={
                deshabilitado ||
                guardando ||
                !medicamentoSeleccionado ||
                medicamentoSeleccionado.stock_actual <= 0
              }
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                minWidth: 200,
              }}
            >
              {guardando
                ? 'Agregando...'
                : 'Agregar a la venta'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default DetalleVentaForm