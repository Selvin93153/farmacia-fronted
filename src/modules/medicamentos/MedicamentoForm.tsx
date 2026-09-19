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
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'

import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'

import type {
  ActualizarMedicamento,
  CrearMedicamento,
  Medicamento,
} from './medicamentosService'

interface MedicamentoFormProps {
  abierto: boolean
  medicamento: Medicamento | null
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (
    datos: CrearMedicamento | ActualizarMedicamento,
  ) => Promise<void>
}

interface FormularioMedicamento {
  codigo: string
  nombre: string
  principio_activo: string
  concentracion: string
  presentacion: string
  laboratorio: string
  precio_venta: string
  requiere_receta: boolean
  estado: 'ACTIVO' | 'INACTIVO'
}

const formularioInicial: FormularioMedicamento = {
  codigo: '',
  nombre: '',
  principio_activo: '',
  concentracion: '',
  presentacion: '',
  laboratorio: '',
  precio_venta: '',
  requiere_receta: false,
  estado: 'ACTIVO',
}

function MedicamentoForm({
  abierto,
  medicamento,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: MedicamentoFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioMedicamento>(formularioInicial)

  const [errorFormulario, setErrorFormulario] = useState('')

  const editando = medicamento !== null

  useEffect(() => {
    if (!abierto) {
      return
    }

    if (medicamento) {
      setFormulario({
        codigo: medicamento.codigo,
        nombre: medicamento.nombre,
        principio_activo: medicamento.principio_activo,
        concentracion: medicamento.concentracion,
        presentacion: medicamento.presentacion,
        laboratorio: medicamento.laboratorio,
        precio_venta: medicamento.precio_venta.toString(),
        requiere_receta: medicamento.requiere_receta,
        estado: medicamento.estado === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO',
      })
    } else {
      setFormulario(formularioInicial)
    }

    setErrorFormulario('')
  }, [abierto, medicamento])

  const cambiarCampo = (
    campo: keyof FormularioMedicamento,
    valor: string | boolean,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (!formulario.codigo.trim()) {
      setErrorFormulario('El código del medicamento es obligatorio.')
      return
    }

    if (!formulario.nombre.trim()) {
      setErrorFormulario('El nombre del medicamento es obligatorio.')
      return
    }

    if (!formulario.principio_activo.trim()) {
      setErrorFormulario('El principio activo es obligatorio.')
      return
    }

    if (!formulario.concentracion.trim()) {
      setErrorFormulario('La concentración es obligatoria.')
      return
    }

    if (!formulario.presentacion.trim()) {
      setErrorFormulario('La presentación es obligatoria.')
      return
    }

    if (!formulario.laboratorio.trim()) {
      setErrorFormulario('El laboratorio es obligatorio.')
      return
    }

    const precio = Number(formulario.precio_venta)

    if (Number.isNaN(precio) || precio < 0) {
      setErrorFormulario(
        'El precio de venta debe ser un número válido mayor o igual a cero.',
      )
      return
    }

    const datosBase: CrearMedicamento = {
      codigo: formulario.codigo.trim().toUpperCase(),
      nombre: formulario.nombre.trim(),
      principio_activo: formulario.principio_activo.trim(),
      concentracion: formulario.concentracion.trim(),
      presentacion: formulario.presentacion.trim(),
      laboratorio: formulario.laboratorio.trim(),
      precio_venta: precio,
      requiere_receta: formulario.requiere_receta,
    }

    if (editando) {
      const datosActualizar: ActualizarMedicamento = {
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
        {editando ? 'Editar medicamento' : 'Nuevo medicamento'}
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
              <MedicationRoundedIcon color="primary" />

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Información del medicamento
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Código"
                  value={formulario.codigo}
                  onChange={(event) =>
                    cambiarCampo('codigo', event.target.value.toUpperCase())
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
                  label="Nombre"
                  value={formulario.nombre}
                  onChange={(event) =>
                    cambiarCampo('nombre', event.target.value)
                  }
                  required
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      maxLength: 150,
                    },
                  }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Principio activo"
                  value={formulario.principio_activo}
                  onChange={(event) =>
                    cambiarCampo('principio_activo', event.target.value)
                  }
                  required
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      maxLength: 150,
                    },
                  }}
                />

                <TextField
                  label="Concentración"
                  value={formulario.concentracion}
                  onChange={(event) =>
                    cambiarCampo('concentracion', event.target.value)
                  }
                  required
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      maxLength: 50,
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', mb: 2 }}
            >
              <LocalPharmacyRoundedIcon color="primary" />

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Presentación y fabricante
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Presentación"
                value={formulario.presentacion}
                onChange={(event) =>
                  cambiarCampo('presentacion', event.target.value)
                }
                required
                fullWidth
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
              />

              <TextField
                label="Laboratorio"
                value={formulario.laboratorio}
                onChange={(event) =>
                  cambiarCampo('laboratorio', event.target.value)
                }
                required
                fullWidth
                slotProps={{
                  htmlInput: {
                    maxLength: 150,
                  },
                }}
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
                Venta
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Precio de venta"
                type="number"
                value={formulario.precio_venta}
                onChange={(event) =>
                  cambiarCampo('precio_venta', event.target.value)
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

              {editando && (
                <FormControl fullWidth>
                  <InputLabel id="estado-medicamento-label">
                    Estado
                  </InputLabel>

                  <Select
                    labelId="estado-medicamento-label"
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

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formulario.requiere_receta}
                    onChange={(event) =>
                      cambiarCampo('requiere_receta', event.target.checked)
                    }
                  />
                }
                label="Requiere receta médica"
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                Activa esta opción si el medicamento debe venderse únicamente
                con receta médica.
              </Typography>
            </Box>
          </Box>
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
            'Crear medicamento'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MedicamentoForm