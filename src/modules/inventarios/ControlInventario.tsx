import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'

import {
  obtenerMedicamentos,
  type Medicamento,
} from '../medicamentos/medicamentosService'

import {
  obtenerSucursales,
  type Sucursal,
} from '../sucursales/sucursalesService'

import InventarioForm from './InventarioForm'
import InventariosTable from './InventariosTable'

import {
  actualizarInventario,
  crearInventario,
  obtenerInventarios,
  type ActualizarInventario,
  type CrearInventario,
  type Inventario,
} from './inventariosService'

type FiltroStock = 'TODOS' | 'NORMAL' | 'BAJO' | 'SIN_STOCK'

function ControlInventario() {
  const [inventarios, setInventarios] = useState<Inventario[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS')
  const [filtroStock, setFiltroStock] = useState<FiltroStock>('TODOS')

  const [formularioAbierto, setFormularioAbierto] = useState(false)

  const [inventarioEditando, setInventarioEditando] =
    useState<Inventario | null>(null)

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

  const cargarDatos = async () => {
    setCargando(true)
    setError('')

    try {
      const [
        inventariosRecibidos,
        sucursalesRecibidas,
        medicamentosRecibidos,
      ] = await Promise.all([
        obtenerInventarios(),
        obtenerSucursales(),
        obtenerMedicamentos(),
      ])

      setInventarios(inventariosRecibidos)
      setSucursales(sucursalesRecibidas)
      setMedicamentos(medicamentosRecibidos)
    } catch (error: unknown) {
      setError(
        obtenerMensajeError(
          error,
          'Ocurrió un error al cargar la información de inventario.',
        ),
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const obtenerNivelStock = (inventario: Inventario): FiltroStock => {
    if (inventario.stock_actual === 0) {
      return 'SIN_STOCK'
    }

    if (inventario.stock_actual <= inventario.stock_minimo) {
      return 'BAJO'
    }

    return 'NORMAL'
  }

  const inventariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return inventarios.filter((inventario) => {
      const nivel = obtenerNivelStock(inventario)

      const coincideSucursal =
        filtroSucursal === 'TODAS' ||
        inventario.id_sucursal === Number(filtroSucursal)

      const coincideStock =
        filtroStock === 'TODOS' || nivel === filtroStock

      const coincideBusqueda =
        texto === '' ||
        inventario.medicamento.codigo.toLowerCase().includes(texto) ||
        inventario.medicamento.nombre.toLowerCase().includes(texto) ||
        inventario.medicamento.principio_activo
          .toLowerCase()
          .includes(texto) ||
        inventario.medicamento.laboratorio
          .toLowerCase()
          .includes(texto) ||
        inventario.sucursal.codigo.toLowerCase().includes(texto) ||
        inventario.sucursal.nombre.toLowerCase().includes(texto)

      return coincideSucursal && coincideStock && coincideBusqueda
    })
  }, [inventarios, busqueda, filtroSucursal, filtroStock])

  const totalRegistros = inventarios.length

  const unidadesDisponibles = inventarios.reduce(
    (total, inventario) => total + inventario.stock_actual,
    0,
  )

  const inventariosBajos = inventarios.filter(
    (inventario) =>
      inventario.stock_actual > 0 &&
      inventario.stock_actual <= inventario.stock_minimo,
  ).length

  const inventariosSinStock = inventarios.filter(
    (inventario) => inventario.stock_actual === 0,
  ).length

  const abrirNuevoInventario = () => {
    setInventarioEditando(null)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const abrirEditarInventario = (inventario: Inventario) => {
    setInventarioEditando(inventario)
    setErrorFormulario('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = () => {
    if (guardando) {
      return
    }

    setFormularioAbierto(false)
    setInventarioEditando(null)
    setErrorFormulario('')
  }

  const guardarInventario = async (
    datos: CrearInventario | ActualizarInventario,
  ) => {
    setGuardando(true)
    setErrorFormulario('')

    try {
      if (inventarioEditando) {
        await actualizarInventario(
          inventarioEditando.id_inventario,
          datos as ActualizarInventario,
        )
      } else {
        await crearInventario(datos as CrearInventario)
      }

      setFormularioAbierto(false)
      setInventarioEditando(null)

      await cargarDatos()
    } catch (error: unknown) {
      setErrorFormulario(
        obtenerMensajeError(
          error,
          inventarioEditando
            ? 'Ocurrió un error al actualizar el inventario.'
            : 'Ocurrió un error al registrar el inventario.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Inventario
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta y controla las existencias de medicamentos por sucursal.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={cargarDatos}
            disabled={cargando}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={abrirNuevoInventario}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Registrar inventario
          </Button>
        </Stack>
      </Stack>

      {cargando && <LinearProgress aria-label="Cargando inventarios" />}

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        <ResumenInventario
          titulo="Registros de inventario"
          valor={totalRegistros}
          icono={<InventoryRoundedIcon />}
          color="primary.main"
        />

        <ResumenInventario
          titulo="Unidades disponibles"
          valor={unidadesDisponibles}
          icono={<ShoppingCartRoundedIcon />}
          color="success.main"
        />

        <ResumenInventario
          titulo="Stock bajo"
          valor={inventariosBajos}
          icono={<WarningAmberRoundedIcon />}
          color="warning.main"
        />

        <ResumenInventario
          titulo="Sin existencias"
          valor={inventariosSinStock}
          icono={<ErrorOutlineRoundedIcon />}
          color="error.main"
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{
              alignItems: {
                xs: 'stretch',
                lg: 'center',
              },
            }}
          >
            <TextField
              placeholder="Buscar medicamento, código, laboratorio o sucursal..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="filtro-sucursal-inventario-label">
                Sucursal
              </InputLabel>

              <Select
                labelId="filtro-sucursal-inventario-label"
                label="Sucursal"
                value={filtroSucursal}
                onChange={(event) =>
                  setFiltroSucursal(event.target.value)
                }
              >
                <MenuItem value="TODAS">Todas las sucursales</MenuItem>

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

            <FormControl sx={{ minWidth: 190 }}>
              <InputLabel id="filtro-stock-inventario-label">
                Nivel de stock
              </InputLabel>

              <Select
                labelId="filtro-stock-inventario-label"
                label="Nivel de stock"
                value={filtroStock}
                onChange={(event) =>
                  setFiltroStock(event.target.value as FiltroStock)
                }
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="NORMAL">Stock normal</MenuItem>
                <MenuItem value="BAJO">Stock bajo</MenuItem>
                <MenuItem value="SIN_STOCK">Sin existencias</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {!cargando && inventariosFiltrados.length > 0 && (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
            }}
          >
            <Typography color="text.secondary">
              Mostrando {inventariosFiltrados.length} de {inventarios.length}{' '}
              registros de inventario.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {filtroSucursal !== 'TODAS' && (
                <Chip
                  label="Sucursal filtrada"
                  size="small"
                  onDelete={() => setFiltroSucursal('TODAS')}
                />
              )}

              {filtroStock !== 'TODOS' && (
                <Chip
                  label={
                    filtroStock === 'NORMAL'
                      ? 'Stock normal'
                      : filtroStock === 'BAJO'
                        ? 'Stock bajo'
                        : 'Sin existencias'
                  }
                  size="small"
                  onDelete={() => setFiltroStock('TODOS')}
                />
              )}
            </Stack>
          </Stack>

          <InventariosTable
            inventarios={inventariosFiltrados}
            onEditar={abrirEditarInventario}
          />
        </>
      )}

      {!cargando && inventariosFiltrados.length === 0 && !error && (
        <Alert severity="info">
          {inventarios.length === 0
            ? 'No hay inventarios registrados.'
            : 'No se encontraron registros que coincidan con los filtros aplicados.'}
        </Alert>
      )}

      <InventarioForm
        abierto={formularioAbierto}
        inventario={inventarioEditando}
        inventarios={inventarios}
        sucursales={sucursales}
        medicamentos={medicamentos}
        guardando={guardando}
        error={errorFormulario}
        onCerrar={cerrarFormulario}
        onGuardar={guardarInventario}
      />
    </Stack>
  )
}

interface ResumenInventarioProps {
  titulo: string
  valor: number
  icono: ReactNode
  color: string
}

function ResumenInventario({
  titulo,
  valor,
  icono,
  color,
}: ResumenInventarioProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        transition: '0.2s',

        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2.5,
              bgcolor: color,
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icono}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {titulo}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {valor}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ControlInventario