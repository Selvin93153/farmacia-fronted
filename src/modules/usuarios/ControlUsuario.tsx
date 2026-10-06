import { useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import axios from 'axios'
import { obtenerRoles, type Rol } from '../roles/rolesService'
import { obtenerSucursales } from '../sucursales/sucursalesService'
import UsuarioForm, {
  type SucursalOpcion,
} from './UsuarioForm'
import UsuariosTable from './UsuariosTable'
import {
  actualizarUsuario,
  crearUsuario,
  obtenerEmpleadosParaUsuarios,
  obtenerUsuarios,
  type ActualizarUsuario,
  type CrearUsuario,
  type EmpleadoUsuario,
  type Usuario,
} from './usuariosService'

function ControlUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [sucursales, setSucursales] = useState<SucursalOpcion[]>([])
  const [empleados, setEmpleados] = useState<EmpleadoUsuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success')

  // Obtiene un mensaje legible de los errores enviados por el backend.
  const obtenerMensajeError = (
    error: unknown,
    mensajePredeterminado: string,
  ) => {
    if (axios.isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message
      if (Array.isArray(mensajeBackend)) {
        return mensajeBackend.join(', ')
      }
      if (typeof mensajeBackend === 'string') {
        return mensajeBackend
      }
      if (error.response) {
        return `El backend respondió con error HTTP ${error.response.status}.`
      }
      return 'No se pudo establecer comunicación con el servidor.'
    }
    if (error instanceof Error) {
      return error.message
    }
    return mensajePredeterminado
  }

  // Carga usuarios, roles, sucursales y empleados para asociar las cuentas.

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const [
        usuariosRespuesta,
        rolesRespuesta,
        sucursalesRespuesta,
        empleadosRespuesta,
      ] = await Promise.all([
        obtenerUsuarios(),
        obtenerRoles(),
        obtenerSucursales(),
        obtenerEmpleadosParaUsuarios(),
      ])
      setUsuarios(usuariosRespuesta)
      setRoles(rolesRespuesta)
      setEmpleados(empleadosRespuesta)
      setSucursales(
        sucursalesRespuesta.map((sucursal) => ({
          id_sucursal: sucursal.id_sucursal,
          codigo: sucursal.codigo,
          nombre: sucursal.nombre,
          estado: sucursal.estado,
        })),
      )
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(
        obtenerMensajeError(
          error,
          'No se pudo cargar la información de usuarios.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return usuarios.filter((usuario) => {
      const coincideBusqueda =
        !texto ||
        `${usuario.nombre} ${usuario.apellido}`
          .toLowerCase()
          .includes(texto) ||
        usuario.correo.toLowerCase().includes(texto) ||
        usuario.telefono.toLowerCase().includes(texto)
      const coincideRol =
        !filtroRol ||
        usuario.rol?.codigo === filtroRol
      const coincideSucursal =
        !filtroSucursal ||
        String(usuario.id_sucursal) === filtroSucursal
      const coincideEstado =
        !filtroEstado ||
        usuario.estado === filtroEstado
      return (
        coincideBusqueda &&
        coincideRol &&
        coincideSucursal &&
        coincideEstado
      )
    })
  }, [
    usuarios,
    busqueda,
    filtroRol,
    filtroSucursal,
    filtroEstado,
  ])

  const totalUsuarios = usuarios.length
  const usuariosActivos = useMemo(
    () =>
      usuarios.filter(
        (usuario) => usuario.estado === 'ACTIVO',
      ).length,
    [usuarios],
  )
  const usuariosInactivos = useMemo(
    () =>
      usuarios.filter(
        (usuario) => usuario.estado === 'INACTIVO',
      ).length,
    [usuarios],
  )
  const administradores = useMemo(
    () =>
      usuarios.filter(
        (usuario) =>
          usuario.rol?.codigo === 'ADMIN_SISTEMA' ||
          usuario.rol?.codigo === 'ADMIN_SUCURSAL',
      ).length,
    [usuarios],
  )

  // Abre el formulario para registrar una nueva cuenta.

  const abrirNuevoUsuario = () => {
    setUsuarioEditando(null)
    setDialogoAbierto(true)
  }

  // Abre el formulario con los datos del usuario seleccionado.
  const abrirEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario)
    setDialogoAbierto(true)
  }

  const cerrarDialogo = () => {
    if (guardando) {
      return
    }
    setDialogoAbierto(false)
    setUsuarioEditando(null)
  }

  // Guarda un nuevo usuario o actualiza el usuario seleccionado.

  const guardarUsuario = async (
    datos: CrearUsuario | ActualizarUsuario,
  ) => {
    try {
      setGuardando(true)
      if (usuarioEditando) {
        await actualizarUsuario(
          usuarioEditando.id_usuario,
          datos as ActualizarUsuario,
        )
        setTipoMensaje('success')
        setMensaje('Usuario actualizado correctamente.')
      } else {
        await crearUsuario(datos as CrearUsuario)
        setTipoMensaje('success')
        setMensaje('Usuario creado correctamente.')
      }
      setDialogoAbierto(false)
      setUsuarioEditando(null)
      await cargarDatos()
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(
        obtenerMensajeError(
          error,
          usuarioEditando
            ? 'No se pudo actualizar el usuario.'
            : 'No se pudo crear el usuario.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroRol('')
    setFiltroSucursal('')
    setFiltroEstado('')
  }

  if (cargando && usuarios.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        spacing={2}
        sx={{
          alignItems: {
            xs: 'stretch',
            md: 'center',
          },
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            Usuarios
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Administra las cuentas de acceso, roles y sucursales de los usuarios de SIGFAR.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={abrirNuevoUsuario}
        >
          Nuevo usuario
        </Button>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            xl: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <GroupRoundedIcon color="primary" />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total usuarios
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {totalUsuarios}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <CheckCircleRoundedIcon color="success" />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Usuarios activos
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {usuariosActivos}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <PersonOffRoundedIcon color="disabled" />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Usuarios inactivos
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {usuariosInactivos}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <AdminPanelSettingsRoundedIcon color="primary" />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Administradores
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {administradores}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Buscar y filtrar
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '2fr 1fr',
                lg: '2fr 1fr 1fr 1fr',
              },
              gap: 2,
            }}
          >
            <TextField
              label="Buscar usuario"
              placeholder="Nombre, correo o teléfono"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchRoundedIcon
                      sx={{
                        mr: 1,
                        color: 'text.secondary',
                      }}
                    />
                  ),
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="filtro-rol-label">
                Rol
              </InputLabel>
              <Select
                labelId="filtro-rol-label"
                label="Rol"
                value={filtroRol}
                onChange={(event) =>
                  setFiltroRol(event.target.value)
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>
                {roles.map((rol) => (
                  <MenuItem
                    key={rol.id}
                    value={rol.codigo}
                  >
                    {rol.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="filtro-sucursal-label">
                Sucursal
              </InputLabel>
              <Select
                labelId="filtro-sucursal-label"
                label="Sucursal"
                value={filtroSucursal}
                onChange={(event) =>
                  setFiltroSucursal(event.target.value)
                }
              >
                <MenuItem value="">
                  Todas
                </MenuItem>
                {sucursales.map((sucursal) => (
                  <MenuItem
                    key={sucursal.id_sucursal}
                    value={String(sucursal.id_sucursal)}
                  >
                    {sucursal.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="filtro-estado-label">
                Estado
              </InputLabel>
              <Select
                labelId="filtro-estado-label"
                label="Estado"
                value={filtroEstado}
                onChange={(event) =>
                  setFiltroEstado(event.target.value)
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>
                <MenuItem value="ACTIVO">
                  Activos
                </MenuItem>
                <MenuItem value="INACTIVO">
                  Inactivos
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          {(busqueda ||
            filtroRol ||
            filtroSucursal ||
            filtroEstado) && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      <Box
        sx={{
          mb: 1.5,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
        </Typography>
      </Box>
      <UsuariosTable
        usuarios={usuariosFiltrados}
        onEditarUsuario={abrirEditarUsuario}
      />
      <Dialog
        open={dialogoAbierto}
        onClose={cerrarDialogo}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {usuarioEditando
            ? 'Administrar usuario'
            : 'Registrar usuario'}
        </DialogTitle>
        <DialogContent dividers>
          <UsuarioForm
            usuario={usuarioEditando}
            roles={roles}
            sucursales={sucursales}
            empleados={empleados}
            usuarios={usuarios}
            guardando={guardando}
            onGuardar={guardarUsuario}
            onCancelar={cerrarDialogo}
          />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={Boolean(mensaje)}
        autoHideDuration={5000}
        onClose={() => setMensaje('')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          severity={tipoMensaje}
          variant="filled"
          onClose={() => setMensaje('')}
          sx={{
            width: '100%',
          }}
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ControlUsuario
