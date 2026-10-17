import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'

import type { DetalleVenta } from './detallesVentaService'
import type { Venta } from '../ventas/ventasService'

interface FacturaVentaDialogProps {
  abierto: boolean
  venta: Venta
  detalles: DetalleVenta[]
  onCerrar: () => void
}

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function escaparHtml(valor: string | number): string {
  return String(valor).replace(
    /[&<>"']/g,
    (caracter) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[caracter] ?? caracter,
  )
}

export default function FacturaVentaDialog({
  abierto,
  venta,
  detalles,
  onCerrar,
}: FacturaVentaDialogProps) {
  const totalUnidades = detalles.reduce(
    (total, detalle) => total + detalle.cantidad,
    0,
  )

  // Abre una versión limpia de la factura y muestra el diálogo de impresión.
  const imprimirFactura = () => {
    const ventana = window.open(
      '',
      '_blank',
      'width=520,height=760',
    )

    if (!ventana) {
      return
    }

    const filas = detalles
      .map(
        (detalle) => `
          <tr>
            <td>
              <strong>${escaparHtml(detalle.medicamento.nombre)}</strong>
              ${
                detalle.medicamento.concentracion
                  ? `<div class="muted">${escaparHtml(
                      detalle.medicamento.concentracion,
                    )}</div>`
                  : ''
              }
            </td>
            <td class="center">${detalle.cantidad}</td>
            <td class="right">${escaparHtml(
              formatoMoneda.format(
                Number(detalle.precio_unitario),
              ),
            )}</td>
            <td class="right">${escaparHtml(
              formatoMoneda.format(Number(detalle.subtotal)),
            )}</td>
          </tr>
        `,
      )
      .join('')

    ventana.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Factura venta ${venta.id_venta}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 24px;
              color: #111827;
              font-family: Arial, Helvetica, sans-serif;
              background: #ffffff;
            }

            .factura {
              width: 100%;
              max-width: 760px;
              margin: 0 auto;
            }

            .encabezado {
              text-align: center;
              margin-bottom: 22px;
            }

            .marca {
              margin: 0;
              font-size: 27px;
              font-weight: 800;
              letter-spacing: 1.2px;
            }

            .sucursal {
              margin-top: 6px;
              font-size: 15px;
              font-weight: 700;
            }

            .muted {
              margin-top: 3px;
              color: #6b7280;
              font-size: 12px;
            }

            .titulo {
              margin: 18px 0 10px;
              padding: 10px 0;
              border-top: 1px solid #d1d5db;
              border-bottom: 1px solid #d1d5db;
              text-align: center;
              font-size: 15px;
              font-weight: 800;
              letter-spacing: 0.5px;
            }

            .datos {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 24px;
              margin-bottom: 18px;
              font-size: 13px;
            }

            .dato-label {
              color: #6b7280;
              font-size: 11px;
              text-transform: uppercase;
            }

            .dato-valor {
              margin-top: 2px;
              font-weight: 700;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th {
              padding: 8px 5px;
              border-bottom: 1px solid #9ca3af;
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
            }

            td {
              padding: 9px 5px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
            }

            .center {
              text-align: center;
            }

            .right {
              text-align: right;
            }

            .totales {
              width: 320px;
              max-width: 100%;
              margin: 18px 0 0 auto;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 5px 0;
              font-size: 13px;
            }

            .total-final {
              margin-top: 5px;
              padding-top: 10px;
              border-top: 2px solid #111827;
              font-size: 18px;
              font-weight: 800;
            }

            .pie {
              margin-top: 30px;
              padding-top: 16px;
              border-top: 1px dashed #9ca3af;
              text-align: center;
              font-size: 12px;
            }

            @media print {
              body {
                padding: 0;
              }

              .factura {
                max-width: none;
              }

              @page {
                margin: 12mm;
              }
            }
          </style>
        </head>
        <body>
          <main class="factura">
            <section class="encabezado">
              <h1 class="marca">SIGFAR</h1>
              <div class="sucursal">
                ${escaparHtml(venta.sucursal.nombre)}
              </div>
              <div class="muted">
                ${escaparHtml(venta.sucursal.direccion)}
              </div>
              <div class="muted">
                Tel. ${escaparHtml(venta.sucursal.telefono)}
              </div>
            </section>

            <div class="titulo">FACTURA DE VENTA</div>

            <section class="datos">
              <div>
                <div class="dato-label">Venta</div>
                <div class="dato-valor">#${venta.id_venta}</div>
              </div>

              <div>
                <div class="dato-label">Fecha</div>
                <div class="dato-valor">
                  ${escaparHtml(formatoFecha.format(new Date(venta.fecha)))}
                </div>
              </div>

              <div>
                <div class="dato-label">Caja</div>
                <div class="dato-valor">
                  ${escaparHtml(venta.caja.nombre)}
                </div>
              </div>

              <div>
                <div class="dato-label">Atendido por</div>
                <div class="dato-valor">
                  ${escaparHtml(
                    `${venta.usuario.nombre} ${venta.usuario.apellido}`,
                  )}
                </div>
              </div>

              <div>
                <div class="dato-label">Forma de pago</div>
                <div class="dato-valor">
                  ${escaparHtml(venta.forma_pago.nombre)}
                </div>
              </div>

              <div>
                <div class="dato-label">Unidades</div>
                <div class="dato-valor">${totalUnidades}</div>
              </div>
            </section>

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="center">Cant.</th>
                  <th class="right">Precio</th>
                  <th class="right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${filas}
              </tbody>
            </table>

            <section class="totales">
              <div class="total-row">
                <span>Subtotal</span>
                <strong>
                  ${escaparHtml(
                    formatoMoneda.format(Number(venta.subtotal)),
                  )}
                </strong>
              </div>

              <div class="total-row">
                <span>Descuento</span>
                <strong>
                  ${escaparHtml(
                    formatoMoneda.format(Number(venta.descuento)),
                  )}
                </strong>
              </div>

              <div class="total-row total-final">
                <span>TOTAL</span>
                <span>
                  ${escaparHtml(
                    formatoMoneda.format(Number(venta.total)),
                  )}
                </span>
              </div>
            </section>

            <footer class="pie">
              <strong>Gracias por su compra.</strong>
              <div class="muted">
                Comprobante generado por SIGFAR.
              </div>
            </footer>
          </main>

          <script>
            window.addEventListener('load', function () {
              window.focus();
              setTimeout(function () {
                window.print();
              }, 250);
            });
          </script>
        </body>
      </html>
    `)

    ventana.document.close()
  }

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 800 }}
        >
          Factura de venta #{venta.id_venta}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Paper
          variant="outlined"
          sx={{
            maxWidth: 520,
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            borderRadius: 2.5,
          }}
        >
          <Stack spacing={2.5}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, letterSpacing: 1 }}
              >
                SIGFAR
              </Typography>

              <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                {venta.sucursal.nombre}
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 0.4, color: 'text.secondary' }}
              >
                {venta.sucursal.direccion}
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                Tel. {venta.sucursal.telefono}
              </Typography>
            </Box>

            <Divider />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between' }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  Venta
                </Typography>
                <Typography sx={{ fontWeight: 800 }}>
                  #{venta.id_venta}
                </Typography>
              </Box>

              <Box sx={{ textAlign: { sm: 'right' } }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  Fecha
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {formatoFecha.format(new Date(venta.fecha))}
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Caja: {venta.caja.nombre}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Atendido por: {venta.usuario.nombre}{' '}
                {venta.usuario.apellido}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Forma de pago: {venta.forma_pago.nombre}
              </Typography>
            </Box>

            <Divider />

            <Stack spacing={1.25}>
              {detalles.map((detalle) => (
                <Stack
                  key={detalle.id_detalle_venta}
                  direction="row"
                  spacing={2}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {detalle.medicamento.nombre}{' '}
                      {detalle.medicamento.concentracion}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {detalle.cantidad} ×{' '}
                      {formatoMoneda.format(
                        Number(detalle.precio_unitario),
                      )}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      whiteSpace: 'nowrap',
                      fontWeight: 800,
                    }}
                  >
                    {formatoMoneda.format(
                      Number(detalle.subtotal),
                    )}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider />

            <Stack spacing={0.8}>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography sx={{ color: 'text.secondary' }}>
                  Subtotal
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {formatoMoneda.format(Number(venta.subtotal))}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography sx={{ color: 'text.secondary' }}>
                  Descuento
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {formatoMoneda.format(Number(venta.descuento))}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900 }}
                >
                  TOTAL
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: 'primary.main' }}
                >
                  {formatoMoneda.format(Number(venta.total))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar}>
          Cerrar
        </Button>

        <Button
          variant="contained"
          startIcon={<PrintRoundedIcon />}
          onClick={imprimirFactura}
        >
          Imprimir factura
        </Button>
      </DialogActions>
    </Dialog>
  )
}
