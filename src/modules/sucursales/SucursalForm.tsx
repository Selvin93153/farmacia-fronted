import { useEffect, useState } from 'react'

import {
  Alert,
  Autocomplete,
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
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import StoreRoundedIcon from '@mui/icons-material/StoreRounded'

import type { Municipio } from '../municipios/municipiosService'

import type {
  ActualizarSucursal,
  CrearSucursal,
  Sucursal,
} from './sucursalesService'

interface SucursalFormProps {
  abierto: boolean
  sucursal: Sucursal | null
  municipios: Municipio[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (
    datos: CrearSucursal | ActualizarSucursal,
  ) => Promise<void>
}

interface FormularioSucursal {
  id_municipio: string
  codigo: string
  nombre: string
  tipo_sucursal: 'FARMACIA' | 'STAND'
  direccion: string
  latitud: string
  longitud: string
  telefono: string
  estado: 'ACTIVA' | 'INACTIVA'
}

const formularioInicial: FormularioSucursal = {
  id_municipio: '',
  codigo: '',
  nombre: '',
  tipo_sucursal: 'FARMACIA',
  direccion: '',
  latitud: '',
  longitud: '',
  telefono: '',
  estado: 'ACTIVA',
}

const normalizarTexto = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

function SucursalForm({
  abierto,
  sucursal,
  municipios,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: SucursalFormProps) {
  const [formulario, setFormulario] = useState<FormularioSucursal>(
    formularioInicial,
  )

  const [errorFormulario, setErrorFormulario] = useState('')

  const editando = sucursal !== null

  // Carga los datos de la sucursal cuando se edita o limpia el formulario al crear.
  useEffect(() => {
    if (!abierto) {
      return
    }

    if (sucursal) {
      setFormulario({
        id_municipio: sucursal.id_municipio.toString(),
        codigo: sucursal.codigo,
        nombre: sucursal.nombre,
        tipo_sucursal:
          sucursal.tipo_sucursal === 'STAND'
            ? 'STAND'
            : 'FARMACIA',
        direccion: sucursal.direccion,
        latitud: sucursal.latitud,
        longitud: sucursal.longitud,
        telefono: sucursal.telefono,
        estado:
          sucursal.estado === 'INACTIVA' ||
          sucursal.estado === 'INACTIVO'
            ? 'INACTIVA'
            : 'ACTIVA',
      })
    } else {
      setFormulario(formularioInicial)
    }

    setErrorFormulario('')
  }, [abierto, sucursal])

  const cambiarCampo = (
    campo: keyof FormularioSucursal,
    valor: string,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  // Valida los datos y construye el DTO correspondiente para crear o editar.
  const manejarGuardar = async () => {
    setErrorFormulario('')

    const codigo = formulario.codigo.trim()
    const nombre = formulario.nombre.trim()
    const direccion = formulario.direccion.trim()
    const latitudTexto = formulario.latitud.trim()
    const longitudTexto = formulario.longitud.trim()
    const telefono = formulario.telefono.trim()

    if (!formulario.id_municipio) {
      setErrorFormulario('Debes seleccionar un municipio.')
      return
    }

    if (!codigo) {
      setErrorFormulario(
        'Debes ingresar el código de la sucursal.',
      )
      return
    }

    if (codigo.length > 30) {
      setErrorFormulario(
        'El código no puede superar los 30 caracteres.',
      )
      return
    }

    if (!nombre) {
      setErrorFormulario(
        'Debes ingresar el nombre de la sucursal.',
      )
      return
    }

    if (nombre.length > 100) {
      setErrorFormulario(
        'El nombre no puede superar los 100 caracteres.',
      )
      return
    }

    if (!direccion) {
      setErrorFormulario('Debes ingresar la dirección.')
      return
    }

    if (direccion.length > 255) {
      setErrorFormulario(
        'La dirección no puede superar los 255 caracteres.',
      )
      return
    }

    if (!latitudTexto) {
      setErrorFormulario('Debes ingresar la latitud.')
      return
    }

    if (!longitudTexto) {
      setErrorFormulario('Debes ingresar la longitud.')
      return
    }

    const latitud = Number(latitudTexto)
    const longitud = Number(longitudTexto)

    if (
      Number.isNaN(latitud) ||
      latitud < -90 ||
      latitud > 90
    ) {
      setErrorFormulario(
        'La latitud debe ser un valor válido entre -90 y 90.',
      )
      return
    }

    if (
      Number.isNaN(longitud) ||
      longitud < -180 ||
      longitud > 180
    ) {
      setErrorFormulario(
        'La longitud debe ser un valor válido entre -180 y 180.',
      )
      return
    }

    if (!telefono) {
      setErrorFormulario('Debes ingresar el teléfono.')
      return
    }

    if (telefono.length > 20) {
      setErrorFormulario(
        'El teléfono no puede superar los 20 caracteres.',
      )
      return
    }

    if (editando) {
      const datos: ActualizarSucursal = {
        id_municipio: Number(formulario.id_municipio),
        codigo,
        nombre,
        tipo_sucursal: formulario.tipo_sucursal,
        direccion,
        latitud: latitudTexto,
        longitud: longitudTexto,
        telefono,
        estado: formulario.estado,
      }

      await onGuardar(datos)
      return
    }

    const datos: CrearSucursal = {
      id_municipio: Number(formulario.id_municipio),
      codigo,
      nombre,
      tipo_sucursal: formulario.tipo_sucursal,
      direccion,
      latitud: latitudTexto,
      longitud: longitudTexto,
      telefono,
    }

    await onGuardar(datos)
  }

  const municipiosActivos = municipios.filter(
    (municipio) => municipio.estado === 'ACTIVO',
  )

  const municipioSeleccionado =
    municipiosActivos.find(
      (municipio) =>
        municipio.id_municipio.toString() ===
        formulario.id_municipio,
    ) ?? null

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editando ? 'Editar sucursal' : 'Nueva sucursal'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {(error || errorFormulario) && (
            <Alert severity="error">
              {errorFormulario || error}
            </Alert>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center' }}
          >
            <StoreRoundedIcon color="primary" />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Información general
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
          >
            <TextField
              label="Código"
              value={formulario.codigo}
              onChange={(event) =>
                cambiarCampo('codigo', event.target.value)
              }
              placeholder="Ej. SUC-001"
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
              placeholder="Ej. Farmacia Central"
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />
          </Stack>

          <FormControl fullWidth required>
            <InputLabel id="tipo-sucursal-label">
              Tipo de sucursal
            </InputLabel>

            <Select
              labelId="tipo-sucursal-label"
              label="Tipo de sucursal"
              value={formulario.tipo_sucursal}
              onChange={(event) =>
                cambiarCampo(
                  'tipo_sucursal',
                  event.target.value,
                )
              }
            >
              <MenuItem value="FARMACIA">
                Farmacia
              </MenuItem>

              <MenuItem value="STAND">
                Stand
              </MenuItem>
            </Select>
          </FormControl>

          {editando && (
            <FormControl fullWidth>
              <InputLabel id="estado-sucursal-label">
                Estado
              </InputLabel>

              <Select
                labelId="estado-sucursal-label"
                label="Estado"
                value={formulario.estado}
                onChange={(event) =>
                  cambiarCampo(
                    'estado',
                    event.target.value,
                  )
                }
              >
                <MenuItem value="ACTIVA">
                  Activa
                </MenuItem>

                <MenuItem value="INACTIVA">
                  Inactiva
                </MenuItem>
              </Select>
            </FormControl>
          )}

          <Divider />

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center' }}
          >
            <LocationOnRoundedIcon color="primary" />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Ubicación
            </Typography>
          </Stack>

          <Autocomplete
            options={municipiosActivos}
            value={municipioSeleccionado}
            forcePopupIcon={false}
            getOptionLabel={(municipio) =>
              `${municipio.nombre} - ${municipio.departamento.nombre}`
            }
            isOptionEqualToValue={(option, value) =>
              option.id_municipio === value.id_municipio
            }
            filterOptions={(options, state) => {
              const busqueda = normalizarTexto(
                state.inputValue,
              )

              if (!busqueda) {
                return []
              }

              return options
                .filter((municipio) =>
                  normalizarTexto(
                    municipio.nombre,
                  ).includes(busqueda),
                )
                .slice(0, 20)
            }}
            onChange={(_, municipio) => {
              cambiarCampo(
                'id_municipio',
                municipio?.id_municipio.toString() ?? '',
              )
            }}
            noOptionsText="Escribe el nombre de un municipio"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Municipio"
                placeholder="Buscar municipio..."
                required
                fullWidth
              />
            )}
          />

          <TextField
            label="Dirección"
            value={formulario.direccion}
            onChange={(event) =>
              cambiarCampo(
                'direccion',
                event.target.value,
              )
            }
            placeholder="Dirección completa de la sucursal"
            required
            fullWidth
            multiline
            minRows={2}
            slotProps={{
              htmlInput: {
                maxLength: 255,
              },
            }}
          />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
          >
            <TextField
              label="Latitud"
              value={formulario.latitud}
              onChange={(event) =>
                cambiarCampo(
                  'latitud',
                  event.target.value,
                )
              }
              placeholder="Ej. 14.634915"
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  inputMode: 'decimal',
                },
              }}
            />

            <TextField
              label="Longitud"
              value={formulario.longitud}
              onChange={(event) =>
                cambiarCampo(
                  'longitud',
                  event.target.value,
                )
              }
              placeholder="Ej. -90.506882"
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  inputMode: 'decimal',
                },
              }}
            />
          </Stack>

          <Alert severity="info">
            La latitud y longitud deben corresponder a la
            ubicación geográfica de la sucursal.
          </Alert>

          <Divider />

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center' }}
          >
            <BusinessRoundedIcon color="primary" />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Contacto
            </Typography>
          </Stack>

          <TextField
            label="Teléfono"
            value={formulario.telefono}
            onChange={(event) =>
              cambiarCampo(
                'telefono',
                event.target.value,
              )
            }
            placeholder="Ej. 22334455"
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <PhoneRoundedIcon
                    fontSize="small"
                    sx={{
                      mr: 1,
                      color: 'text.secondary',
                    }}
                  />
                ),
              },
              htmlInput: {
                maxLength: 20,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onCerrar}
          disabled={guardando}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={manejarGuardar}
          disabled={guardando}
        >
          {guardando ? (
            <>
              <CircularProgress
                size={20}
                color="inherit"
                sx={{ mr: 1 }}
              />

              Guardando...
            </>
          ) : editando ? (
            'Guardar cambios'
          ) : (
            'Crear sucursal'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SucursalForm