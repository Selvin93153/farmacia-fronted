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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'

import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import StoreRoundedIcon from '@mui/icons-material/StoreRounded'

import type { Caja } from '../caja/cajasService'
import type { FormaPago } from '../formas-pago/formasPagoService'
import type { CrearVenta } from './ventasService'

interface VentaFormProps {
  abierto: boolean
  cajas: Caja[]
  formasPago: FormaPago[]
  guardando: boolean
  error: string
  onCerrar: () => void
  onGuardar: (datos: CrearVenta) => Promise<void>
}

function VentaForm({
  abierto,
  cajas,
  formasPago,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: VentaFormProps) {
  const [idCaja, setIdCaja] = useState('')
  const [idFormaPago, setIdFormaPago] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')

  const cajasActivas = useMemo(
    () => cajas.filter((caja) => caja.estado === 'ACTIVA'),
    [cajas],
  )

  const formasPagoActivas = useMemo(
    () =>
      formasPago.filter(
        (formaPago) => formaPago.estado === 'ACTIVO',
      ),
    [formasPago],
  )

  const cajaSeleccionada = useMemo(
    () =>
      cajasActivas.find(
        (caja) => caja.id_caja === Number(idCaja),
      ) ?? null,
    [cajasActivas, idCaja],
  )

  // Limpia el formulario cada vez que se inicia una nueva venta.
  useEffect(() => {
    if (!abierto) {
      return
    }

    setIdCaja('')
    setIdFormaPago('')
    setErrorFormulario('')
  }, [abierto])

  // Valida la selección y crea la venta en estado BORRADOR.
  const manejarGuardar = async () => {
    setErrorFormulario('')

    if (!idCaja) {
      setErrorFormulario(
        'Debes seleccionar la caja donde se realizará la venta.',
      )
      return
    }

    if (!idFormaPago) {
      setErrorFormulario(
        'Debes seleccionar una forma de pago.',
      )
      return
    }

    const datos: CrearVenta = {
      id_caja: Number(idCaja),
      id_forma_pago: Number(idFormaPago),
    }

    await onGuardar(datos)
  }

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center' }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PointOfSaleRoundedIcon />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nueva venta
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Inicia una nueva operación de venta.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {(error || errorFormulario) && (
            <Alert severity="error">
              {errorFormulario || error}
            </Alert>
          )}

          {cajasActivas.length === 0 && (
            <Alert severity="warning">
              No existen cajas activas disponibles para
              registrar una venta.
            </Alert>
          )}

          <FormControl
            fullWidth
            required
            disabled={guardando || cajasActivas.length === 0}
          >
            <InputLabel id="caja-venta-label">
              Caja
            </InputLabel>

            <Select
              labelId="caja-venta-label"
              label="Caja"
              value={idCaja}
              onChange={(event) =>
                setIdCaja(event.target.value)
              }
            >
              {cajasActivas.map((caja) => (
                <MenuItem
                  key={caja.id_caja}
                  value={caja.id_caja.toString()}
                >
                  {caja.nombre}
                  {caja.sucursal?.nombre
                    ? ` - ${caja.sucursal.nombre}`
                    : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {cajaSeleccionada && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'action.hover',
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <StoreRoundedIcon color="primary" />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Sucursal de la caja
                  </Typography>

                  <Typography sx={{ fontWeight: 700 }}>
                    {cajaSeleccionada.sucursal?.nombre ??
                      `Sucursal #${cajaSeleccionada.id_sucursal}`}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <FormControl
            fullWidth
            required
            disabled={
              guardando || formasPagoActivas.length === 0
            }
          >
            <InputLabel id="forma-pago-venta-label">
              Forma de pago
            </InputLabel>

            <Select
              labelId="forma-pago-venta-label"
              label="Forma de pago"
              value={idFormaPago}
              onChange={(event) =>
                setIdFormaPago(event.target.value)
              }
            >
              {formasPagoActivas.map((formaPago) => (
                <MenuItem
                  key={formaPago.id_forma_pago}
                  value={formaPago.id_forma_pago.toString()}
                >
                  {formaPago.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Alert
            severity="info"
            icon={<PaymentsRoundedIcon />}
          >
            La venta se creará como borrador. Podrás agregar
            medicamentos, modificar cantidades y aplicar un
            descuento antes de finalizarla.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onCerrar}
          disabled={guardando}
          sx={{ textTransform: 'none' }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={manejarGuardar}
          disabled={
            guardando ||
            cajasActivas.length === 0 ||
            formasPagoActivas.length === 0
          }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {guardando ? (
            <>
              <CircularProgress
                size={20}
                color="inherit"
                sx={{ mr: 1 }}
              />
              Creando...
            </>
          ) : (
            'Iniciar venta'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VentaForm