import { useEffect, useState } from 'react'

import {
  Alert,
  Button,
  CircularProgress,
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
} from '@mui/material'

import type { Sucursal } from '../sucursales/sucursalesService'

import type {
  ActualizarEmpleado,
  CrearEmpleado,
  Empleado,
} from './empleadosService'

interface EmpleadoFormProps {
  abierto: boolean
  empleado: Empleado | null
  sucursales: Sucursal[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearEmpleado | ActualizarEmpleado) => Promise<void>
}

interface FormularioEmpleado {
  id_sucursal: string
  codigo_empleado: string
  nombres: string
  apellidos: string
  telefono: string
  puesto: string
  salario_base: string
  fecha_ingreso: string
  estado: 'ACTIVO' | 'INACTIVO'
}

const formularioInicial: FormularioEmpleado = {
  id_sucursal: '',
  codigo_empleado: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  puesto: '',
  salario_base: '',
  fecha_ingreso: '',
  estado: 'ACTIVO',
}

function EmpleadoForm({
  abierto,
  empleado,
  sucursales,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: EmpleadoFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioEmpleado>(formularioInicial)

  const [errorFormulario, setErrorFormulario] = useState('')

  const editando = empleado !== null

  useEffect(() => {
    if (!abierto) {
      return
    }

    if (empleado) {
      setFormulario({
        id_sucursal: empleado.id_sucursal.toString(),
        codigo_empleado: empleado.codigo_empleado,
        nombres: empleado.nombres,
        apellidos: empleado.apellidos,
        telefono: empleado.telefono,
        puesto: empleado.puesto,
        salario_base: empleado.salario_base.toString(),
        fecha_ingreso: empleado.fecha_ingreso,
        estado: empleado.estado === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO',
      })
    } else {
      setFormulario(formularioInicial)
    }

    setErrorFormulario('')
  }, [abierto, empleado])

  const cambiarCampo = (campo: keyof FormularioEmpleado, valor: string) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (!formulario.id_sucursal) {
      setErrorFormulario('Debes seleccionar una sucursal.')
      return
    }

    if (!formulario.codigo_empleado.trim()) {
      setErrorFormulario('El código del empleado es obligatorio.')
      return
    }

    if (!formulario.nombres.trim()) {
      setErrorFormulario('Los nombres del empleado son obligatorios.')
      return
    }

    if (!formulario.apellidos.trim()) {
      setErrorFormulario('Los apellidos del empleado son obligatorios.')
      return
    }

    if (!formulario.telefono.trim()) {
      setErrorFormulario('El teléfono es obligatorio.')
      return
    }

    if (!formulario.puesto.trim()) {
      setErrorFormulario('El puesto es obligatorio.')
      return
    }

    const salario = Number(formulario.salario_base)

    if (Number.isNaN(salario) || salario < 0) {
      setErrorFormulario(
        'El salario debe ser un número válido mayor o igual a cero.',
      )
      return
    }

    if (!formulario.fecha_ingreso) {
      setErrorFormulario('La fecha de ingreso es obligatoria.')
      return
    }

    const datosBase: CrearEmpleado = {
      id_sucursal: Number(formulario.id_sucursal),
      codigo_empleado: formulario.codigo_empleado.trim().toUpperCase(),
      nombres: formulario.nombres.trim(),
      apellidos: formulario.apellidos.trim(),
      telefono: formulario.telefono.trim(),
      puesto: formulario.puesto.trim(),
      salario_base: salario,
      fecha_ingreso: formulario.fecha_ingreso,
    }

    if (editando) {
      const datosActualizar: ActualizarEmpleado = {
        ...datosBase,
        estado: formulario.estado,
      }

      await onGuardar(datosActualizar)
      return
    }

    await onGuardar(datosBase)
  }

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editando ? 'Editar empleado' : 'Nuevo empleado'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {(error || errorFormulario) && (
            <Alert severity="error">{errorFormulario || error}</Alert>
          )}

          <FormControl fullWidth required>
            <InputLabel id="sucursal-empleado-label">Sucursal</InputLabel>

            <Select
              labelId="sucursal-empleado-label"
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

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Código de empleado"
              value={formulario.codigo_empleado}
              onChange={(event) =>
                cambiarCampo(
                  'codigo_empleado',
                  event.target.value.toUpperCase(),
                )
              }
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 30,
                },
              }}
            />

            <TextField
              label="Puesto"
              value={formulario.puesto}
              onChange={(event) => cambiarCampo('puesto', event.target.value)}
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Nombres"
              value={formulario.nombres}
              onChange={(event) => cambiarCampo('nombres', event.target.value)}
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            <TextField
              label="Apellidos"
              value={formulario.apellidos}
              onChange={(event) =>
                cambiarCampo('apellidos', event.target.value)
              }
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Teléfono"
              value={formulario.telefono}
              onChange={(event) =>
                cambiarCampo('telefono', event.target.value)
              }
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 20,
                },
              }}
            />

            <TextField
              label="Salario base"
              type="number"
              value={formulario.salario_base}
              onChange={(event) =>
                cambiarCampo('salario_base', event.target.value)
              }
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: '0.01',
                },
              }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Fecha de ingreso"
              type="date"
              value={formulario.fecha_ingreso}
              onChange={(event) =>
                cambiarCampo('fecha_ingreso', event.target.value)
              }
              required
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            {editando && (
              <FormControl fullWidth>
                <InputLabel id="estado-empleado-label">Estado</InputLabel>

                <Select
                  labelId="estado-empleado-label"
                  label="Estado"
                  value={formulario.estado}
                  onChange={(event) =>
                    cambiarCampo('estado', event.target.value)
                  }
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="INACTIVO">Inactivo</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
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
            'Guardar cambios'
          ) : (
            'Crear empleado'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmpleadoForm