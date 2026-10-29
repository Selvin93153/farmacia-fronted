import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import {
  Alert,
  Badge,
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
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeliveryDiningRoundedIcon from '@mui/icons-material/DeliveryDiningRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { obtenerSesion } from '../auth/authService'
import { obtenerUsuarios, type Usuario } from '../usuarios/usuariosService'
import EntregaDetalleDialog from './EntregaDetalleDialog'
import EntregasTable from './EntregasTable'
import {
  actualizarEntrega,
  asignarRepartidor,
  completarEntrega,
  crearEntrega,
  iniciarEntrega,
  obtenerEntregas,
  obtenerPedidosParaEntrega,
  type Entrega,
  type EstadoEntrega,
  type PedidoEntrega,
} from './entregasService'

type FiltroEstado = 'TODOS' | EstadoEntrega

type AccionConfirmacion = 'INICIAR' | 'COMPLETAR' | null

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

// Convierte respuestas de error del backend en mensajes claros para la interfaz.
function obtenerMensajeError(error: unknown, predeterminado: string): string {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message
    if (Array.isArray(mensaje)) return mensaje.join(', ')
    if (typeof mensaje === 'string') return mensaje
    if (error.response) return `El backend respondió con error HTTP ${error.response.status}.`
    return 'No se pudo establecer comunicación con el servidor.'
  }

  if (error instanceof Error) return error.message
  return predeterminado
}

function ControlEntregas() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [pedidos, setPedidos] = useState<PedidoEntrega[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [idSucursalSesion, setIdSucursalSesion] = useState<number | null>(null)
  const [puedeCrearEntrega, setPuedeCrearEntrega] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [errorDialogo, setErrorDialogo] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [filtroRepartidor, setFiltroRepartidor] = useState('TODOS')

  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [entregaDetalle, setEntregaDetalle] = useState<Entrega | null>(null)

  const [crearAbierto, setCrearAbierto] = useState(false)
  const [idPedidoNuevo, setIdPedidoNuevo] = useState('')

  const [asignarAbierto, setAsignarAbierto] = useState(false)
  const [entregaAsignar, setEntregaAsignar] = useState<Entrega | null>(null)
  const [idRepartidor, setIdRepartidor] = useState('')

  const [observacionesAbierto, setObservacionesAbierto] = useState(false)
  const [entregaObservaciones, setEntregaObservaciones] = useState<Entrega | null>(null)
  const [observaciones, setObservaciones] = useState('')

  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const [accionConfirmacion, setAccionConfirmacion] = useState<AccionConfirmacion>(null)
  const [entregaConfirmacion, setEntregaConfirmacion] = useState<Entrega | null>(null)

  // Carga entregas, pedidos y usuarios y limita visualmente el alcance de una sesión con sucursal.
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const sesion = await obtenerSesion()
      const idSucursal = sesion.id_sucursal

      // Solo el trabajador de sucursal puede crear nuevas entregas desde esta vista.
      setPuedeCrearEntrega(
        sesion.rol?.codigo === 'TRABAJADOR_SUCURSAL',
      )

      const [entregasRecibidas, pedidosRecibidos, usuariosRecibidos] = await Promise.all([
        obtenerEntregas(),
        obtenerPedidosParaEntrega(),
        obtenerUsuarios(),
      ])

      const entregasAlcance = idSucursal === null
        ? entregasRecibidas
        : entregasRecibidas.filter(
            (entrega) => entrega.pedido.id_sucursal_asignada === idSucursal,
          )

      const pedidosAlcance = idSucursal === null
        ? pedidosRecibidos
        : pedidosRecibidos.filter(
            (pedido) => pedido.id_sucursal_asignada === idSucursal,
          )

      const usuariosAlcance = idSucursal === null
        ? usuariosRecibidos
        : usuariosRecibidos.filter((usuario) => usuario.id_sucursal === idSucursal)

      setEntregas(entregasAlcance)
      setPedidos(pedidosAlcance)
      setUsuarios(usuariosAlcance)
      setIdSucursalSesion(idSucursal)

      if (idSucursal !== null) {
        setFiltroSucursal(String(idSucursal))
      }
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudieron cargar las entregas.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  const sucursales = useMemo(() => {
    const mapa = new Map<number, { id_sucursal: number; codigo: string; nombre: string }>()

    entregas.forEach((entrega) => {
      const sucursal = entrega.pedido.sucursal_asignada
      if (sucursal) {
        mapa.set(sucursal.id_sucursal, {
          id_sucursal: sucursal.id_sucursal,
          codigo: sucursal.codigo,
          nombre: sucursal.nombre,
        })
      }
    })

    pedidos.forEach((pedido) => {
      const sucursal = pedido.sucursal_asignada
      if (sucursal) {
        mapa.set(sucursal.id_sucursal, {
          id_sucursal: sucursal.id_sucursal,
          codigo: sucursal.codigo,
          nombre: sucursal.nombre,
        })
      }
    })

    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [entregas, pedidos])

  const repartidoresFiltro = useMemo(() => {
    const mapa = new Map<number, { id_usuario: number; nombre: string }>()

    entregas.forEach((entrega) => {
      if (entrega.repartidor) {
        mapa.set(entrega.repartidor.id_usuario, {
          id_usuario: entrega.repartidor.id_usuario,
          nombre: `${entrega.repartidor.nombre} ${entrega.repartidor.apellido}`,
        })
      }
    })

    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [entregas])

  const entregasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return entregas.filter((entrega) => {
      const sucursal = entrega.pedido.sucursal_asignada
      const cliente = entrega.pedido.cliente
      const repartidor = entrega.repartidor

      const coincideEstado = filtroEstado === 'TODOS' || entrega.estado === filtroEstado
      const coincideSucursal = filtroSucursal === 'TODAS'
        || entrega.pedido.id_sucursal_asignada === Number(filtroSucursal)
      const coincideRepartidor = filtroRepartidor === 'TODOS'
        || entrega.id_repartidor === Number(filtroRepartidor)

      const coincideBusqueda = !texto || [
        String(entrega.id_entrega),
        String(entrega.id_pedido),
        cliente.nombres,
        cliente.apellidos ?? '',
        cliente.telefono,
        entrega.pedido.direccion_entrega,
        sucursal?.codigo ?? '',
        sucursal?.nombre ?? '',
        repartidor ? `${repartidor.nombre} ${repartidor.apellido}` : '',
      ].some((valor) => valor.toLowerCase().includes(texto))

      return coincideEstado && coincideSucursal && coincideRepartidor && coincideBusqueda
    })
  }, [entregas, busqueda, filtroEstado, filtroSucursal, filtroRepartidor])

  const pedidosDisponibles = useMemo(() => {
    const pedidosConEntrega = new Set(entregas.map((entrega) => entrega.id_pedido))

    return pedidos
      .filter(
        (pedido) => pedido.estado === 'CONFIRMADO' && !pedidosConEntrega.has(pedido.id_pedido),
      )
      .sort((a, b) => b.id_pedido - a.id_pedido)
  }, [pedidos, entregas])

  const repartidoresDisponibles = useMemo(() => {
    if (!entregaAsignar?.pedido.id_sucursal_asignada) return []

    const usuariosSucursal = usuarios.filter(
      (usuario) =>
        usuario.estado === 'ACTIVO'
        && usuario.id_sucursal === entregaAsignar.pedido.id_sucursal_asignada,
    )

    const trabajadoresSucursal = usuariosSucursal.filter(
      (usuario) => usuario.rol?.codigo === 'TRABAJADOR_SUCURSAL',
    )

    return trabajadoresSucursal.length > 0 ? trabajadoresSucursal : usuariosSucursal
  }, [usuarios, entregaAsignar])

  const pendientes = entregas.filter((entrega) => entrega.estado === 'PENDIENTE').length
  const asignadas = entregas.filter((entrega) => entrega.estado === 'ASIGNADA').length
  const enRuta = entregas.filter((entrega) => entrega.estado === 'EN_RUTA').length
  const entregadas = entregas.filter((entrega) => entrega.estado === 'ENTREGADA').length

  const retrasadasEnRuta = entregas.filter((entrega) => {
    if (entrega.estado !== 'EN_RUTA' || !entrega.fecha_salida) return false
    const minutosTranscurridos = (Date.now() - new Date(entrega.fecha_salida).getTime()) / 60000
    return minutosTranscurridos > entrega.tiempo_estimado_min
  }).length

  const abrirDetalle = (entrega: Entrega) => {
    setEntregaDetalle(entrega)
    setDetalleAbierto(true)
  }

  const abrirAsignacion = (entrega: Entrega) => {
    setEntregaAsignar(entrega)
    setIdRepartidor(entrega.id_repartidor ? String(entrega.id_repartidor) : '')
    setErrorDialogo('')
    setAsignarAbierto(true)
  }

  const abrirObservaciones = (entrega: Entrega) => {
    setEntregaObservaciones(entrega)
    setObservaciones(entrega.observaciones ?? '')
    setErrorDialogo('')
    setObservacionesAbierto(true)
  }

  const abrirConfirmacion = (entrega: Entrega, accion: Exclude<AccionConfirmacion, null>) => {
    setEntregaConfirmacion(entrega)
    setAccionConfirmacion(accion)
    setErrorDialogo('')
    setConfirmacionAbierta(true)
  }

  const guardarNuevaEntrega = async () => {
    const idPedido = Number(idPedidoNuevo)
    if (!Number.isInteger(idPedido) || idPedido < 1) {
      setErrorDialogo('Selecciona un pedido confirmado.')
      return
    }

    setProcesando(true)
    setErrorDialogo('')

    try {
      await crearEntrega({ id_pedido: idPedido })
      setCrearAbierto(false)
      setIdPedidoNuevo('')
      await cargarDatos()
    } catch (errorDesconocido: unknown) {
      setErrorDialogo(obtenerMensajeError(errorDesconocido, 'No se pudo crear la entrega.'))
    } finally {
      setProcesando(false)
    }
  }

  const guardarRepartidor = async () => {
    if (!entregaAsignar) return

    const id = Number(idRepartidor)
    if (!Number.isInteger(id) || id < 1) {
      setErrorDialogo('Selecciona un repartidor.')
      return
    }

    setProcesando(true)
    setErrorDialogo('')

    try {
      await asignarRepartidor(entregaAsignar.id_entrega, { id_repartidor: id })
      setAsignarAbierto(false)
      setEntregaAsignar(null)
      setIdRepartidor('')
      await cargarDatos()
    } catch (errorDesconocido: unknown) {
      setErrorDialogo(obtenerMensajeError(errorDesconocido, 'No se pudo asignar el repartidor.'))
    } finally {
      setProcesando(false)
    }
  }

  const guardarObservaciones = async () => {
    if (!entregaObservaciones) return

    setProcesando(true)
    setErrorDialogo('')

    try {
      await actualizarEntrega(entregaObservaciones.id_entrega, { observaciones })
      setObservacionesAbierto(false)
      setEntregaObservaciones(null)
      setObservaciones('')
      await cargarDatos()
    } catch (errorDesconocido: unknown) {
      setErrorDialogo(obtenerMensajeError(errorDesconocido, 'No se pudieron actualizar las observaciones.'))
    } finally {
      setProcesando(false)
    }
  }

  const confirmarAccion = async () => {
    if (!entregaConfirmacion || !accionConfirmacion) return

    setProcesando(true)
    setErrorDialogo('')

    try {
      if (accionConfirmacion === 'INICIAR') {
        await iniciarEntrega(entregaConfirmacion.id_entrega)
      } else {
        await completarEntrega(entregaConfirmacion.id_entrega)
      }

      setConfirmacionAbierta(false)
      setEntregaConfirmacion(null)
      setAccionConfirmacion(null)
      await cargarDatos()
    } catch (errorDesconocido: unknown) {
      setErrorDialogo(obtenerMensajeError(errorDesconocido, 'No se pudo actualizar el estado de la entrega.'))
    } finally {
      setProcesando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroRepartidor('TODOS')
    setFiltroSucursal(idSucursalSesion === null ? 'TODAS' : String(idSucursalSesion))
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
      >
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
              Gestión de entregas
            </Typography>
            <Chip size="small" label={`${entregas.length} registradas`} variant="outlined" />
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Coordina la preparación, asignación, recorrido y entrega final de medicamentos al cliente.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void cargarDatos()}
            disabled={cargando || procesando}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Actualizar
          </Button>
          {puedeCrearEntrega && (
            <Badge
              badgeContent={pedidosDisponibles.length}
              color="warning"
              overlap="rectangular"
              max={99}
            >
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  setIdPedidoNuevo('')
                  setErrorDialogo('')
                  setCrearAbierto(true)
                }}
                disabled={
                  cargando ||
                  procesando ||
                  pedidosDisponibles.length === 0
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Crear entrega
              </Button>
            </Badge>
          )}
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando entregas" />}
      {error && <Alert severity="error">{error}</Alert>}
      {!cargando &&
        puedeCrearEntrega &&
        pedidosDisponibles.length === 0 && (
          <Alert severity="info">
            No hay pedidos confirmados pendientes de crear entrega
            en el alcance actual.
          </Alert>
        )}
      {!cargando && retrasadasEnRuta > 0 && (
        <Alert severity="warning">
          Hay {retrasadasEnRuta} {retrasadasEnRuta === 1 ? 'entrega en ruta que superó' : 'entregas en ruta que superaron'} el tiempo estimado.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <ResumenEntrega
          titulo="Pendientes"
          valor={String(pendientes)}
          detalle="Esperando asignación de repartidor"
          icono={<PendingActionsRoundedIcon />}
          color="warning.main"
        />
        <ResumenEntrega
          titulo="Asignadas"
          valor={String(asignadas)}
          detalle="Listas para iniciar recorrido"
          icono={<AssignmentIndRoundedIcon />}
          color="info.main"
        />
        <ResumenEntrega
          titulo="En ruta"
          valor={String(enRuta)}
          detalle={retrasadasEnRuta > 0 ? `${retrasadasEnRuta} con demora` : 'Sin demoras detectadas'}
          icono={<LocalShippingRoundedIcon />}
          color={retrasadasEnRuta > 0 ? 'error.main' : 'primary.main'}
        />
        <ResumenEntrega
          titulo="Entregadas"
          valor={String(entregadas)}
          detalle="Pedidos completados"
          icono={<CheckCircleRoundedIcon />}
          color="success.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'stretch', lg: 'center' } }}
            >
              <TextField
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por cliente, pedido, dirección, sucursal o repartidor"
                size="small"
                fullWidth
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

              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="filtro-estado-entrega">Estado</InputLabel>
                <Select
                  labelId="filtro-estado-entrega"
                  label="Estado"
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value as FiltroEstado)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="ASIGNADA">Asignada</MenuItem>
                  <MenuItem value="EN_RUTA">En ruta</MenuItem>
                  <MenuItem value="ENTREGADA">Entregada</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }} disabled={idSucursalSesion !== null}>
                <InputLabel id="filtro-sucursal-entrega">Sucursal</InputLabel>
                <Select
                  labelId="filtro-sucursal-entrega"
                  label="Sucursal"
                  value={filtroSucursal}
                  onChange={(event) => setFiltroSucursal(String(event.target.value))}
                >
                  {idSucursalSesion === null && <MenuItem value="TODAS">Todas</MenuItem>}
                  {sucursales.map((sucursal) => (
                    <MenuItem key={sucursal.id_sucursal} value={String(sucursal.id_sucursal)}>
                      {sucursal.codigo} · {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="filtro-repartidor-entrega">Repartidor</InputLabel>
                <Select
                  labelId="filtro-repartidor-entrega"
                  label="Repartidor"
                  value={filtroRepartidor}
                  onChange={(event) => setFiltroRepartidor(String(event.target.value))}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  {repartidoresFiltro.map((repartidor) => (
                    <MenuItem key={repartidor.id_usuario} value={String(repartidor.id_usuario)}>
                      {repartidor.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="text"
                onClick={limpiarFiltros}
                sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Limpiar filtros
              </Button>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <Typography variant="body2" color="text.secondary">
                Mostrando {entregasFiltradas.length} de {entregas.length} entregas.
              </Typography>
              <Chip
                size="small"
                icon={<DeliveryDiningRoundedIcon />}
                label="Seguimiento logístico"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <EntregasTable
        entregas={entregasFiltradas}
        cargando={cargando}
        onVerDetalle={abrirDetalle}
        onAsignarRepartidor={abrirAsignacion}
        onEditarObservaciones={abrirObservaciones}
        onIniciar={(entrega) => abrirConfirmacion(entrega, 'INICIAR')}
        onCompletar={(entrega) => abrirConfirmacion(entrega, 'COMPLETAR')}
      />

      <EntregaDetalleDialog
        abierto={detalleAbierto}
        entrega={entregaDetalle}
        onCerrar={() => {
          setDetalleAbierto(false)
          setEntregaDetalle(null)
        }}
      />

      <Dialog open={crearAbierto} onClose={() => !procesando && setCrearAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Crear entrega</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorDialogo && <Alert severity="error">{errorDialogo}</Alert>}
            <Alert severity="info">
              Al crear la entrega, el backend descontará automáticamente del inventario los medicamentos del pedido.
            </Alert>
            <FormControl fullWidth>
              <InputLabel id="pedido-nueva-entrega">Pedido confirmado</InputLabel>
              <Select
                labelId="pedido-nueva-entrega"
                label="Pedido confirmado"
                value={idPedidoNuevo}
                onChange={(event) => setIdPedidoNuevo(String(event.target.value))}
              >
                {pedidosDisponibles.map((pedido) => (
                  <MenuItem key={pedido.id_pedido} value={String(pedido.id_pedido)}>
                    Pedido #{pedido.id_pedido} · {pedido.cliente.nombres} {pedido.cliente.apellidos ?? ''} · {formatoMoneda.format(Number(pedido.total))}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {idPedidoNuevo && (() => {
              const pedido = pedidosDisponibles.find(
                (item) => item.id_pedido === Number(idPedidoNuevo),
              )
              if (!pedido) return null

              return (
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'action.hover' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {pedido.sucursal_asignada?.nombre ?? 'Sin sucursal'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pedido.direccion_entrega}
                  </Typography>
                </Box>
              )
            })()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCrearAbierto(false)} disabled={procesando} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void guardarNuevaEntrega()}
            disabled={procesando || !idPedidoNuevo}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Crear entrega
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={asignarAbierto} onClose={() => !procesando && setAsignarAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {entregaAsignar?.id_repartidor ? 'Cambiar repartidor' : 'Asignar repartidor'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorDialogo && <Alert severity="error">{errorDialogo}</Alert>}
            {entregaAsignar && (
              <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'action.hover' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Entrega #{entregaAsignar.id_entrega} · Pedido #{entregaAsignar.id_pedido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {entregaAsignar.pedido.sucursal_asignada?.nombre ?? 'Sin sucursal asignada'}
                </Typography>
              </Box>
            )}

            {repartidoresDisponibles.length === 0 ? (
              <Alert severity="warning">
                No hay usuarios activos disponibles en la sucursal para asignarlos como repartidor.
              </Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel id="repartidor-entrega">Repartidor</InputLabel>
                <Select
                  labelId="repartidor-entrega"
                  label="Repartidor"
                  value={idRepartidor}
                  onChange={(event) => setIdRepartidor(String(event.target.value))}
                >
                  {repartidoresDisponibles.map((usuario) => (
                    <MenuItem key={usuario.id_usuario} value={String(usuario.id_usuario)}>
                      {usuario.nombre} {usuario.apellido} · {usuario.rol?.nombre ?? 'Usuario'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAsignarAbierto(false)} disabled={procesando} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void guardarRepartidor()}
            disabled={procesando || !idRepartidor || repartidoresDisponibles.length === 0}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Guardar asignación
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={observacionesAbierto}
        onClose={() => !procesando && setObservacionesAbierto(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Observaciones de la entrega</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorDialogo && <Alert severity="error">{errorDialogo}</Alert>}
            <TextField
              label="Observaciones"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              multiline
              minRows={4}
              fullWidth
              helperText={`${observaciones.length}/500 caracteres`}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setObservacionesAbierto(false)} disabled={procesando} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void guardarObservaciones()}
            disabled={procesando}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmacionAbierta}
        onClose={() => !procesando && setConfirmacionAbierta(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {accionConfirmacion === 'INICIAR' ? 'Iniciar entrega' : 'Completar entrega'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorDialogo && <Alert severity="error">{errorDialogo}</Alert>}
            <Typography variant="body2" color="text.secondary">
              {accionConfirmacion === 'INICIAR'
                ? `La entrega #${entregaConfirmacion?.id_entrega ?? ''} pasará a EN RUTA y se registrará la hora de salida.`
                : `La entrega #${entregaConfirmacion?.id_entrega ?? ''} se marcará como ENTREGADA y el pedido quedará completado.`}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmacionAbierta(false)} disabled={procesando} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={accionConfirmacion === 'COMPLETAR' ? 'success' : 'primary'}
            onClick={() => void confirmarAccion()}
            disabled={procesando}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {accionConfirmacion === 'INICIAR' ? 'Iniciar recorrido' : 'Confirmar entrega'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

interface ResumenEntregaProps {
  titulo: string
  valor: string
  detalle: string
  icono: ReactNode
  color: string
}

function ResumenEntrega({ titulo, valor, detalle, icono, color }: ResumenEntregaProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {titulo}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>
              {valor}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color,
              backgroundColor: 'action.hover',
            }}
          >
            {icono}
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          {detalle}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ControlEntregas
