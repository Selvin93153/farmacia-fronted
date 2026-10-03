import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import StoreRoundedIcon from '@mui/icons-material/StoreRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

import type { Venta } from './ventasService'

interface VentasTableProps {
  ventas: Venta[]
  onAbrirVenta: (venta: Venta) => void
}

function VentasTable({
  ventas,
  onAbrirVenta,
}: VentasTableProps) {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor)
  }

  const formatearFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(fecha))
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Table
        aria-label="Historial de ventas"
        sx={{ minWidth: 1250 }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>
              Venta
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Fecha
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Sucursal
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Caja
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Cajero
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Forma de pago
            </TableCell>

            <TableCell
              align="right"
              sx={{ fontWeight: 700 }}
            >
              Total
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Estado
            </TableCell>

            <TableCell
              align="center"
              sx={{ fontWeight: 700 }}
            >
              Acción
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {ventas.map((venta) => {
            const esBorrador = venta.estado === 'BORRADOR'

            return (
              <TableRow
                key={venta.id_venta}
                hover
                sx={{
                  '&:last-child td, &:last-child th': {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: esBorrador
                          ? 'warning.main'
                          : 'success.main',
                        color: 'common.white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <PointOfSaleRoundedIcon />
                    </Box>

                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        Venta #{venta.id_venta}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {venta.sucursal.codigo}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatearFecha(venta.fecha)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <StoreRoundedIcon
                      fontSize="small"
                      color="action"
                      sx={{ mt: 0.2 }}
                    />

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {venta.sucursal.nombre}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {venta.sucursal.municipio.nombre},{' '}
                        {
                          venta.sucursal.municipio
                            .departamento.nombre
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <PointOfSaleRoundedIcon
                      fontSize="small"
                      color="action"
                    />

                    <Typography variant="body2">
                      {venta.caja.nombre}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <AccountCircleRoundedIcon
                      fontSize="small"
                      color="action"
                    />

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {venta.usuario.nombre}{' '}
                        {venta.usuario.apellido}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {venta.usuario.rol.nombre}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <PaymentsRoundedIcon
                      fontSize="small"
                      color="action"
                    />

                    <Chip
                      label={venta.forma_pago.nombre}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </TableCell>

                <TableCell align="right">
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color:
                        venta.total > 0
                          ? 'text.primary'
                          : 'text.secondary',
                    }}
                  >
                    {formatearMoneda(venta.total)}
                  </Typography>

                  {venta.descuento > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Desc.{' '}
                      {formatearMoneda(venta.descuento)}
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={venta.estado}
                    color={
                      esBorrador ? 'warning' : 'success'
                    }
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>

                <TableCell align="center">
                  <Button
                    variant={
                      esBorrador
                        ? 'contained'
                        : 'outlined'
                    }
                    size="small"
                    startIcon={
                      esBorrador ? (
                        <PlayArrowRoundedIcon />
                      ) : (
                        <VisibilityRoundedIcon />
                      )
                    }
                    onClick={() => onAbrirVenta(venta)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: 110,
                    }}
                  >
                    {esBorrador ? 'Continuar' : 'Ver'}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default VentasTable