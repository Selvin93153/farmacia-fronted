import { useEffect, useMemo, useState } from 'react'

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

import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'

import type { Empleado } from '../empleados/empleadosService'

import type {
  ActualizarDetallePlanilla,
  CrearDetallePlanilla,
  DetallePlanilla,
} from './detallesPlanillaService'

interface DetallePlanillaFormProps {
  abierto: boolean
  idPlanilla: number
  detalle: DetallePlanilla | null
  empleados: Empleado[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (
    datos: CrearDetallePlanilla | ActualizarDetallePlanilla,
  ) => Promise<void>
}

interface FormularioDetalle {
  id_empleado: string
  bonificaciones: string
  descuentos: string
}

const formularioInicial: FormularioDetalle = {
  id_empleado: '',
  bonificaciones: '0',
  descuentos: '0',
}

function DetallePlanillaForm({
  abierto,
  idPlanilla,
  detalle,
  empleados,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: DetallePlanillaFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioDetalle>(formularioInicial)

  const [errorFormulario, setErrorFormulario] = useState('')

  const editando = detalle !== null

  useEffect(() => {
    if (!abierto) {
      return
    }

    if (detalle) {
      setFormulario({
        id_empleado: detalle.id_empleado.toString(),
        bonificaciones: detalle.bonificaciones.toString(),
        descuentos: detalle.descuentos.toString(),
      })
    } else {
      setFormulario(formularioInicial)
    }

    setErrorFormulario('')
  }, [abierto, detalle])

  const empleadoSeleccionado = useMemo(() => {
    if (detalle) {
      return detalle.empleado
    }

    if (!formulario.id_empleado) {
      return null
    }

    return (
      empleados.find(
        (empleado) =>
          empleado.id_empleado === Number(formulario.id_empleado),
      ) ?? null
    )
  }, [detalle, empleados, formulario.id_empleado])

  const salarioBase = detalle
    ? detalle.salario_base
    : empleadoSeleccionado?.salario_base ?? 0

  const bonificaciones = Number(formulario.bonificaciones)
  const descuentos = Number(formulario.descuentos)

  const bonificacionesValidas =
    !Number.isNaN(bonificaciones) && bonificaciones >= 0

  const descuentosValidos =
    !Number.isNaN(descuentos) && descuentos >= 0

  const totalEstimado =
    salarioBase +
    (bonificacionesValidas ? bonificaciones : 0) -
    (descuentosValidos ? descuentos : 0)

  const totalNegativo = totalEstimado < 0

  const cambiarCampo = (
    campo: keyof FormularioDetalle,
    valor: string,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(valor)
  }

  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (!editando && !formulario.id_empleado) {
      setErrorFormulario('Debes seleccionar un empleado.')
      return
    }

    if (!bonificacionesValidas) {
      setErrorFormulario(
        'Las bonificaciones deben ser un valor mayor o igual a cero.',
      )
      return
    }

    if (!descuentosValidos) {
      setErrorFormulario(
        'Los descuentos deben ser un valor mayor o igual a cero.',
      )
      return
    }

    if (totalNegativo) {
      setErrorFormulario(
        'Los descuentos no pueden superar el salario más las bonificaciones.',
      )
      return
    }

    if (editando) {
      const datos: ActualizarDetallePlanilla = {
        bonificaciones,
        descuentos,
      }

      await onGuardar(datos)
      return
    }

    const datos: CrearDetallePlanilla = {
      id_planilla: idPlanilla,
      id_empleado: Number(formulario.id_empleado),
      bonificaciones,
      descuentos,
    }

    await onGuardar(datos)
  }

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editando ? 'Editar detalle de planilla' : 'Agregar empleado a planilla'}
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
              <PersonRoundedIcon color="primary" />

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Empleado
              </Typography>
            </Stack>

            {editando ? (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Empleado"
                  value={
                    detalle
                      ? `${detalle.empleado.codigo_empleado} - ${detalle.empleado.nombres} ${detalle.empleado.apellidos}`
                      : ''
                  }
                  fullWidth
                  disabled
                />

                <TextField
                  label="Puesto"
                  value={detalle?.empleado.puesto ?? ''}
                  fullWidth
                  disabled
                />
              </Stack>
            ) : (
              <FormControl fullWidth required>
                <InputLabel id="empleado-detalle-planilla-label">
                  Empleado
                </InputLabel>

                <Select
                  labelId="empleado-detalle-planilla-label"
                  label="Empleado"
                  value={formulario.id_empleado}
                  onChange={(event) =>
                    cambiarCampo('id_empleado', event.target.value)
                  }
                >
                  {empleados.map((empleado) => (
                    <MenuItem
                      key={empleado.id_empleado}
                      value={empleado.id_empleado.toString()}
                    >
                      {empleado.codigo_empleado} - {empleado.nombres}{' '}
                      {empleado.apellidos} - {empleado.puesto}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {empleadoSeleccionado && (
            <>
              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 2 }}
                >
                  <PaymentsRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Cálculo de pago
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <TextField
                    label="Salario base"
                    value={formatearMoneda(salarioBase)}
                    fullWidth
                    disabled
                  />

                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                  >
                    <TextField
                      label="Bonificaciones"
                      type="number"
                      value={formulario.bonificaciones}
                      onChange={(event) =>
                        cambiarCampo('bonificaciones', event.target.value)
                      }
                      fullWidth
                      slotProps={{
                        input: {
                          startAdornment: (
                            <AddCardRoundedIcon
                              fontSize="small"
                              sx={{ mr: 1, color: 'success.main' }}
                            />
                          ),
                        },
                        htmlInput: {
                          min: 0,
                          step: '0.01',
                        },
                      }}
                    />

                    <TextField
                      label="Descuentos"
                      type="number"
                      value={formulario.descuentos}
                      onChange={(event) =>
                        cambiarCampo('descuentos', event.target.value)
                      }
                      fullWidth
                      slotProps={{
                        input: {
                          startAdornment: (
                            <RemoveCircleOutlineRoundedIcon
                              fontSize="small"
                              sx={{ mr: 1, color: 'error.main' }}
                            />
                          ),
                        },
                        htmlInput: {
                          min: 0,
                          step: '0.01',
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: totalNegativo ? 'error.50' : 'action.hover',
                  border: 1,
                  borderColor: totalNegativo ? 'error.main' : 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total estimado a pagar
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,
                    fontWeight: 800,
                    color: totalNegativo ? 'error.main' : 'success.main',
                  }}
                >
                  {formatearMoneda(totalEstimado)}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Salario base + bonificaciones - descuentos
                </Typography>
              </Box>

              {totalNegativo && (
                <Alert severity="error">
                  Los descuentos superan el salario más las bonificaciones.
                </Alert>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={manejarGuardar}
          disabled={
            guardando ||
            totalNegativo ||
            (!editando && !empleadoSeleccionado)
          }
        >
          {guardando ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Guardando...
            </>
          ) : editando ? (
            'Guardar cambios'
          ) : (
            'Agregar empleado'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DetallePlanillaForm