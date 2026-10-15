import { useEffect, useMemo, useState } from 'react'
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
  ActivoFijo,
  ActualizarActivoFijo,
  CrearActivoFijo,
  EstadoActivoFijo,
} from './activosFijosService'

interface ActivoFijoFormProps {
  abierto: boolean
  activo: ActivoFijo | null
  sucursales: Sucursal[]
  idSucursalAsignada: number | null
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearActivoFijo | ActualizarActivoFijo) => Promise<void>
}

interface FormularioActivoFijo {
  id_sucursal: string
  codigo: string
  descripcion: string
  categoria: string
  fecha_adquisicion: string
  valor_adquisicion: string
  valor_actual: string
  estado: EstadoActivoFijo
}

const formularioInicial: FormularioActivoFijo = {
  id_sucursal: '',
  codigo: '',
  descripcion: '',
  categoria: '',
  fecha_adquisicion: '',
  valor_adquisicion: '',
  valor_actual: '',
  estado: 'ACTIVO',
}

function ActivoFijoForm({
  abierto,
  activo,
  sucursales,
  idSucursalAsignada,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: ActivoFijoFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioActivoFijo>(formularioInicial)
  const [errorFormulario, setErrorFormulario] = useState('')

  const editando = activo !== null

  const sucursalesDisponibles = useMemo(
    () =>
      sucursales.filter(
        (sucursal) =>
          sucursal.estado === 'ACTIVA' ||
          sucursal.id_sucursal === activo?.id_sucursal,
      ),
    [sucursales, activo],
  )

  useEffect(() => {
    if (!abierto) {
      return
    }

    if (activo) {
      setFormulario({
        id_sucursal: activo.id_sucursal.toString(),
        codigo: activo.codigo,
        descripcion: activo.descripcion,
        categoria: activo.categoria,
        fecha_adquisicion: activo.fecha_adquisicion,
        valor_adquisicion: activo.valor_adquisicion.toString(),
        valor_actual: activo.valor_actual.toString(),
        estado: activo.estado,
      })
    } else {
      setFormulario({
        ...formularioInicial,
        id_sucursal:
          idSucursalAsignada === null ? '' : String(idSucursalAsignada),
      })
    }

    setErrorFormulario('')
  }, [abierto, activo, idSucursalAsignada])

  const cambiarCampo = (campo: keyof FormularioActivoFijo, valor: string) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  // Valida los campos según se esté registrando o editando el activo.
  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (!formulario.id_sucursal) {
      setErrorFormulario('Debes seleccionar una sucursal.')
      return
    }

    if (
      idSucursalAsignada !== null &&
      Number(formulario.id_sucursal) !== idSucursalAsignada
    ) {
      setErrorFormulario('La sucursal no coincide con la sesión actual.')
      return
    }

    if (!formulario.codigo.trim()) {
      setErrorFormulario('El código del activo es obligatorio.')
      return
    }

    if (!formulario.descripcion.trim()) {
      setErrorFormulario('La descripción del activo es obligatoria.')
      return
    }

    if (!formulario.categoria.trim()) {
      setErrorFormulario('La categoría del activo es obligatoria.')
      return
    }

    if (!formulario.fecha_adquisicion) {
      setErrorFormulario('La fecha de adquisición es obligatoria.')
      return
    }

    if (editando) {
      const valorActual = Number(formulario.valor_actual)

      if (Number.isNaN(valorActual) || valorActual < 0) {
        setErrorFormulario(
          'El valor actual debe ser un número válido mayor o igual a cero.',
        )
        return
      }

      const datos: ActualizarActivoFijo = {
        codigo: formulario.codigo.trim().toUpperCase(),
        descripcion: formulario.descripcion.trim(),
        categoria: formulario.categoria.trim(),
        fecha_adquisicion: formulario.fecha_adquisicion,
        valor_actual: valorActual,
        estado: formulario.estado,
      }

      await onGuardar(datos)
      return
    }

    const valorAdquisicion = Number(formulario.valor_adquisicion)

    if (Number.isNaN(valorAdquisicion) || valorAdquisicion < 0) {
      setErrorFormulario(
        'El valor de adquisición debe ser un número válido mayor o igual a cero.',
      )
      return
    }

    const datos: CrearActivoFijo = {
      id_sucursal: Number(formulario.id_sucursal),
      codigo: formulario.codigo.trim().toUpperCase(),
      descripcion: formulario.descripcion.trim(),
      categoria: formulario.categoria.trim(),
      fecha_adquisicion: formulario.fecha_adquisicion,
      valor_adquisicion: valorAdquisicion,
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
        {editando ? 'Editar activo fijo' : 'Nuevo activo fijo'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {(error || errorFormulario) && (
            <Alert severity="error">{errorFormulario || error}</Alert>
          )}

          <FormControl
            fullWidth
            required
            disabled={
              guardando || editando || idSucursalAsignada !== null
            }
          >
            <InputLabel id="sucursal-activo-fijo-label">Sucursal</InputLabel>
            <Select
              labelId="sucursal-activo-fijo-label"
              label="Sucursal"
              value={formulario.id_sucursal}
              onChange={(event) =>
                cambiarCampo('id_sucursal', String(event.target.value))
              }
            >
              {sucursalesDisponibles.map((sucursal) => (
                <MenuItem
                  key={sucursal.id_sucursal}
                  value={sucursal.id_sucursal.toString()}
                >
                  {sucursal.codigo} - {sucursal.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {editando && (
            <Alert severity="info">
              La sucursal de un activo fijo no se cambia desde esta edición.
              Si el activo se traslada físicamente a otra sede, conviene manejar
              ese proceso mediante una operación de traslado de activos.
            </Alert>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Código del activo"
              value={formulario.codigo}
              onChange={(event) =>
                cambiarCampo('codigo', event.target.value.toUpperCase())
              }
              required
              fullWidth
              disabled={guardando}
              slotProps={{
                htmlInput: {
                  maxLength: 30,
                },
              }}
            />

            <TextField
              label="Categoría"
              placeholder="Ej. Refrigeración, mobiliario, equipo de cómputo"
              value={formulario.categoria}
              onChange={(event) =>
                cambiarCampo('categoria', event.target.value)
              }
              required
              fullWidth
              disabled={guardando}
              slotProps={{
                htmlInput: {
                  maxLength: 50,
                },
              }}
            />
          </Stack>

          <TextField
            label="Descripción"
            placeholder="Describe el activo fijo"
            value={formulario.descripcion}
            onChange={(event) =>
              cambiarCampo('descripcion', event.target.value)
            }
            required
            fullWidth
            disabled={guardando}
            multiline
            minRows={2}
            slotProps={{
              htmlInput: {
                maxLength: 150,
              },
            }}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Fecha de adquisición"
              type="date"
              value={formulario.fecha_adquisicion}
              onChange={(event) =>
                cambiarCampo('fecha_adquisicion', event.target.value)
              }
              required
              fullWidth
              disabled={guardando}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="Valor de adquisición"
              type="number"
              value={formulario.valor_adquisicion}
              onChange={(event) =>
                cambiarCampo('valor_adquisicion', event.target.value)
              }
              required={!editando}
              fullWidth
              disabled={guardando || editando}
              helperText={
                editando
                  ? 'El valor de adquisición original no se modifica.'
                  : 'Valor original pagado por el activo.'
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: '0.01',
                },
              }}
            />
          </Stack>

          {editando && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Valor actual"
                type="number"
                value={formulario.valor_actual}
                onChange={(event) =>
                  cambiarCampo('valor_actual', event.target.value)
                }
                required
                fullWidth
                disabled={guardando}
                helperText="Valor contable o estimado vigente del activo."
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: '0.01',
                  },
                }}
              />

              <FormControl fullWidth disabled={guardando}>
                <InputLabel id="estado-activo-fijo-label">Estado</InputLabel>
                <Select
                  labelId="estado-activo-fijo-label"
                  label="Estado"
                  value={formulario.estado}
                  onChange={(event) =>
                    cambiarCampo('estado', String(event.target.value))
                  }
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                  <MenuItem value="BAJA">Baja</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={() => void manejarGuardar()}
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
            'Registrar activo'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActivoFijoForm
