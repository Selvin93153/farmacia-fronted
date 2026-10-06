import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
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
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import type { Caja } from '../caja/cajasService'
import type {
  CrearMovimientoCaja,
  TipoMovimientoCaja,
} from './movimientosCajaService'

export interface SucursalMovimientoCajaOpcion {
  id_sucursal: number
  codigo: string
  nombre: string
}

interface MovimientoCajaFormProps {
  abierto: boolean
  idSucursalAsignada: number | null
  sucursales: SucursalMovimientoCajaOpcion[]
  cajas: Caja[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearMovimientoCaja) => Promise<void>
}

interface FormularioMovimientoCaja {
  id_sucursal: string
  id_caja: string
  tipo_movimiento: TipoMovimientoCaja
  concepto: string
  monto: string
}

const formularioInicial: FormularioMovimientoCaja = {
  id_sucursal: '',
  id_caja: '',
  tipo_movimiento: 'INGRESO',
  concepto: '',
  monto: '',
}

function MovimientoCajaForm({
  abierto,
  idSucursalAsignada,
  sucursales,
  cajas,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: MovimientoCajaFormProps) {
  const [formulario, setFormulario] = useState<FormularioMovimientoCaja>(formularioInicial)
  const [errorFormulario, setErrorFormulario] = useState('')

  const cajasActivas = useMemo(() => cajas.filter((caja) => caja.estado === 'ACTIVA'), [cajas])

  // Reinicia el registro y asigna automáticamente la farmacia y su caja única.
  useEffect(() => {
    if (!abierto) return

    const sucursalInicial = idSucursalAsignada?.toString() ?? ''
    const cajasEnSucursal = cajasActivas.filter(
      (caja) => caja.id_sucursal === idSucursalAsignada,
    )

    setFormulario({
      ...formularioInicial,
      id_sucursal: sucursalInicial,
      id_caja: cajasEnSucursal.length === 1 ? String(cajasEnSucursal[0].id_caja) : '',
    })
    setErrorFormulario('')
  }, [abierto, idSucursalAsignada, cajasActivas])

  const cajasDisponibles = useMemo(() => {
    if (!formulario.id_sucursal) return []
    return cajasActivas.filter(
      (caja) => caja.id_sucursal === Number(formulario.id_sucursal),
    )
  }, [cajasActivas, formulario.id_sucursal])

  const cajaSeleccionada = cajasDisponibles.find(
    (caja) => caja.id_caja === Number(formulario.id_caja),
  )

  const cambiarSucursal = (valor: string) => {
    const cajasEnSucursal = cajasActivas.filter((caja) => caja.id_sucursal === Number(valor))

    setFormulario((actual) => ({
      ...actual,
      id_sucursal: valor,
      id_caja: cajasEnSucursal.length === 1 ? String(cajasEnSucursal[0].id_caja) : '',
    }))
  }

  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (!formulario.id_sucursal || !formulario.id_caja || !cajaSeleccionada) {
      setErrorFormulario('Debes seleccionar una sucursal y una caja activa.')
      return
    }

    if (idSucursalAsignada !== null && cajaSeleccionada.id_sucursal !== idSucursalAsignada) {
      setErrorFormulario('La caja no pertenece a tu sucursal.')
      return
    }

    const concepto = formulario.concepto.trim()
    if (!concepto || concepto.length > 250) {
      setErrorFormulario('El concepto es obligatorio y no puede superar 250 caracteres.')
      return
    }

    const valorMonto = formulario.monto.trim()
    const monto = Number(valorMonto)
    if (!/^\d+(\.\d{1,2})?$/.test(valorMonto) || !Number.isFinite(monto) || monto < 0.01) {
      setErrorFormulario('El monto debe ser mayor que cero y tener como máximo dos decimales.')
      return
    }

    await onGuardar({
      id_caja: cajaSeleccionada.id_caja,
      tipo_movimiento: formulario.tipo_movimiento,
      concepto,
      monto,
    })
  }

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>Registrar movimiento de caja</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {(error || errorFormulario) && (
            <Alert severity="error">{errorFormulario || error}</Alert>
          )}

          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
              <BusinessRoundedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Ubicación de la caja</Typography>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth required disabled={guardando || idSucursalAsignada !== null}>
                <InputLabel id="movimiento-caja-sucursal-label">Sucursal</InputLabel>
                <Select
                  labelId="movimiento-caja-sucursal-label"
                  label="Sucursal"
                  value={formulario.id_sucursal}
                  onChange={(event) => cambiarSucursal(event.target.value)}
                >
                  {sucursales.map((sucursal) => (
                    <MenuItem key={sucursal.id_sucursal} value={String(sucursal.id_sucursal)}>
                      {sucursal.codigo} - {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required disabled={guardando || !formulario.id_sucursal}>
                <InputLabel id="movimiento-caja-caja-label">Caja</InputLabel>
                <Select
                  labelId="movimiento-caja-caja-label"
                  label="Caja"
                  value={formulario.id_caja}
                  onChange={(event) => setFormulario((actual) => ({
                    ...actual,
                    id_caja: event.target.value,
                  }))}
                >
                  {cajasDisponibles.map((caja) => (
                    <MenuItem key={caja.id_caja} value={String(caja.id_caja)}>
                      {caja.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            {formulario.id_sucursal && cajasDisponibles.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay cajas activas en esta sucursal. Activa o registra una caja antes de continuar.
              </Alert>
            )}
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
              <AccountBalanceWalletRoundedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Información del movimiento</Typography>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth required disabled={guardando}>
                <InputLabel id="movimiento-caja-tipo-label">Tipo</InputLabel>
                <Select
                  labelId="movimiento-caja-tipo-label"
                  label="Tipo"
                  value={formulario.tipo_movimiento}
                  onChange={(event) => setFormulario((actual) => ({
                    ...actual,
                    tipo_movimiento: event.target.value as TipoMovimientoCaja,
                  }))}
                >
                  <MenuItem value="INGRESO">Ingreso</MenuItem>
                  <MenuItem value="EGRESO">Egreso</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                required
                type="number"
                label="Monto (Q)"
                value={formulario.monto}
                onChange={(event) => setFormulario((actual) => ({
                  ...actual,
                  monto: event.target.value,
                }))}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                disabled={guardando}
              />
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
              <NotesRoundedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Justificación</Typography>
            </Stack>
            <TextField
              label="Concepto"
              placeholder="Ej. retiro para gastos operativos o reintegro de efectivo"
              value={formulario.concepto}
              onChange={(event) => setFormulario((actual) => ({
                ...actual,
                concepto: event.target.value,
              }))}
              multiline
              minRows={3}
              fullWidth
              required
              disabled={guardando}
              slotProps={{ htmlInput: { maxLength: 250 } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Este formulario crea movimientos manuales. Los movimientos asociados a ventas
              se registran desde el proceso de ventas.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={manejarGuardar} disabled={guardando}>
          {guardando ? (
            <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Guardando...</>
          ) : 'Registrar movimiento'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MovimientoCajaForm
