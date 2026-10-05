import { useEffect, useState } from 'react'

import {
  Alert,
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
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'

import type {
  ActualizarCaja,
  Caja,
  CrearCaja,
  EstadoCaja,
} from './cajasService'

export interface SucursalOpcion {
  id_sucursal: number
  codigo: string
  nombre: string
}

interface CajaFormProps {
  abierto: boolean
  caja: Caja | null
  sucursales: SucursalOpcion[]
  idSucursalAsignada: number | null
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearCaja | ActualizarCaja) => Promise<void>
}

interface FormularioCaja {
  id_sucursal: string
  nombre: string
  estado: EstadoCaja
}

const formularioInicial: FormularioCaja = {
  id_sucursal: '',
  nombre: '',
  estado: 'ACTIVA',
}

function CajaForm({
  abierto,
  caja,
  sucursales,
  idSucursalAsignada,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: CajaFormProps) {
  const [formulario, setFormulario] = useState<FormularioCaja>(formularioInicial)
  const [errorFormulario, setErrorFormulario] = useState('')
  const editando = caja !== null

  const sucursalAsignada = sucursales.find(
    (sucursal) => sucursal.id_sucursal === idSucursalAsignada,
  )

  // Precarga la sucursal asignada en nuevas cajas y los valores al editar.
  useEffect(() => {
    if (!abierto) return

    if (caja) {
      setFormulario({
        id_sucursal: caja.id_sucursal.toString(),
        nombre: caja.nombre,
        estado: caja.estado,
      })
    } else {
      setFormulario({
        ...formularioInicial,
        id_sucursal: idSucursalAsignada === null ? '' : idSucursalAsignada.toString(),
      })
    }

    setErrorFormulario('')
  }, [abierto, caja, idSucursalAsignada])

  const cambiarCampo = (campo: keyof FormularioCaja, valor: string) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  // Valida y prepara el DTO sin permitir cambiar la sucursal asignada.
  const manejarGuardar = async () => {
    setErrorFormulario('')

    const nombre = formulario.nombre.trim()

    if (!nombre) {
      setErrorFormulario('Debes ingresar el nombre de la caja.')
      return
    }

    if (nombre.length > 100) {
      setErrorFormulario('El nombre de la caja no puede superar los 100 caracteres.')
      return
    }

    if (editando) {
      const datos: ActualizarCaja = {
        nombre,
        estado: formulario.estado,
      }

      await onGuardar(datos)
      return
    }

    const idSucursal = idSucursalAsignada ?? Number(formulario.id_sucursal)

    if (!Number.isInteger(idSucursal) || idSucursal < 1) {
      setErrorFormulario('Debes seleccionar una sucursal.')
      return
    }

    const datos: CrearCaja = {
      id_sucursal: idSucursal,
      nombre,
    }

    await onGuardar(datos)
  }

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editando ? 'Editar caja' : 'Nueva caja'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {(error || errorFormulario) && (
            <Alert severity="error">{errorFormulario || error}</Alert>
          )}

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <PointOfSaleRoundedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Información de la caja
            </Typography>
          </Stack>

          {editando ? (
            <TextField
              label="Sucursal"
              value={
                caja ? `${caja.sucursal.codigo} - ${caja.sucursal.nombre}` : ''
              }
              fullWidth
              disabled
            />
          ) : idSucursalAsignada !== null ? (
            <TextField
              label="Sucursal asignada"
              value={
                sucursalAsignada
                  ? `${sucursalAsignada.codigo ? `${sucursalAsignada.codigo} - ` : ''}${sucursalAsignada.nombre}`
                  : `Sucursal #${idSucursalAsignada}`
              }
              helperText="La caja se registrará automáticamente en tu sucursal."
              fullWidth
              disabled
            />
          ) : (
            <FormControl fullWidth required>
              <InputLabel id="sucursal-caja-label">Sucursal</InputLabel>
              <Select
                labelId="sucursal-caja-label"
                label="Sucursal"
                value={formulario.id_sucursal}
                onChange={(event) => cambiarCampo('id_sucursal', event.target.value)}
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
          )}

          <TextField
            label="Nombre de la caja"
            placeholder="Ej. Caja 1"
            value={formulario.nombre}
            onChange={(event) => cambiarCampo('nombre', event.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <PointOfSaleRoundedIcon
                    fontSize="small"
                    sx={{ mr: 1, color: 'text.secondary' }}
                  />
                ),
              },
              htmlInput: { maxLength: 100 },
            }}
          />

          {editando && (
            <>
              <Divider />

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <BusinessRoundedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Estado
                </Typography>
              </Stack>

              <FormControl fullWidth>
                <InputLabel id="estado-caja-label">Estado</InputLabel>
                <Select
                  labelId="estado-caja-label"
                  label="Estado"
                  value={formulario.estado}
                  onChange={(event) => cambiarCampo('estado', event.target.value)}
                >
                  <MenuItem value="ACTIVA">Activa</MenuItem>
                  <MenuItem value="INACTIVA">Inactiva</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info">
                Una caja inactiva permanece registrada en el sistema, pero
                puede identificarse como no disponible para operaciones.
              </Alert>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={manejarGuardar} disabled={guardando}>
          {guardando ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Guardando...
            </>
          ) : editando ? (
            'Guardar cambios'
          ) : (
            'Crear caja'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CajaForm
