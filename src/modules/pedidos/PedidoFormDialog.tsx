import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
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
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import MapaEntregaPedido from '../pedidos/MapaEntregaPedido'
import type {
  CanalPedido,
  ClientePedido,
  CrearClientePedido,
  CrearPedido,
  FormaPagoPedido,
  Pedido,
} from './pedidosService'

interface PedidoFormDialogProps {
  abierto: boolean
  pedido: Pedido | null
  clientes: ClientePedido[]
  formasPago: FormaPagoPedido[]
  procesando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearPedido) => Promise<void>
  onCrearCliente: (datos: CrearClientePedido) => Promise<ClientePedido>
}

const canales: { valor: CanalPedido; texto: string }[] = [
  { valor: 'CALL_CENTER', texto: 'Call center' },
  { valor: 'PORTAL_WEB', texto: 'Portal web' },
  { valor: 'TELEFONO', texto: 'Teléfono' },
]

function nombreCliente(cliente: ClientePedido): string {
  return `${cliente.nombres} ${cliente.apellidos ?? ''}`.trim()
}

export default function PedidoFormDialog({
  abierto,
  pedido,
  clientes,
  formasPago,
  procesando,
  error,
  onCerrar,
  onGuardar,
  onCrearCliente,
}: PedidoFormDialogProps) {
  const [idCliente, setIdCliente] = useState<number | null>(null)
  const [idFormaPago, setIdFormaPago] = useState<number | ''>('')
  const [direccionEntrega, setDireccionEntrega] = useState('')
  const [latitudEntrega, setLatitudEntrega] = useState('')
  const [longitudEntrega, setLongitudEntrega] = useState('')
  const [canal, setCanal] = useState<CanalPedido>('TELEFONO')

  const [clienteAbierto, setClienteAbierto] = useState(false)
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [errorCliente, setErrorCliente] = useState('')

  useEffect(() => {
    if (!abierto) return

    setIdCliente(pedido?.id_cliente ?? null)
    setIdFormaPago(pedido?.id_forma_pago ?? '')
    setDireccionEntrega(pedido?.direccion_entrega ?? '')
    setLatitudEntrega(pedido?.latitud_entrega ?? '')
    setLongitudEntrega(pedido?.longitud_entrega ?? '')
    setCanal((pedido?.canal as CanalPedido | undefined) ?? 'TELEFONO')
  }, [abierto, pedido])

  const clienteSeleccionado = useMemo(
    () => clientes.find((cliente) => cliente.id_cliente === idCliente) ?? null,
    [clientes, idCliente],
  )

  const formularioValido = Boolean(
    idCliente
      && direccionEntrega.trim()
      && latitudEntrega.trim()
      && longitudEntrega.trim(),
  )

  const guardar = async () => {
    if (!idCliente || !formularioValido) return

    await onGuardar({
      id_cliente: idCliente,
      ...(idFormaPago !== '' ? { id_forma_pago: Number(idFormaPago) } : {}),
      direccion_entrega: direccionEntrega.trim(),
      latitud_entrega: latitudEntrega.trim(),
      longitud_entrega: longitudEntrega.trim(),
      canal,
    })
  }

  const registrarCliente = async () => {
    setErrorCliente('')

    if (!nombres.trim() || !telefono.trim()) {
      setErrorCliente('Los nombres y el teléfono son obligatorios.')
      return
    }

    try {
      const creado = await onCrearCliente({
        nombres: nombres.trim(),
        ...(apellidos.trim() ? { apellidos: apellidos.trim() } : {}),
        telefono: telefono.trim(),
        ...(correo.trim() ? { correo: correo.trim() } : {}),
      })

      setIdCliente(creado.id_cliente)
      setClienteAbierto(false)
      setNombres('')
      setApellidos('')
      setTelefono('')
      setCorreo('')
    } catch (errorDesconocido) {
      setErrorCliente(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : 'No se pudo registrar el cliente.',
      )
    }
  }

  return (
    <>
      <Dialog open={abierto} onClose={procesando ? undefined : onCerrar} fullWidth maxWidth="md">
        <DialogTitle>{pedido ? `Editar pedido #${pedido.id_pedido}` : 'Nuevo pedido'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Cliente
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'stretch' }}>
                <Autocomplete
                  fullWidth
                  options={clientes}
                  value={clienteSeleccionado}
                  getOptionLabel={nombreCliente}
                  isOptionEqualToValue={(option, value) => option.id_cliente === value.id_cliente}
                  onChange={(_, valor) => setIdCliente(valor?.id_cliente ?? null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      placeholder="Buscar cliente"
                      required
                    />
                  )}
                  renderOption={(props, cliente) => (
                    <li {...props} key={cliente.id_cliente}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {nombreCliente(cliente)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {cliente.telefono}{cliente.correo ? ` · ${cliente.correo}` : ''}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />

                <Button
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setClienteAbierto(true)}
                  sx={{ minWidth: 170 }}
                >
                  Nuevo cliente
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Datos del pedido
              </Typography>

              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="canal-pedido-label">Canal</InputLabel>
                    <Select
                      labelId="canal-pedido-label"
                      label="Canal"
                      value={canal}
                      onChange={(event) => setCanal(event.target.value as CanalPedido)}
                    >
                      {canales.map((item) => (
                        <MenuItem key={item.valor} value={item.valor}>
                          {item.texto}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="forma-pago-pedido-label">Forma de pago</InputLabel>
                    <Select
                      labelId="forma-pago-pedido-label"
                      label="Forma de pago"
                      value={idFormaPago}
                  onChange={(event) => {
  const valor = String(event.target.value)
  setIdFormaPago(valor === '' ? '' : Number(valor))
}}
                    >
                      <MenuItem value="">Pendiente de seleccionar</MenuItem>
                      {formasPago
                        .filter((forma) => !forma.estado || forma.estado === 'ACTIVO')
                        .map((forma) => (
                          <MenuItem key={forma.id_forma_pago} value={forma.id_forma_pago}>
                            {forma.nombre}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>

                <TextField
                  label="Dirección de entrega"
                  value={direccionEntrega}
                  onChange={(event) => setDireccionEntrega(event.target.value)}
                  required
                  fullWidth
                  multiline
                  minRows={2}
                  slotProps={{ htmlInput: { maxLength: 300 } }}
                />

                <MapaEntregaPedido
                  latitud={latitudEntrega}
                  longitud={longitudEntrega}
                  onSeleccionar={(latitud, longitud) => {
                    setLatitudEntrega(latitud)
                    setLongitudEntrega(longitud)
                  }}
                />

                <Alert severity="info" variant="outlined">
                  La ubicación seleccionada se utiliza para ordenar las sucursales por distancia y calcular el tiempo estimado de entrega.
                </Alert>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCerrar} disabled={procesando}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => void guardar()}
            disabled={procesando || !formularioValido}
          >
            {pedido ? 'Guardar cambios' : 'Crear pedido'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clienteAbierto} onClose={procesando ? undefined : () => setClienteAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Registrar cliente</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {errorCliente && <Alert severity="error">{errorCliente}</Alert>}
            <TextField label="Nombres" value={nombres} onChange={(event) => setNombres(event.target.value)} required />
            <TextField label="Apellidos" value={apellidos} onChange={(event) => setApellidos(event.target.value)} />
            <TextField label="Teléfono" value={telefono} onChange={(event) => setTelefono(event.target.value)} required />
            <TextField label="Correo" type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClienteAbierto(false)} disabled={procesando}>Cancelar</Button>
          <Button variant="contained" onClick={() => void registrarCliente()} disabled={procesando}>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
