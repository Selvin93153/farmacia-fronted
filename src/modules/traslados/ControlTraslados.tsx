import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import { obtenerSesion } from '../auth/authService'

import EnviarTrasladoDialog from './EnviarTrasladoDialog'
import PrepararTrasladoDialog from './PrepararTrasladoDialog'
import RecibirTrasladoDialog from './RecibirTrasladoDialog'
import TrasladoDetalleDialog from './TrasladoDetalleDialog'
import TrasladoFormDialog from './TrasladoFormDialog'
import TrasladosTable from './TrasladosTable'

import {
  actualizarTraslado,
  cancelarTraslado,
  crearTraslado,
  enviarTraslado,
  obtenerMedicamentosTraslado,
  obtenerMensajeError,
  obtenerSucursalesTraslado,
  obtenerTraslado,
  obtenerTraslados,
  recibirTraslado,
  type ActualizarTraslado,
  type CrearTraslado,
  type EnviarDetalleTraslado,
  type EstadoTraslado,
  type MedicamentoTraslado,
  type RecibirDetalleTraslado,
  type SucursalTraslado,
  type Traslado,
} from './trasladosService'

type FiltroEstado =
  | 'TODOS'
  | EstadoTraslado

type FiltroTipo =
  | 'TODOS'
  | 'SALIENTES'
  | 'ENTRANTES'

// Convierte la fecha del traslado a YYYY-MM-DD usando la zona horaria local.
function obtenerFechaLocal(
  fecha: string,
): string {
  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) {
    return ''
  }

  const anio =
    valor.getFullYear()

  const mes = String(
    valor.getMonth() + 1,
  ).padStart(2, '0')

  const dia = String(
    valor.getDate(),
  ).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

interface TarjetaResumenProps {
  titulo: string
  valor: number
  descripcion: string
  icono: ReactNode
}

function TarjetaResumen({
  titulo,
  valor,
  descripcion,
  icono,
}: TarjetaResumenProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        flex: 1,
        minWidth: 220,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems:
              'flex-start',
            justifyContent:
              'space-between',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
              }}
            >
              {titulo}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.4,
                fontWeight: 900,
              }}
            >
              {valor}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color:
                  'text.secondary',
              }}
            >
              {descripcion}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor:
                'action.hover',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
            }}
          >
            {icono}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function ControlTraslados() {
  const [traslados, setTraslados] =
    useState<Traslado[]>([])

  const [sucursales, setSucursales] =
    useState<SucursalTraslado[]>(
      [],
    )

  const [
    medicamentos,
    setMedicamentos,
  ] =
    useState<
      MedicamentoTraslado[]
    >([])

  const [
    idSucursalUsuario,
    setIdSucursalUsuario,
  ] = useState<
    number | null
  >(null)

  const [
    esAdminSistema,
    setEsAdminSistema,
  ] = useState(false)

  const [cargando, setCargando] =
    useState(true)

  const [procesando, setProcesando] =
    useState(false)

  const [error, setError] =
    useState('')

  const [
    errorDialogo,
    setErrorDialogo,
  ] = useState('')

  const [
    busqueda,
    setBusqueda,
  ] = useState('')

  const [
    filtroEstado,
    setFiltroEstado,
  ] =
    useState<FiltroEstado>(
      'TODOS',
    )

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState<FiltroTipo>(
      'TODOS',
    )

  const [
    filtroSucursalOrigen,
    setFiltroSucursalOrigen,
  ] = useState('TODAS')

  const [
    fechaDesde,
    setFechaDesde,
  ] = useState('')

  const [
    fechaHasta,
    setFechaHasta,
  ] = useState('')

  const [
    pagina,
    setPagina,
  ] = useState(0)

  const [
    filasPorPagina,
    setFilasPorPagina,
  ] = useState(10)

  const [
    formAbierto,
    setFormAbierto,
  ] = useState(false)

  const [
    trasladoEditar,
    setTrasladoEditar,
  ] =
    useState<
      Traslado | null
    >(null)

  const [
    prepararAbierto,
    setPrepararAbierto,
  ] = useState(false)

  const [
    trasladoPreparar,
    setTrasladoPreparar,
  ] =
    useState<
      Traslado | null
    >(null)

  const [
    enviarAbierto,
    setEnviarAbierto,
  ] = useState(false)

  const [
    trasladoEnviar,
    setTrasladoEnviar,
  ] =
    useState<
      Traslado | null
    >(null)

  const [
    recibirAbierto,
    setRecibirAbierto,
  ] = useState(false)

  const [
    trasladoRecibir,
    setTrasladoRecibir,
  ] =
    useState<
      Traslado | null
    >(null)

  const [
    detalleAbierto,
    setDetalleAbierto,
  ] = useState(false)

  const [
    trasladoDetalle,
    setTrasladoDetalle,
  ] =
    useState<
      Traslado | null
    >(null)

  const [
    cancelarAbierto,
    setCancelarAbierto,
  ] = useState(false)

  const [
    trasladoCancelar,
    setTrasladoCancelar,
  ] =
    useState<
      Traslado | null
    >(null)

  // Carga sesión, catálogos y traslados necesarios para la vista.
  const cargarDatos =
    useCallback(async () => {
      setCargando(true)
      setError('')

      try {
        const [
          sesion,
          trasladosRecibidos,
          sucursalesRecibidas,
          medicamentosRecibidos,
        ] =
          await Promise.all([
            obtenerSesion(),
            obtenerTraslados(),
            obtenerSucursalesTraslado(),
            obtenerMedicamentosTraslado(),
          ])

        setIdSucursalUsuario(
          sesion.id_sucursal,
        )

        setEsAdminSistema(
          sesion.rol?.codigo ===
            'ADMIN_SISTEMA',
        )

        setTraslados(
          trasladosRecibidos,
        )

        setSucursales(
          sucursalesRecibidas,
        )

        setMedicamentos(
          medicamentosRecibidos,
        )
      } catch (
        errorDesconocido: unknown
      ) {
        setError(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudieron cargar los traslados.',
          ),
        )
      } finally {
        setCargando(false)
      }
    }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  // Regresa a la primera página cuando cambia algún filtro.
  useEffect(() => {
    setPagina(0)
  }, [
    busqueda,
    filtroEstado,
    filtroTipo,
    filtroSucursalOrigen,
    fechaDesde,
    fechaHasta,
  ])

  // Determina los traslados disponibles según el alcance de la sesión.
  const trasladosEnAlcance =
    useMemo(() => {
      if (
        idSucursalUsuario ===
        null
      ) {
        return traslados
      }

      return traslados.filter(
        (traslado) =>
          traslado.id_sucursal_origen ===
            idSucursalUsuario ||
          traslado.id_sucursal_destino ===
            idSucursalUsuario,
      )
    }, [
      traslados,
      idSucursalUsuario,
    ])

  // Aplica búsqueda, estado, relación, farmacia de origen y rango de fechas.
  const trasladosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()

      return trasladosEnAlcance.filter(
        (traslado) => {
          const coincideBusqueda =
            !texto ||
            [
              String(
                traslado.id_traslado,
              ),
              traslado
                .sucursal_origen
                .nombre,
              traslado
                .sucursal_origen
                .codigo,
              traslado
                .sucursal_destino
                .nombre,
              traslado
                .sucursal_destino
                .codigo,
              traslado.observaciones ??
                '',
              ...traslado.detalles.flatMap(
                (detalle) => [
                  detalle
                    .medicamento
                    .codigo,
                  detalle
                    .medicamento
                    .nombre,
                ],
              ),
            ].some((valor) =>
              valor
                .toLowerCase()
                .includes(texto),
            )

          const coincideEstado =
            filtroEstado ===
              'TODOS' ||
            traslado.estado ===
              filtroEstado

          let coincideTipo =
            true

          if (
            idSucursalUsuario !==
              null &&
            filtroTipo ===
              'SALIENTES'
          ) {
            coincideTipo =
              traslado.id_sucursal_origen ===
              idSucursalUsuario
          }

          if (
            idSucursalUsuario !==
              null &&
            filtroTipo ===
              'ENTRANTES'
          ) {
            coincideTipo =
              traslado.id_sucursal_destino ===
              idSucursalUsuario
          }

          const coincideSucursalOrigen =
            !esAdminSistema ||
            filtroSucursalOrigen ===
              'TODAS' ||
            traslado.id_sucursal_origen ===
              Number(
                filtroSucursalOrigen,
              )

          const fechaTraslado =
            obtenerFechaLocal(
              traslado.fecha_solicitud,
            )

          const coincideFechaDesde =
            !fechaDesde ||
            fechaTraslado >=
              fechaDesde

          const coincideFechaHasta =
            !fechaHasta ||
            fechaTraslado <=
              fechaHasta

          return (
            coincideBusqueda &&
            coincideEstado &&
            coincideTipo &&
            coincideSucursalOrigen &&
            coincideFechaDesde &&
            coincideFechaHasta
          )
        },
      )
    }, [
      trasladosEnAlcance,
      busqueda,
      filtroEstado,
      filtroTipo,
      filtroSucursalOrigen,
      fechaDesde,
      fechaHasta,
      idSucursalUsuario,
      esAdminSistema,
    ])

  const solicitados =
    trasladosEnAlcance.filter(
      (traslado) =>
        traslado.estado ===
        'SOLICITADO',
    ).length

  const enviados =
    trasladosEnAlcance.filter(
      (traslado) =>
        traslado.estado ===
        'ENVIADO',
    ).length

  const recibidos =
    trasladosEnAlcance.filter(
      (traslado) =>
        traslado.estado ===
        'RECIBIDO',
    ).length

  const cancelados =
    trasladosEnAlcance.filter(
      (traslado) =>
        traslado.estado ===
        'CANCELADO',
    ).length

  const refrescarTrasladoSeleccionado =
    async (
      id: number,
    ): Promise<Traslado> => {
      const actualizado =
        await obtenerTraslado(id)

      setTraslados(
        (actuales) =>
          actuales.map((item) =>
            item.id_traslado ===
            id
              ? actualizado
              : item,
          ),
      )

      return actualizado
    }

  const abrirNuevo = () => {
    setTrasladoEditar(null)
    setErrorDialogo('')
    setFormAbierto(true)
  }

  const abrirEditar = (
    traslado: Traslado,
  ) => {
    setTrasladoEditar(
      traslado,
    )
    setErrorDialogo('')
    setFormAbierto(true)
  }

  const guardarTraslado =
    async (
      datos:
        | CrearTraslado
        | ActualizarTraslado,
    ) => {
      setProcesando(true)
      setErrorDialogo('')

      try {
        if (
          trasladoEditar
        ) {
          await actualizarTraslado(
            trasladoEditar.id_traslado,
            datos as ActualizarTraslado,
          )

          setFormAbierto(
            false,
          )

          setTrasladoEditar(
            null,
          )

          await cargarDatos()

          return
        }

        const creado =
          await crearTraslado(
            datos as CrearTraslado,
          )

        setFormAbierto(false)

        await cargarDatos()

        setTrasladoPreparar(
          creado,
        )

        setPrepararAbierto(
          true,
        )
      } catch (
        errorDesconocido: unknown
      ) {
        setErrorDialogo(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo guardar el traslado.',
          ),
        )
      } finally {
        setProcesando(false)
      }
    }

  const abrirPreparar =
    async (
      traslado: Traslado,
    ) => {
      try {
        const actualizado =
          await refrescarTrasladoSeleccionado(
            traslado.id_traslado,
          )

        setTrasladoPreparar(
          actualizado,
        )

        setPrepararAbierto(
          true,
        )
      } catch (
        errorDesconocido: unknown
      ) {
        setError(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo abrir el traslado.',
          ),
        )
      }
    }

  const abrirEnviar =
    async (
      traslado: Traslado,
    ) => {
      setErrorDialogo('')

      try {
        const actualizado =
          await refrescarTrasladoSeleccionado(
            traslado.id_traslado,
          )

        setTrasladoEnviar(
          actualizado,
        )

        setEnviarAbierto(
          true,
        )
      } catch (
        errorDesconocido: unknown
      ) {
        setError(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo abrir el traslado.',
          ),
        )
      }
    }

  const confirmarEnvio =
    async (
      detalles:
        EnviarDetalleTraslado[],
    ) => {
      if (!trasladoEnviar) {
        return
      }

      setProcesando(true)
      setErrorDialogo('')

      try {
        await enviarTraslado(
          trasladoEnviar.id_traslado,
          detalles,
        )

        setEnviarAbierto(
          false,
        )

        setTrasladoEnviar(
          null,
        )

        await cargarDatos()
      } catch (
        errorDesconocido: unknown
      ) {
        setErrorDialogo(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo enviar el traslado.',
          ),
        )
      } finally {
        setProcesando(false)
      }
    }

  const abrirRecibir =
    async (
      traslado: Traslado,
    ) => {
      setErrorDialogo('')

      try {
        const actualizado =
          await refrescarTrasladoSeleccionado(
            traslado.id_traslado,
          )

        setTrasladoRecibir(
          actualizado,
        )

        setRecibirAbierto(
          true,
        )
      } catch (
        errorDesconocido: unknown
      ) {
        setError(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo abrir el traslado.',
          ),
        )
      }
    }

  const confirmarRecepcion =
    async (
      detalles:
        RecibirDetalleTraslado[],
    ) => {
      if (!trasladoRecibir) {
        return
      }

      setProcesando(true)
      setErrorDialogo('')

      try {
        await recibirTraslado(
          trasladoRecibir.id_traslado,
          detalles,
        )

        setRecibirAbierto(
          false,
        )

        setTrasladoRecibir(
          null,
        )

        await cargarDatos()
      } catch (
        errorDesconocido: unknown
      ) {
        setErrorDialogo(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo recibir el traslado.',
          ),
        )
      } finally {
        setProcesando(false)
      }
    }

  const abrirDetalle =
    async (
      traslado: Traslado,
    ) => {
      try {
        const actualizado =
          await refrescarTrasladoSeleccionado(
            traslado.id_traslado,
          )

        setTrasladoDetalle(
          actualizado,
        )

        setDetalleAbierto(
          true,
        )
      } catch (
        errorDesconocido: unknown
      ) {
        setError(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo abrir el detalle.',
          ),
        )
      }
    }

  const solicitarCancelar =
    (
      traslado: Traslado,
    ) => {
      setTrasladoCancelar(
        traslado,
      )

      setCancelarAbierto(
        true,
      )
    }

  const confirmarCancelar =
    async () => {
      if (
        !trasladoCancelar
      ) {
        return
      }

      setProcesando(true)
      setError('')

      try {
        await cancelarTraslado(
          trasladoCancelar.id_traslado,
        )

        setCancelarAbierto(
          false,
        )

        setTrasladoCancelar(
          null,
        )

        await cargarDatos()
      } catch (
        errorDesconocido: unknown
      ) {
        setError(
          obtenerMensajeError(
            errorDesconocido,
            'No se pudo cancelar el traslado.',
          ),
        )
      } finally {
        setProcesando(false)
      }
    }

  const limpiarFiltros =
    () => {
      setBusqueda('')
      setFiltroEstado(
        'TODOS',
      )
      setFiltroTipo(
        'TODOS',
      )
      setFiltroSucursalOrigen(
        'TODAS',
      )
      setFechaDesde('')
      setFechaHasta('')
    }

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3.5,
        },
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={2}
          sx={{
            justifyContent:
              'space-between',
            alignItems: {
              md: 'center',
            },
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems:
                  'center',
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 900,
                }}
              >
                Traslados entre sucursales
              </Typography>

              <Chip
                label={`${trasladosEnAlcance.length} registrados`}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Typography
              sx={{
                mt: 0.5,
                color:
                  'text.secondary',
              }}
            >
              Controla la solicitud, envío y recepción de medicamentos entre las farmacias.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
          >
            <Button
              variant="outlined"
              startIcon={
                <RefreshRoundedIcon />
              }
              onClick={() =>
                void cargarDatos()
              }
              disabled={
                cargando ||
                procesando
              }
            >
              Actualizar
            </Button>

            <Button
              variant="contained"
              startIcon={
                <AddRoundedIcon />
              }
              onClick={abrirNuevo}
              disabled={
                cargando ||
                procesando ||
                idSucursalUsuario ===
                  null
              }
            >
              Nuevo traslado
            </Button>
          </Stack>
        </Stack>

        {cargando && (
          <LinearProgress />
        )}

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {idSucursalUsuario ===
          null &&
          !cargando && (
            <Alert severity="info">
              Tu usuario tiene alcance global y puede consultar todos los traslados, pero el backend exige una sucursal asignada para crear, enviar o recibir un traslado.
            </Alert>
          )}

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2}
          sx={{
            flexWrap: 'wrap',
          }}
        >
          <TarjetaResumen
            titulo="Solicitados"
            valor={solicitados}
            descripcion="Pendientes de preparar o enviar"
            icono={
              <Inventory2RoundedIcon color="warning" />
            }
          />

          <TarjetaResumen
            titulo="Enviados"
            valor={enviados}
            descripcion="En tránsito hacia la sucursal destino"
            icono={
              <LocalShippingRoundedIcon color="info" />
            }
          />

          <TarjetaResumen
            titulo="Recibidos"
            valor={recibidos}
            descripcion="Traslados completados"
            icono={
              <MoveToInboxRoundedIcon color="success" />
            }
          />

          <TarjetaResumen
            titulo="Cancelados"
            valor={cancelados}
            descripcion="Solicitudes anuladas antes del envío"
            icono={
              <CancelRoundedIcon color="error" />
            }
          />
        </Stack>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              direction={{
                xs: 'column',
                lg: 'row',
              }}
              spacing={1.5}
              sx={{
                alignItems: {
                  lg: 'center',
                },
              }}
            >
              <TextField
                size="small"
                placeholder="Buscar por traslado, sucursal, medicamento u observación"
                value={busqueda}
                onChange={(
                  event,
                ) =>
                  setBusqueda(
                    event.target
                      .value,
                  )
                }
                sx={{
                  flex: 1,
                  minWidth: 280,
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <FormControl
                size="small"
                sx={{
                  minWidth: 170,
                }}
              >
                <InputLabel id="filtro-estado-traslado">
                  Estado
                </InputLabel>

                <Select
                  labelId="filtro-estado-traslado"
                  label="Estado"
                  value={
                    filtroEstado
                  }
                  onChange={(
                    event,
                  ) =>
                    setFiltroEstado(
                      event.target
                        .value as FiltroEstado,
                    )
                  }
                >
                  <MenuItem value="TODOS">
                    Todos
                  </MenuItem>

                  <MenuItem value="SOLICITADO">
                    Solicitado
                  </MenuItem>

                  <MenuItem value="ENVIADO">
                    Enviado
                  </MenuItem>

                  <MenuItem value="RECIBIDO">
                    Recibido
                  </MenuItem>

                  <MenuItem value="CANCELADO">
                    Cancelado
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  minWidth: 170,
                }}
                disabled={
                  idSucursalUsuario ===
                  null
                }
              >
                <InputLabel id="filtro-tipo-traslado">
                  Relación
                </InputLabel>

                <Select
                  labelId="filtro-tipo-traslado"
                  label="Relación"
                  value={
                    filtroTipo
                  }
                  onChange={(
                    event,
                  ) =>
                    setFiltroTipo(
                      event.target
                        .value as FiltroTipo,
                    )
                  }
                >
                  <MenuItem value="TODOS">
                    Todos
                  </MenuItem>

                  <MenuItem value="SALIENTES">
                    Salientes
                  </MenuItem>

                  <MenuItem value="ENTRANTES">
                    Entrantes
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                onClick={
                  limpiarFiltros
                }
              >
                Limpiar filtros
              </Button>
            </Stack>

            <Stack
              direction={{
                xs: 'column',
                md: 'row',
              }}
              spacing={1.5}
              sx={{
                mt: 1.5,
                alignItems: {
                  md: 'center',
                },
                flexWrap: 'wrap',
              }}
            >
              {esAdminSistema && (
                <FormControl
                  size="small"
                  sx={{
                    minWidth: 240,
                  }}
                >
                  <InputLabel id="filtro-origen-traslado">
                    Farmacia de origen
                  </InputLabel>

                  <Select
                    labelId="filtro-origen-traslado"
                    label="Farmacia de origen"
                    value={
                      filtroSucursalOrigen
                    }
                    onChange={(
                      event,
                    ) =>
                      setFiltroSucursalOrigen(
                        event
                          .target
                          .value,
                      )
                    }
                  >
                    <MenuItem value="TODAS">
                      Todas las farmacias
                    </MenuItem>

                    {sucursales.map(
                      (
                        sucursal,
                      ) => (
                        <MenuItem
                          key={
                            sucursal.id_sucursal
                          }
                          value={String(
                            sucursal.id_sucursal,
                          )}
                        >
                          {
                            sucursal.nombre
                          }
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              )}

              <TextField
                size="small"
                label="Fecha desde"
                type="date"
                value={
                  fechaDesde
                }
                onChange={(
                  event,
                ) =>
                  setFechaDesde(
                    event.target
                      .value,
                  )
                }
                sx={{
                  minWidth: 180,
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                size="small"
                label="Fecha hasta"
                type="date"
                value={
                  fechaHasta
                }
                onChange={(
                  event,
                ) =>
                  setFechaHasta(
                    event.target
                      .value,
                  )
                }
                sx={{
                  minWidth: 180,
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color:
                  'text.secondary',
              }}
            >
              Mostrando{' '}
              {
                trasladosFiltrados.length
              }{' '}
              de{' '}
              {
                trasladosEnAlcance.length
              }{' '}
              traslados.
            </Typography>
          </CardContent>
        </Card>

        <TrasladosTable
          traslados={
            trasladosFiltrados
          }
          idSucursalUsuario={
            idSucursalUsuario
          }
          pagina={pagina}
          filasPorPagina={
            filasPorPagina
          }
          onCambiarPagina={
            setPagina
          }
          onCambiarFilasPorPagina={(
            filas,
          ) => {
            setFilasPorPagina(
              filas,
            )
            setPagina(0)
          }}
          onVer={
            abrirDetalle
          }
          onEditar={
            abrirEditar
          }
          onPreparar={
            abrirPreparar
          }
          onEnviar={
            abrirEnviar
          }
          onRecibir={
            abrirRecibir
          }
          onCancelar={
            solicitarCancelar
          }
        />
      </Stack>

      <TrasladoFormDialog
        abierto={formAbierto}
        traslado={
          trasladoEditar
        }
        sucursales={
          sucursales
        }
        idSucursalOrigen={
          idSucursalUsuario
        }
        procesando={
          procesando
        }
        error={
          errorDialogo
        }
        onCerrar={() => {
          setFormAbierto(
            false,
          )
          setTrasladoEditar(
            null,
          )
        }}
        onGuardar={
          guardarTraslado
        }
      />

      <PrepararTrasladoDialog
        abierto={
          prepararAbierto
        }
        traslado={
          trasladoPreparar
        }
        medicamentos={
          medicamentos
        }
        onCerrar={() => {
          setPrepararAbierto(
            false,
          )
          setTrasladoPreparar(
            null,
          )
        }}
        onActualizado={
          cargarDatos
        }
      />

      <EnviarTrasladoDialog
        abierto={
          enviarAbierto
        }
        traslado={
          trasladoEnviar
        }
        procesando={
          procesando
        }
        error={
          errorDialogo
        }
        onCerrar={() => {
          setEnviarAbierto(
            false,
          )
          setTrasladoEnviar(
            null,
          )
        }}
        onEnviar={
          confirmarEnvio
        }
      />

      <RecibirTrasladoDialog
        abierto={
          recibirAbierto
        }
        traslado={
          trasladoRecibir
        }
        procesando={
          procesando
        }
        error={
          errorDialogo
        }
        onCerrar={() => {
          setRecibirAbierto(
            false,
          )
          setTrasladoRecibir(
            null,
          )
        }}
        onRecibir={
          confirmarRecepcion
        }
      />

      <TrasladoDetalleDialog
        abierto={
          detalleAbierto
        }
        traslado={
          trasladoDetalle
        }
        onCerrar={() => {
          setDetalleAbierto(
            false,
          )
          setTrasladoDetalle(
            null,
          )
        }}
      />

      <Dialog
        open={
          cancelarAbierto
        }
        onClose={() => {
          if (!procesando) {
            setCancelarAbierto(
              false,
            )
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Cancelar traslado
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Deseas cancelar el traslado #
            {
              trasladoCancelar?.id_traslado
            }
            ? Solo puede cancelarse mientras permanezca en estado SOLICITADO.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setCancelarAbierto(
                false,
              )
            }
            disabled={
              procesando
            }
          >
            Volver
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() =>
              void confirmarCancelar()
            }
            disabled={
              procesando
            }
          >
            Cancelar traslado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}