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

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'

import type { Medicamento } from '../medicamentos/medicamentosService'
import type { Sucursal } from '../sucursales/sucursalesService'

import type {
  ActualizarInventario,
  CrearInventario,
  Inventario,
} from './inventariosService'

interface InventarioFormProps {
  abierto: boolean
  inventario: Inventario | null
  inventarios: Inventario[]
  sucursales: Sucursal[]
  medicamentos: Medicamento[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (
    datos: CrearInventario | ActualizarInventario,
  ) => Promise<void>
}

interface FormularioInventario {
  id_sucursal: string
  id_medicamento: string
  stock_actual: string
  stock_minimo: string
}

const formularioInicial: FormularioInventario = {
  id_sucursal: '',
  id_medicamento: '',
  stock_actual: '0',
  stock_minimo: '',
}

function InventarioForm({
  abierto,
  inventario,
  inventarios,
  sucursales,
  medicamentos,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: InventarioFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioInventario>(formularioInicial)

  const [errorFormulario, setErrorFormulario] = useState('')

  const editando = inventario !== null

  useEffect(() => {
    if (!abierto) {
      return
    }

    if (inventario) {
      setFormulario({
        id_sucursal: inventario.id_sucursal.toString(),
        id_medicamento: inventario.id_medicamento.toString(),
        stock_actual: inventario.stock_actual.toString(),
        stock_minimo: inventario.stock_minimo.toString(),
      })
    } else {
      setFormulario(formularioInicial)
    }

    setErrorFormulario('')
  }, [abierto, inventario])

  const medicamentosDisponibles = useMemo(() => {
    if (!formulario.id_sucursal) {
      return medicamentos
    }

    const idSucursal = Number(formulario.id_sucursal)

    const medicamentosRegistrados = new Set(
      inventarios
        .filter((item) => item.id_sucursal === idSucursal)
        .map((item) => item.id_medicamento),
    )

    return medicamentos.filter(
      (medicamento) =>
        !medicamentosRegistrados.has(medicamento.id_medicamento),
    )
  }, [formulario.id_sucursal, inventarios, medicamentos])

  const cambiarCampo = (
    campo: keyof FormularioInventario,
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
      id_medicamento: '',
    }))
  }

  const manejarGuardar = async () => {
    setErrorFormulario('')

    const stockMinimo = Number(formulario.stock_minimo)

    if (
      Number.isNaN(stockMinimo) ||
      !Number.isInteger(stockMinimo) ||
      stockMinimo < 0
    ) {
      setErrorFormulario(
        'El stock mínimo debe ser un número entero mayor o igual a cero.',
      )
      return
    }

    if (editando) {
      const datos: ActualizarInventario = {
        stock_minimo: stockMinimo,
      }

      await onGuardar(datos)
      return
    }

    if (!formulario.id_sucursal) {
      setErrorFormulario('Debes seleccionar una sucursal.')
      return
    }

    if (!formulario.id_medicamento) {
      setErrorFormulario('Debes seleccionar un medicamento.')
      return
    }

    const stockActual = Number(formulario.stock_actual)

    if (
      Number.isNaN(stockActual) ||
      !Number.isInteger(stockActual) ||
      stockActual < 0
    ) {
      setErrorFormulario(
        'El stock inicial debe ser un número entero mayor o igual a cero.',
      )
      return
    }

    const datos: CrearInventario = {
      id_sucursal: Number(formulario.id_sucursal),
      id_medicamento: Number(formulario.id_medicamento),
      stock_actual: stockActual,
      stock_minimo: stockMinimo,
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
        {editando ? 'Configurar inventario' : 'Registrar inventario'}
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
                  <InventoryRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Información del inventario
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Sucursal"
                    value={inventario?.sucursal.nombre ?? ''}
                    fullWidth
                    disabled
                  />

                  <TextField
                    label="Medicamento"
                    value={inventario?.medicamento.nombre ?? ''}
                    fullWidth
                    disabled
                  />

                  <TextField
                    label="Código del medicamento"
                    value={inventario?.medicamento.codigo ?? ''}
                    fullWidth
                    disabled
                  />

                  <TextField
                    label="Stock actual"
                    value={formulario.stock_actual}
                    fullWidth
                    disabled
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  Nivel mínimo de existencias
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Define la cantidad mínima que debe mantenerse disponible antes
                  de considerar este medicamento con stock bajo.
                </Typography>

                <TextField
                  label="Stock mínimo"
                  type="number"
                  value={formulario.stock_minimo}
                  onChange={(event) =>
                    cambiarCampo('stock_minimo', event.target.value)
                  }
                  required
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: 1,
                    },
                  }}
                />
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
                  <InputLabel id="sucursal-inventario-label">
                    Sucursal
                  </InputLabel>

                  <Select
                    labelId="sucursal-inventario-label"
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
                        {sucursal.estado !== 'ACTIVO'
                          ? ' (INACTIVA)'
                          : ''}
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
                  <MedicationRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Medicamento
                  </Typography>
                </Stack>

                <FormControl
                  fullWidth
                  required
                  disabled={!formulario.id_sucursal}
                >
                  <InputLabel id="medicamento-inventario-label">
                    Medicamento
                  </InputLabel>

                  <Select
                    labelId="medicamento-inventario-label"
                    label="Medicamento"
                    value={formulario.id_medicamento}
                    onChange={(event) =>
                      cambiarCampo(
                        'id_medicamento',
                        event.target.value,
                      )
                    }
                  >
                    {medicamentosDisponibles.map((medicamento) => (
                      <MenuItem
                        key={medicamento.id_medicamento}
                        value={medicamento.id_medicamento.toString()}
                      >
                        {medicamento.codigo} - {medicamento.nombre} -{' '}
                        {medicamento.concentracion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formulario.id_sucursal &&
                  medicamentosDisponibles.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Todos los medicamentos disponibles ya tienen un inventario
                      registrado en esta sucursal.
                    </Alert>
                  )}
              </Box>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 2 }}
                >
                  <InventoryRoundedIcon color="primary" />

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Existencias
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                >
                  <TextField
                    label="Stock inicial"
                    type="number"
                    value={formulario.stock_actual}
                    onChange={(event) =>
                      cambiarCampo('stock_actual', event.target.value)
                    }
                    required
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 1,
                      },
                    }}
                  />

                  <TextField
                    label="Stock mínimo"
                    type="number"
                    value={formulario.stock_minimo}
                    onChange={(event) =>
                      cambiarCampo('stock_minimo', event.target.value)
                    }
                    required
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 1,
                      },
                    }}
                  />
                </Stack>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Después de registrar el inventario, el stock actual no se
                  modificará directamente desde esta pantalla. Los cambios de
                  existencias se gestionarán mediante movimientos de inventario.
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
            'Guardar configuración'
          ) : (
            'Registrar inventario'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InventarioForm