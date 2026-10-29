import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

import {
  cambiarPassword,
  obtenerSesion,
  type UsuarioSesion,
} from '../auth/authService'

function Perfil() {
  const [usuario, setUsuario] =
    useState<UsuarioSesion | null>(null)

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [dialogoPasswordAbierto, setDialogoPasswordAbierto] =
    useState(false)

  const [passwordActual, setPasswordActual] =
    useState('')

  const [passwordNueva, setPasswordNueva] =
    useState('')

  const [confirmarPassword, setConfirmarPassword] =
    useState('')

  const [mostrarPasswordActual, setMostrarPasswordActual] =
    useState(false)

  const [mostrarPasswordNueva, setMostrarPasswordNueva] =
    useState(false)

  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false)

  const [guardandoPassword, setGuardandoPassword] =
    useState(false)

  const [errorPassword, setErrorPassword] =
    useState('')

  const [mensajePassword, setMensajePassword] =
    useState('')

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const sesion =
          await obtenerSesion()

        setUsuario(sesion)
      } catch {
        setError(
          'No se pudo obtener la información del perfil.',
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarPerfil()
  }, [])

  const obtenerMensajeError = (
    error: unknown,
    mensajePredeterminado: string,
  ) => {
    if (axios.isAxiosError(error)) {
      const mensajeBackend =
        error.response?.data?.message

      if (Array.isArray(mensajeBackend)) {
        return mensajeBackend.join(', ')
      }

      if (
        typeof mensajeBackend === 'string'
      ) {
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

  const abrirCambioPassword = () => {
    setPasswordActual('')
    setPasswordNueva('')
    setConfirmarPassword('')
    setErrorPassword('')
    setMensajePassword('')

    setMostrarPasswordActual(false)
    setMostrarPasswordNueva(false)
    setMostrarConfirmacion(false)

    setDialogoPasswordAbierto(true)
  }

  const cerrarCambioPassword = () => {
    if (guardandoPassword) {
      return
    }

    setDialogoPasswordAbierto(false)

    setPasswordActual('')
    setPasswordNueva('')
    setConfirmarPassword('')
    setErrorPassword('')

    setMostrarPasswordActual(false)
    setMostrarPasswordNueva(false)
    setMostrarConfirmacion(false)
  }

  // Valida los campos y solicita el cambio de contraseña al backend.
  const guardarNuevaPassword = async () => {
    setErrorPassword('')
    setMensajePassword('')

    if (!passwordActual) {
      setErrorPassword(
        'Debes ingresar tu contraseña actual.',
      )
      return
    }

    if (!passwordNueva) {
      setErrorPassword(
        'Debes ingresar la nueva contraseña.',
      )
      return
    }

    if (passwordNueva.length < 8) {
      setErrorPassword(
        'La nueva contraseña debe tener al menos 8 caracteres.',
      )
      return
    }

    if (!confirmarPassword) {
      setErrorPassword(
        'Debes confirmar la nueva contraseña.',
      )
      return
    }

    if (
      passwordNueva !==
      confirmarPassword
    ) {
      setErrorPassword(
        'La nueva contraseña y su confirmación no coinciden.',
      )
      return
    }

    if (
      passwordActual ===
      passwordNueva
    ) {
      setErrorPassword(
        'La nueva contraseña debe ser diferente de la contraseña actual.',
      )
      return
    }

    setGuardandoPassword(true)

    try {
      const respuesta =
        await cambiarPassword({
          password_actual:
            passwordActual,

          password_nueva:
            passwordNueva,

          confirmar_password:
            confirmarPassword,
        })

      setMensajePassword(
        respuesta.message,
      )

      setPasswordActual('')
      setPasswordNueva('')
      setConfirmarPassword('')

      setMostrarPasswordActual(false)
      setMostrarPasswordNueva(false)
      setMostrarConfirmacion(false)
    } catch (error: unknown) {
      setErrorPassword(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cambiar la contraseña.',
        ),
      )
    } finally {
      setGuardandoPassword(false)
    }
  }

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
        >
          <CircularProgress />

          <Typography color="text.secondary">
            Cargando perfil...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (!usuario) {
    return (
      <Alert severity="error">
        No se encontró información del usuario autenticado.
      </Alert>
    )
  }

  const nombreCompleto =
    `${usuario.nombre} ${usuario.apellido}`

  const iniciales =
    `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`

  const nombreRol =
    usuario.rol?.nombre ??
    `Rol ${usuario.id_rol}`

  const nombreSucursal =
    usuario.sucursal?.nombre ??
    (usuario.id_sucursal
      ? `Sucursal ${usuario.id_sucursal}`
      : 'Sin sucursal asignada')

  return (
    <>
      <Stack spacing={4}>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
            }}
          >
            Mi perfil
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Consulta la información asociada a tu cuenta de SIGFAR.
          </Typography>
        </Box>

        {/* TARJETA PRINCIPAL DEL PERFIL */}
        <Paper
          variant="outlined"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,

            p: {
              xs: 3,
              md: 4,
            },

            bgcolor: 'background.paper',
            borderColor: 'divider',

            boxShadow:
              '0 8px 30px rgba(0, 0, 0, 0.05)',

            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 6,
              height: '100%',
              bgcolor: 'primary.main',
            },
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              lg: 'row',
            }}
            spacing={4}
            sx={{
              justifyContent:
                'space-between',

              alignItems: {
                xs: 'stretch',
                lg: 'center',
              },
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={3}
              sx={{
                alignItems: {
                  xs: 'flex-start',
                  sm: 'center',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: 'primary.main',
                  color:
                    'primary.contrastText',
                  fontSize: 36,
                  fontWeight: 800,
                  boxShadow: 3,
                }}
              >
                {iniciales}
              </Avatar>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="overline"
                    color="primary"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 1.2,
                    }}
                  >
                    Perfil de usuario
                  </Typography>

                  <Chip
                    icon={
                      <CheckCircleRoundedIcon />
                    }
                    label={usuario.estado}
                    color={
                      usuario.estado ===
                      'ACTIVO'
                        ? 'success'
                        : 'default'
                    }
                    size="small"
                    sx={{
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                  }}
                >
                  {nombreCompleto}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mt: 1,
                    alignItems: 'center',
                    color:
                      'text.secondary',
                  }}
                >
                  <EmailRoundedIcon fontSize="small" />

                  <Typography color="text.secondary">
                    {usuario.correo}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mt: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Chip
                    icon={
                      <AdminPanelSettingsRoundedIcon />
                    }
                    label={nombreRol}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    icon={
                      <BusinessRoundedIcon />
                    }
                    label={nombreSucursal}
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Box
              sx={{
                width: {
                  xs: '100%',
                  lg: 280,
                },

                flexShrink: 0,
                bgcolor: 'action.hover',
                borderRadius: 3,
                p: 3,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    bgcolor: 'success.main',
                    color:
                      'success.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                  }}
                >
                  <VerifiedUserRoundedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 0.5,
                    }}
                  >
                    Estado de la cuenta
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Cuenta habilitada
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Tu usuario se encuentra registrado y habilitado para acceder a
                  SIGFAR según los permisos de tu rol.
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              lg: '2fr 1fr',
            },

            gap: 3,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems:
                        'center',
                    }}
                  >
                    <AccountCircleRoundedIcon color="primary" />

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Información personal
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Datos principales asociados a tu usuario.
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: 'grid',

                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                    },

                    gap: 2.5,
                  }}
                >
                  <InformacionPerfil
                    icono={
                      <PersonRoundedIcon />
                    }
                    titulo="Nombre"
                    valor={usuario.nombre}
                  />

                  <InformacionPerfil
                    icono={
                      <PersonRoundedIcon />
                    }
                    titulo="Apellido"
                    valor={usuario.apellido}
                  />

                  <InformacionPerfil
                    icono={
                      <EmailRoundedIcon />
                    }
                    titulo="Correo electrónico"
                    valor={usuario.correo}
                  />

                  <InformacionPerfil
                    icono={
                      <PhoneRoundedIcon />
                    }
                    titulo="Teléfono"
                    valor={
                      usuario.telefono ||
                      'No registrado'
                    }
                  />

                  <InformacionPerfil
                    icono={
                      <BadgeRoundedIcon />
                    }
                    titulo="ID de usuario"
                    valor={`#${usuario.id_usuario}`}
                  />

                  <InformacionPerfil
                    icono={
                      <CheckCircleRoundedIcon />
                    }
                    titulo="Estado"
                    valor={usuario.estado}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2.5,
                      bgcolor: 'primary.main',
                      color:
                        'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    <AdminPanelSettingsRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Rol asignado
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 0.5,
                        fontWeight: 700,
                      }}
                    >
                      {nombreRol}
                    </Typography>
                  </Box>

                  {usuario.rol
                    ?.descripcion && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {
                        usuario.rol
                          .descripcion
                      }
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2.5,
                      bgcolor:
                        'secondary.main',

                      color:
                        'secondary.contrastText',

                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    <BusinessRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Sucursal asignada
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 0.5,
                        fontWeight: 700,
                      }}
                    >
                      {nombreSucursal}
                    </Typography>
                  </Box>

                  {usuario.sucursal
                    ?.codigo && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Código:{' '}
                      {
                        usuario.sucursal
                          .codigo
                      }
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* SEGURIDAD DE LA CUENTA */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={2}
              sx={{
                alignItems: {
                  xs: 'flex-start',
                  sm: 'center',
                },

                justifyContent:
                  'space-between',
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2.5,
                    bgcolor:
                      'action.selected',

                    color:
                      'primary.main',

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',

                    flexShrink: 0,
                  }}
                >
                  <LockResetRoundedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Seguridad de la cuenta
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Tu sesión se encuentra protegida mediante autenticación
                    segura de SIGFAR.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
                sx={{
                  width: {
                    xs: '100%',
                    sm: 'auto',
                  },
                }}
              >
                <Chip
                  icon={
                    <CheckCircleRoundedIcon />
                  }
                  label="Sesión activa"
                  color="success"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    alignSelf: {
                      xs: 'flex-start',
                      sm: 'center',
                    },
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={
                    <LockResetRoundedIcon />
                  }
                  onClick={
                    abrirCambioPassword
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  Cambiar contraseña
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* FORMULARIO PARA CAMBIAR CONTRASEÑA */}
      <Dialog
        open={dialogoPasswordAbierto}
        onClose={
          guardandoPassword
            ? undefined
            : cerrarCambioPassword
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Cambiar contraseña
        </DialogTitle>

        <DialogContent dividers>
          <Stack
            spacing={2.5}
            sx={{
              mt: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Por seguridad, confirma tu contraseña actual antes de establecer
              una nueva.
            </Typography>

            {errorPassword && (
              <Alert severity="error">
                {errorPassword}
              </Alert>
            )}

            {mensajePassword && (
              <Alert severity="success">
                {mensajePassword}
              </Alert>
            )}

            <TextField
              label="Contraseña actual"
              type={
                mostrarPasswordActual
                  ? 'text'
                  : 'password'
              }
              value={passwordActual}
              onChange={(event) =>
                setPasswordActual(
                  event.target.value,
                )
              }
              required
              fullWidth
              disabled={guardandoPassword}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setMostrarPasswordActual(
                            (actual) =>
                              !actual,
                          )
                        }
                      >
                        {mostrarPasswordActual ? (
                          <VisibilityOffRoundedIcon />
                        ) : (
                          <VisibilityRoundedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },

                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            <TextField
              label="Nueva contraseña"
              type={
                mostrarPasswordNueva
                  ? 'text'
                  : 'password'
              }
              value={passwordNueva}
              onChange={(event) =>
                setPasswordNueva(
                  event.target.value,
                )
              }
              required
              fullWidth
              disabled={guardandoPassword}
              helperText="Debe contener al menos 8 caracteres."
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setMostrarPasswordNueva(
                            (actual) =>
                              !actual,
                          )
                        }
                      >
                        {mostrarPasswordNueva ? (
                          <VisibilityOffRoundedIcon />
                        ) : (
                          <VisibilityRoundedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },

                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            <TextField
              label="Confirmar nueva contraseña"
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
              disabled={guardandoPassword}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setMostrarConfirmacion(
                            (actual) =>
                              !actual,
                          )
                        }
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

                htmlInput: {
                  maxLength: 100,
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={cerrarCambioPassword}
            disabled={guardandoPassword}
            sx={{
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={
              guardarNuevaPassword
            }
            disabled={
              guardandoPassword ||
              Boolean(mensajePassword)
            }
            startIcon={
              guardandoPassword ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <LockResetRoundedIcon />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            {guardandoPassword
              ? 'Actualizando...'
              : mensajePassword
                ? 'Contraseña actualizada'
                : 'Cambiar contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

interface InformacionPerfilProps {
  icono: ReactNode
  titulo: string
  valor: string
}

function InformacionPerfil({
  icono,
  titulo,
  valor,
}: InformacionPerfilProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: 'action.selected',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icono}
      </Box>

      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {titulo}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            fontWeight: 600,
            wordBreak: 'break-word',
          }}
        >
          {valor}
        </Typography>
      </Box>
    </Stack>
  )
}

export default Perfil