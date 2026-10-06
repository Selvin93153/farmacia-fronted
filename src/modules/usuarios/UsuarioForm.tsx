import { useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import type { Rol } from '../roles/rolesService'
import type {
  ActualizarUsuario,
  CrearUsuario,
  EmpleadoUsuario,
  Usuario,
} from './usuariosService'

export interface SucursalOpcion {
  id_sucursal: number
  codigo: string
  nombre: string
  estado: string
}

interface UsuarioFormProps {
  usuario?: Usuario | null
  roles: Rol[]
  sucursales: SucursalOpcion[]
  empleados: EmpleadoUsuario[]
  usuarios: Usuario[]
  guardando?: boolean
  onGuardar: (
    datos: CrearUsuario | ActualizarUsuario,
  ) => Promise<void>
  onCancelar: () => void
}

function UsuarioForm({
  usuario,
  roles,
  sucursales,
  empleados,
  usuarios,
  guardando = false,
  onGuardar,
  onCancelar,
}: UsuarioFormProps) {
  const modoEdicion = Boolean(usuario)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idRol, setIdRol] = useState<number | ''>('')
  const [idEmpleado, setIdEmpleado] = useState<number | ''>('')
  const [idSucursal, setIdSucursal] = useState<number | ''>('')
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [error, setError] = useState('')

  // Carga los datos del usuario cuando el formulario está en modo edición.

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre)
      setApellido(usuario.apellido)
      setCorreo(usuario.correo)
      setTelefono(usuario.telefono)
      setIdRol(usuario.id_rol)
      setIdEmpleado(usuario.id_empleado ?? '')
      setIdSucursal(usuario.id_sucursal ?? '')
      setEstado(usuario.estado)
      setPassword('')
      setConfirmarPassword('')
      setError('')
      return
    }
    setNombre('')
    setApellido('')
    setCorreo('')
    setTelefono('')
    setIdRol('')
    setIdEmpleado('')
    setIdSucursal('')
    setEstado('ACTIVO')
    setPassword('')
    setConfirmarPassword('')
    setError('')
  }, [usuario])

  const rolSeleccionado = useMemo(
    () => roles.find((rol) => rol.id === idRol),
    [roles, idRol],
  )
  const esAdministradorSistema = rolSeleccionado?.codigo === 'ADMIN_SISTEMA'
  const esAccesoNacional = esAdministradorSistema || rolSeleccionado?.codigo === 'RRHH'

  const rolesDisponibles = useMemo(
    () =>
      roles.filter(
        (rol) =>
          rol.activo ||
          rol.id === usuario?.id_rol,
      ),
    [roles, usuario],
  )

  const sucursalesDisponibles = useMemo(
    () =>
      sucursales.filter(
        (sucursal) =>
          sucursal.estado === 'ACTIVA' ||
          sucursal.id_sucursal === usuario?.id_sucursal,
      ),
    [sucursales, usuario],
  )

  // Los roles nacionales no están limitados a una farmacia operativa.

  useEffect(() => {
    if (esAccesoNacional) {
      setIdSucursal('')
    }
  }, [esAccesoNacional])

  const empleadosDisponibles = useMemo(() => {
    const empleadosOcupados = new Set(
      usuarios
        .filter((item) => item.id_usuario !== usuario?.id_usuario)
        .map((item) => item.id_empleado)
        .filter((id): id is number => typeof id === 'number'),
    )

    return empleados.filter(
      (empleado) =>
        (empleado.estado === 'ACTIVO' || empleado.id_empleado === usuario?.id_empleado) &&
        !empleadosOcupados.has(empleado.id_empleado),
    )
  }, [empleados, usuarios, usuario])

  // Vincula el empleado y completa sus datos personales sin duplicar su registro.

  const cambiarEmpleado = (id: number | '') => {
    setIdEmpleado(id)

    if (id === '') return

    const empleado = empleados.find((item) => item.id_empleado === id)
    if (!empleado) return

    setNombre(empleado.nombres)
    setApellido(empleado.apellidos)
    setTelefono(empleado.telefono)

    if (!esAccesoNacional) {
      setIdSucursal(empleado.id_sucursal)
    }
  }

  const validarFormulario = () => {
    const nombreLimpio = nombre.trim()
    const apellidoLimpio = apellido.trim()
    const correoLimpio = correo.trim()
    const telefonoLimpio = telefono.trim()
    if (!nombreLimpio) {
      return 'El nombre es obligatorio.'
    }
    if (nombreLimpio.length > 100) {
      return 'El nombre no puede superar los 100 caracteres.'
    }
    if (!apellidoLimpio) {
      return 'El apellido es obligatorio.'
    }
    if (apellidoLimpio.length > 100) {
      return 'El apellido no puede superar los 100 caracteres.'
    }
    if (!correoLimpio) {
      return 'El correo es obligatorio.'
    }
    if (correoLimpio.length > 150) {
      return 'El correo no puede superar los 150 caracteres.'
    }
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correoValido.test(correoLimpio)) {
      return 'Ingresa un correo electrónico válido.'
    }
    if (!telefonoLimpio) {
      return 'El teléfono es obligatorio.'
    }
    if (telefonoLimpio.length > 20) {
      return 'El teléfono no puede superar los 20 caracteres.'
    }
    if (!idRol) {
      return 'Debes seleccionar un rol.'
    }
    // Las cuentas existentes sin empleado se pueden vincular progresivamente.
    if (!esAdministradorSistema && !idEmpleado && (!modoEdicion || usuario?.id_empleado != null)) {
      return 'Debes seleccionar un empleado para este usuario.'
    }
    if (!esAccesoNacional && !idSucursal) {
      return 'Debes seleccionar una sucursal para este rol.'
    }
    if (!modoEdicion) {
      if (!password) {
        return 'La contraseña es obligatoria.'
      }
      if (password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.'
      }
      if (password.length > 100) {
        return 'La contraseña no puede superar los 100 caracteres.'
      }
      const passwordValida =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
      if (!passwordValida.test(password)) {
        return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.'
      }
      if (password !== confirmarPassword) {
        return 'Las contraseñas no coinciden.'
      }
    }
    return ''
  }

  // Valida el formulario y envía los datos correspondientes a crear o editar.

  const manejarSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    const mensajeValidacion = validarFormulario()
    if (mensajeValidacion) {
      setError(mensajeValidacion)
      return
    }
    setError('')
    const datosComunes = {
      id_rol: Number(idRol),
      id_sucursal: esAccesoNacional ? null : Number(idSucursal),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim().toLowerCase(),
      telefono: telefono.trim(),
    }
    if (modoEdicion) {
      const datos: ActualizarUsuario = {
        ...datosComunes,
        estado,
      }

      // Evita revalidar al empleado si no cambió la vinculación existente.
      if ((idEmpleado || null) !== (usuario?.id_empleado ?? null)) {
        datos.id_empleado = idEmpleado === '' ? null : Number(idEmpleado)
      }

      await onGuardar(datos)
      return
    }
    const datos: CrearUsuario = {
      ...datosComunes,
      id_empleado: idEmpleado === '' ? null : Number(idEmpleado),
      password,
    }
    await onGuardar(datos)
  }

  return (
    <Box
      component="form"
      onSubmit={manejarSubmit}
      noValidate
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {modoEdicion
              ? 'Editar usuario'
              : 'Nuevo usuario'}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {modoEdicion
              ? 'Modifica la información y permisos generales de la cuenta.'
              : 'Registra una nueva cuenta de acceso a SIGFAR.'}
          </Typography>
        </Box>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Empleado asociado
          </Typography>

          <FormControl
            fullWidth
            required={!esAdministradorSistema && (!modoEdicion || usuario?.id_empleado != null)}
            disabled={guardando}
          >
            <InputLabel id="usuario-empleado-label">Empleado</InputLabel>
            <Select
              labelId="usuario-empleado-label"
              label="Empleado"
              value={idEmpleado}
              onChange={(event) => {
  const valor = String(event.target.value)
  cambiarEmpleado(valor === '' ? '' : Number(valor))
}}
            >
              {(esAdministradorSistema || (modoEdicion && usuario?.id_empleado == null)) && (
                <MenuItem value="">
                  {esAdministradorSistema
                    ? 'Sin empleado (cuenta técnica o soporte)'
                    : 'Pendiente de vincular empleado'}
                </MenuItem>
              )}
              {empleadosDisponibles.map((empleado) => (
                <MenuItem key={empleado.id_empleado} value={empleado.id_empleado}>
                  {empleado.codigo_empleado} - {empleado.nombres} {empleado.apellidos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Solo aparecen empleados disponibles. Al seleccionar uno, se completan
            automáticamente su nombre, apellido y teléfono.
          </Typography>

          {empleadosDisponibles.length === 0 && !modoEdicion && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              No hay empleados disponibles para vincular. Registra primero al empleado
              o verifica que no tenga otra cuenta de usuario.
            </Alert>
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(event) =>
              setNombre(event.target.value)
            }
            required
            fullWidth
            disabled={guardando}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />
          <TextField
            label="Apellido"
            value={apellido}
            onChange={(event) =>
              setApellido(event.target.value)
            }
            required
            fullWidth
            disabled={guardando}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />
          <TextField
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={(event) =>
              setCorreo(event.target.value)
            }
            required
            fullWidth
            disabled={guardando}
            slotProps={{
              htmlInput: {
                maxLength: 150,
              },
            }}
          />
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={(event) =>
              setTelefono(event.target.value)
            }
            required
            fullWidth
            disabled={guardando}
            slotProps={{
              htmlInput: {
                maxLength: 20,
              },
            }}
          />
          <FormControl
            fullWidth
            required
            disabled={guardando}
          >
            <InputLabel id="usuario-rol-label">
              Rol
            </InputLabel>
            <Select
              labelId="usuario-rol-label"
              label="Rol"
              value={idRol}
              onChange={(event) =>
                setIdRol(
                  Number(event.target.value),
                )
              }
            >
              {rolesDisponibles.map((rol) => (
                <MenuItem
                  key={rol.id}
                  value={rol.id}
                >
                  {rol.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            fullWidth
            required={!esAccesoNacional}
            disabled={
              guardando ||
              !idRol ||
              esAccesoNacional
            }
          >
            <InputLabel id="usuario-sucursal-label">
              Sucursal
            </InputLabel>
            <Select
              labelId="usuario-sucursal-label"
              label="Sucursal"
              value={idSucursal}
              onChange={(event) =>
                setIdSucursal(
                  Number(event.target.value),
                )
              }
            >
              {sucursalesDisponibles.map(
                (sucursal) => (
                  <MenuItem
                    key={sucursal.id_sucursal}
                    value={sucursal.id_sucursal}
                  >
                    {sucursal.codigo} - {sucursal.nombre}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        </Box>
        {esAccesoNacional && (
          <Alert severity="info">
            Este rol tiene alcance nacional y no necesita una sucursal de acceso.
            Su sede de trabajo sigue registrada en la ficha del empleado.
          </Alert>
        )}
        {!modoEdicion && (
          <>
            <DividerFormulario />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700 }}
              >
                Contraseña de acceso
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
                },
                gap: 2,
              }}
            >
              <TextField
                label="Contraseña"
                type={
                  mostrarPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                fullWidth
                disabled={guardando}
                autoComplete="new-password"
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setMostrarPassword(
                              (valor) => !valor,
                            )
                          }
                          edge="end"
                          aria-label="Mostrar u ocultar contraseña"
                        >
                          {mostrarPassword ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Confirmar contraseña"
                type={
                  mostrarConfirmacion
                    ? 'text'
                    : 'password'
                }
                value={confirmarPassword}
                onChange={(event) =>
                  setConfirmarPassword(
                    event.target.value,
                  )
                }
                required
                fullWidth
                disabled={guardando}
                autoComplete="new-password"
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setMostrarConfirmacion(
                              (valor) => !valor,
                            )
                          }
                          edge="end"
                          aria-label="Mostrar u ocultar confirmación"
                        >
                          {mostrarConfirmacion ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </>
        )}
        {modoEdicion && (
          <>
            <DividerFormulario />
            <FormControl
              fullWidth
              disabled={guardando}
            >
              <InputLabel id="usuario-estado-label">
                Estado
              </InputLabel>
              <Select
                labelId="usuario-estado-label"
                label="Estado"
                value={estado}
                onChange={(event) =>
                  setEstado(
                    event.target.value as
                      | 'ACTIVO'
                      | 'INACTIVO',
                  )
                }
              >
                <MenuItem value="ACTIVO">
                  ACTIVO
                </MenuItem>
                <MenuItem value="INACTIVO">
                  INACTIVO
                </MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
          sx={{
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : modoEdicion
                ? 'Guardar cambios'
                : 'Crear usuario'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

function DividerFormulario() {

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
      }}
    />
  )
}

export default UsuarioForm
