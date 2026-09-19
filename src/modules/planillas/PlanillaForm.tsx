import { useEffect, useState } from 'react'

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
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'

import type { Sucursal } from '../sucursales/sucursalesService'

import type {
  ActualizarPlanilla,
  CrearPlanilla,
  EstadoPlanilla,
  Planilla,
} from './planillasService'

interface PlanillaFormProps {
  abierto: boolean
  planilla: Planilla | null
  sucursales: Sucursal[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearPlanilla | ActualizarPlanilla) => Promise<void>
}

interface FormularioPlanilla {
  id_sucursal: string
  mes: string
  anio: string
  estado: EstadoPlanilla
}

const formularioInicial: FormularioPlanilla = {
  id_sucursal: '',
  mes: '',
  anio: new Date().getFullYear().toString(),
  estado: 'BORRADOR',
}

const meses = [
  { numero: 1, nombre: 'Enero' },
  { numero: 2, nombre: 'Febrero' },
  { numero: 3, nombre: 'Marzo' },
  { numero: 4, nombre: 'Abril' },
  { numero: 5, nombre: 'Mayo' },
  { numero: 6, nombre: 'Junio' },
  { numero: 7, nombre: 'Julio' },
  { numero: 8, nombre: 'Agosto' },
  { numero: 9, nombre: 'Septiembre' },
  { numero: 10, nombre: 'Octubre' },
  { numero: 11, nombre: 'Noviembre' },
  { numero: 12, nombre: 'Diciembre' },
]

function PlanillaForm({
  abierto,
  planilla,
  sucursales,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: PlanillaFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioPlanilla>(formularioInicial)

  const [errorFormulario, setErrorFormulario] = useState('')

  const editando = planilla !== null

  useEffect(() => {
    if (!abierto) {
      return
    }

    if (planilla) {
      setFormulario({
        id_sucursal: planilla.id_sucursal.toString(),
        mes: planilla.mes.toString(),
        anio: planilla.anio.toString(),
        estado: planilla.estado,
      })
    } else {
      setFormulario({
        ...formularioInicial,
        anio: new Date().getFullYear().toString(),
      })
    }

    setErrorFormulario('')
  }, [abierto, planilla])

  const cambiarCampo = (
    campo: keyof FormularioPlanilla,
    valor: string,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (editando) {
      const datos: ActualizarPlanilla = {
        estado: formulario.estado,
      }

      await onGuardar(datos)
      return
    }

    if (!formulario.id_sucursal) {
      setErrorFormulario('Debes seleccionar una sucursal.')
      return
    }

    if (!formulario.mes) {
      setErrorFormulario('Debes seleccionar un mes.')
      return
    }

    const anio = Number(formulario.anio)

    if (
      Number.isNaN(anio) ||
      !Number.isInteger(anio) ||
      anio < 2000
    ) {
      setErrorFormulario('El año debe ser un número válido mayor o igual a 2000.')
      return
    }

    const datos: CrearPlanilla = {
      id_sucursal: Number(formulario.id_sucursal),
      mes: Number(formulario.mes),
      anio,
    }

    await onGuardar(datos)
  }

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(valor)
  }

  const obtenerNombreMes = (mes: number) => {
    return meses.find((item) => item.numero === mes)?.nombre ?? mes.toString()
  }

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editando ? 'Administrar planilla' : 'Nueva planilla'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {(error || errorFormulario) && (
            <Alert severity="error">{errorFormulario || error}</Alert>
          )}

          {editando ? (
            <>
              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 2 }}
                >
                  <BusinessRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Información de la planilla
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <TextField
                    label="Sucursal"
                    value={planilla?.sucursal.nombre ?? ''}
                    fullWidth
                    disabled
                  />

                  <TextField
                    label="Período"
                    value={
                      planilla
                        ? `${obtenerNombreMes(planilla.mes)} ${planilla.anio}`
                        : ''
                    }
                    fullWidth
                    disabled
                  />

                  <TextField
                    label="Total de planilla"
                    value={
                      planilla
                        ? formatearMoneda(planilla.total_planilla)
                        : ''
                    }
                    fullWidth
                    disabled
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 2 }}
                >
                  <PaymentsRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Estado de la planilla
                  </Typography>
                </Stack>

                <FormControl fullWidth>
                  <InputLabel id="estado-planilla-label">
                    Estado
                  </InputLabel>

                  <Select
                    labelId="estado-planilla-label"
                    label="Estado"
                    value={formulario.estado}
                    onChange={(event) =>
                      cambiarCampo('estado', event.target.value)
                    }
                  >
                    <MenuItem value="BORRADOR">Borrador</MenuItem>
                    <MenuItem value="GENERADA">Generada</MenuItem>
                    <MenuItem value="PAGADA">Pagada</MenuItem>
                  </Select>
                </FormControl>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Actualmente el backend permite cambiar entre cualquiera de los
                  estados disponibles.
                </Alert>
              </Box>
            </>
          ) : (
            <>
              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 2 }}
                >
                  <BusinessRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Sucursal
                  </Typography>
                </Stack>

                <FormControl fullWidth required>
                  <InputLabel id="sucursal-planilla-label">
                    Sucursal
                  </InputLabel>

                  <Select
                    labelId="sucursal-planilla-label"
                    label="Sucursal"
                    value={formulario.id_sucursal}
                    onChange={(event) =>
                      cambiarCampo('id_sucursal', event.target.value)
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
              </Box>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 2 }}
                >
                  <CalendarMonthRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Período
                  </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControl fullWidth required>
                    <InputLabel id="mes-planilla-label">Mes</InputLabel>

                    <Select
                      labelId="mes-planilla-label"
                      label="Mes"
                      value={formulario.mes}
                      onChange={(event) =>
                        cambiarCampo('mes', event.target.value)
                      }
                    >
                      {meses.map((mes) => (
                        <MenuItem
                          key={mes.numero}
                          value={mes.numero.toString()}
                        >
                          {mes.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Año"
                    type="number"
                    value={formulario.anio}
                    onChange={(event) =>
                      cambiarCampo('anio', event.target.value)
                    }
                    required
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        min: 2000,
                        step: 1,
                      },
                    }}
                  />
                </Stack>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Solo puede existir una planilla por sucursal, mes y año.
                </Alert>
              </Box>
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
          disabled={guardando}
        >
          {guardando ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Guardando...
            </>
          ) : editando ? (
            'Guardar estado'
          ) : (
            'Crear planilla'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PlanillaForm