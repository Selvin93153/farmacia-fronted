import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
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
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DraftsRoundedIcon from '@mui/icons-material/DraftsRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PedidoDetalleDialog from './PedidoDetalleDialog'
import PedidoFormDialog from './PedidoFormDialog'
import PedidosTable from './PedidosTable'
import PrepararPedidoDialog from './PrepararPedidoDialog'
import {
  actualizarPedido,
  crearClientePedido,
  crearPedido,
  eliminarPedido,
  obtenerClientesPedido,
  obtenerFormasPagoPedido,
  obtenerMedicamentosPedido,
  obtenerPedidos,
  type CanalPedido,
  type ClientePedido,
  type CrearClientePedido,
  type CrearPedido,
  type FormaPagoPedido,
  type MedicamentoPedido,
  type Pedido,
} from './pedidosService'

type FiltroEstado = 'TODOS' | 'BORRADOR' | 'CONFIRMADO' | 'EN_PREPARACION' | 'EN_ENTREGA' | 'ENTREGADO'
type FiltroCanal = 'TODOS' | CanalPedido

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

interface TarjetaResumenProps {
  titulo: string
  valor: number
  descripcion: string
  icono: ReactNode
}

function TarjetaResumen({ titulo, valor, descripcion, icono }: TarjetaResumenProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, flex: 1, minWidth: 220 }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{titulo}</Typography>
            <Typography variant="h4" sx={{ mt: 0.4, fontWeight: 900 }}>{valor}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{descripcion}</Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icono}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function ControlPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<ClientePedido[]>([])
  const [formasPago, setFormasPago] = useState<FormaPagoPedido[]>([])
  const [medicamentos, setMedicamentos] = useState<MedicamentoPedido[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [errorDialogo, setErrorDialogo] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS')
  const [filtroCanal, setFiltroCanal] = useState<FiltroCanal>('TODOS')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  const [formAbierto, setFormAbierto] = useState(false)
  const [pedidoEditar, setPedidoEditar] = useState<Pedido | null>(null)

  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)

  const [prepararAbierto, setPrepararAbierto] = useState(false)
  const [pedidoPreparar, setPedidoPreparar] = useState<Pedido | null>(null)

  const [eliminarAbierto, setEliminarAbierto] = useState(false)
  const [pedidoEliminar, setPedidoEliminar] = useState<Pedido | null>(null)

  // Carga la información necesaria para administrar pedidos desde una sola vista.
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const [pedidosRecibidos, clientesRecibidos, formasRecibidas, medicamentosRecibidos] = await Promise.all([
        obtenerPedidos(),
        obtenerClientesPedido(),
        obtenerFormasPagoPedido(),
        obtenerMedicamentosPedido(),
      ])

      setPedidos(pedidosRecibidos)
      setClientes(clientesRecibidos)
      setFormasPago(formasRecibidas)
      setMedicamentos(medicamentosRecibidos)
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudieron cargar los pedidos.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  useEffect(() => {
    setPagina(0)
  }, [busqueda, filtroEstado, filtroCanal, filtroSucursal])

  const sucursales = useMemo(() => {
    const mapa = new Map<number, { id_sucursal: number; codigo: string; nombre: string }>()

    pedidos.forEach((pedido) => {
      if (pedido.sucursal_asignada) {
        mapa.set(pedido.sucursal_asignada.id_sucursal, {
          id_sucursal: pedido.sucursal_asignada.id_sucursal,
          codigo: pedido.sucursal_asignada.codigo,
          nombre: pedido.sucursal_asignada.nombre,
        })
      }
    })

    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [pedidos])

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return pedidos.filter((pedido) => {
      const cliente = `${pedido.cliente.nombres} ${pedido.cliente.apellidos ?? ''}`.toLowerCase()
      const sucursal = pedido.sucursal_asignada

      const coincideBusqueda = !texto || [
        String(pedido.id_pedido),
        cliente,
        pedido.cliente.telefono,
        pedido.cliente.correo ?? '',
        pedido.direccion_entrega,
        sucursal?.nombre ?? '',
        sucursal?.codigo ?? '',
      ].some((valor) => valor.toLowerCase().includes(texto))

      const coincideEstado = filtroEstado === 'TODOS' || pedido.estado === filtroEstado
      const coincideCanal = filtroCanal === 'TODOS' || pedido.canal === filtroCanal
      const coincideSucursal = filtroSucursal === 'TODAS'
        || pedido.id_sucursal_asignada === Number(filtroSucursal)

      return coincideBusqueda && coincideEstado && coincideCanal && coincideSucursal
    })
  }, [pedidos, busqueda, filtroEstado, filtroCanal, filtroSucursal])

  const borradores = pedidos.filter((pedido) => pedido.estado === 'BORRADOR').length
  const confirmados = pedidos.filter((pedido) => pedido.estado === 'CONFIRMADO').length
  const enProceso = pedidos.filter(
    (pedido) => pedido.estado === 'EN_PREPARACION' || pedido.estado === 'EN_ENTREGA',
  ).length
  const entregados = pedidos.filter((pedido) => pedido.estado === 'ENTREGADO').length

  const abrirNuevo = () => {
    setPedidoEditar(null)
    setErrorDialogo('')
    setFormAbierto(true)
  }

  const abrirEditar = (pedido: Pedido) => {
    setPedidoEditar(pedido)
    setErrorDialogo('')
    setFormAbierto(true)
  }

  const guardarPedido = async (datos: CrearPedido) => {
    setProcesando(true)
    setErrorDialogo('')

    try {
      if (pedidoEditar) {
        await actualizarPedido(pedidoEditar.id_pedido, datos)
        setFormAbierto(false)
        setPedidoEditar(null)
        await cargarDatos()
        return
      }

      const creado = await crearPedido(datos)
      setFormAbierto(false)
      await cargarDatos()
      setPedidoPreparar(creado)
      setPrepararAbierto(true)
    } catch (errorDesconocido: unknown) {
      setErrorDialogo(obtenerMensajeError(errorDesconocido, 'No se pudo guardar el pedido.'))
    } finally {
      setProcesando(false)
    }
  }

  const registrarCliente = async (datos: CrearClientePedido): Promise<ClientePedido> => {
    try {
      const creado = await crearClientePedido(datos)
      setClientes((actuales) => [...actuales, creado].sort((a, b) => a.nombres.localeCompare(b.nombres)))
      return creado
    } catch (errorDesconocido: unknown) {
      throw new Error(obtenerMensajeError(errorDesconocido, 'No se pudo registrar el cliente.'))
    }
  }

  const abrirDetalle = (pedido: Pedido) => {
    setPedidoDetalle(pedido)
    setDetalleAbierto(true)
  }

  const abrirPreparar = (pedido: Pedido) => {
    setPedidoPreparar(pedido)
    setPrepararAbierto(true)
  }

  const solicitarEliminar = (pedido: Pedido) => {
    setPedidoEliminar(pedido)
    setEliminarAbierto(true)
  }

  const confirmarEliminar = async () => {
    if (!pedidoEliminar) return

    setProcesando(true)
    setError('')

    try {
      await eliminarPedido(pedidoEliminar.id_pedido)
      setEliminarAbierto(false)
      setPedidoEliminar(null)
      await cargarDatos()
    } catch (errorDesconocido: unknown) {
      setError(obtenerMensajeError(errorDesconocido, 'No se pudo eliminar el pedido.'))
    } finally {
      setProcesando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroCanal('TODOS')
    setFiltroSucursal('TODAS')
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>Gestión de pedidos</Typography>
              <Chip label={`${pedidos.length} registrados`} size="small" variant="outlined" />
            </Stack>
            <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
              Registra la solicitud del cliente, agrega medicamentos y selecciona la sucursal más conveniente para despacharla.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void cargarDatos()} disabled={cargando || procesando}>
              Actualizar
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={abrirNuevo} disabled={cargando || procesando}>
              Nuevo pedido
            </Button>
          </Stack>
        </Stack>

        {cargando && <LinearProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
          <TarjetaResumen
            titulo="Borradores"
            valor={borradores}
            descripcion="Pendientes de completar y confirmar"
            icono={<DraftsRoundedIcon color="action" />}
          />
          <TarjetaResumen
            titulo="Confirmados"
            valor={confirmados}
            descripcion="Listos para crear una entrega"
            icono={<AssignmentRoundedIcon color="info" />}
          />
          <TarjetaResumen
            titulo="En proceso"
            valor={enProceso}
            descripcion="Preparación o recorrido de entrega"
            icono={<LocalShippingRoundedIcon color="primary" />}
          />
          <TarjetaResumen
            titulo="Entregados"
            valor={entregados}
            descripcion="Pedidos completados"
            icono={<CheckCircleRoundedIcon color="success" />}
          />
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { lg: 'center' } }}>
              <TextField
                size="small"
                placeholder="Buscar por pedido, cliente, teléfono, dirección o sucursal"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                sx={{ flex: 1, minWidth: 280 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>
                    ),
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="filtro-estado-pedido">Estado</InputLabel>
                <Select
                  labelId="filtro-estado-pedido"
                  label="Estado"
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value as FiltroEstado)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="BORRADOR">Borrador</MenuItem>
                  <MenuItem value="CONFIRMADO">Confirmado</MenuItem>
                  <MenuItem value="EN_PREPARACION">En preparación</MenuItem>
                  <MenuItem value="EN_ENTREGA">En entrega</MenuItem>
                  <MenuItem value="ENTREGADO">Entregado</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 165 }}>
                <InputLabel id="filtro-canal-pedido">Canal</InputLabel>
                <Select
                  labelId="filtro-canal-pedido"
                  label="Canal"
                  value={filtroCanal}
                  onChange={(event) => setFiltroCanal(event.target.value as FiltroCanal)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="CALL_CENTER">Call center</MenuItem>
                  <MenuItem value="PORTAL_WEB">Portal web</MenuItem>
                  <MenuItem value="TELEFONO">Teléfono</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="filtro-sucursal-pedido">Sucursal</InputLabel>
                <Select
                  labelId="filtro-sucursal-pedido"
                  label="Sucursal"
                  value={filtroSucursal}
                  onChange={(event) => setFiltroSucursal(event.target.value)}
                >
                  <MenuItem value="TODAS">Todas</MenuItem>
                  {sucursales.map((sucursal) => (
                    <MenuItem key={sucursal.id_sucursal} value={String(sucursal.id_sucursal)}>
                      {sucursal.codigo} · {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button onClick={limpiarFiltros}>Limpiar filtros</Button>
            </Stack>

            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
              Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos.
            </Typography>
          </CardContent>
        </Card>

        <PedidosTable
          pedidos={pedidosFiltrados}
          pagina={pagina}
          filasPorPagina={filasPorPagina}
          onCambiarPagina={setPagina}
          onCambiarFilasPorPagina={(filas) => {
            setFilasPorPagina(filas)
            setPagina(0)
          }}
          onVer={abrirDetalle}
          onEditar={abrirEditar}
          onPreparar={abrirPreparar}
          onEliminar={solicitarEliminar}
        />
      </Stack>

      <PedidoFormDialog
        abierto={formAbierto}
        pedido={pedidoEditar}
        clientes={clientes}
        formasPago={formasPago}
        procesando={procesando}
        error={errorDialogo}
        onCerrar={() => setFormAbierto(false)}
        onGuardar={guardarPedido}
        onCrearCliente={registrarCliente}
      />

      <PrepararPedidoDialog
        abierto={prepararAbierto}
        pedido={pedidoPreparar}
        medicamentos={medicamentos}
        onCerrar={() => {
          setPrepararAbierto(false)
          setPedidoPreparar(null)
        }}
        onActualizado={cargarDatos}
      />

      <PedidoDetalleDialog
        abierto={detalleAbierto}
        pedido={pedidoDetalle}
        onCerrar={() => {
          setDetalleAbierto(false)
          setPedidoDetalle(null)
        }}
      />

      <Dialog open={eliminarAbierto} onClose={procesando ? undefined : () => setEliminarAbierto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar pedido</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Deseas eliminar el pedido #{pedidoEliminar?.id_pedido}? Esta acción solo es válida mientras permanezca en BORRADOR.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEliminarAbierto(false)} disabled={procesando}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => void confirmarEliminar()} disabled={procesando}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
