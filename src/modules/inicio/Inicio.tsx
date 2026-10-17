import { useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'

import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'

import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'

import {
  obtenerDatosInicio,
  type DatosInicio,
} from './inicioService'

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

function Inicio() {
  const theme = useTheme()

  const [datos, setDatos] = useState<DatosInicio | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Carga la sesión y los indicadores permitidos para el rol autenticado.
  useEffect(() => {
    const cargarInicio = async () => {
      setCargando(true)
      setError('')

      try {
        const datosRecibidos = await obtenerDatosInicio()
        setDatos(datosRecibidos)
      } catch {
        setError(
          'No se pudo cargar la información principal de SIGFAR.',
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarInicio()
  }, [])

  const fechaActual = useMemo(() => {
    const texto = new Intl.DateTimeFormat('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    return texto.charAt(0).toUpperCase() + texto.slice(1)
  }, [])

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography sx={{ color: 'text.secondary' }}>
            Preparando tu panel...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (!datos) {
    return (
      <Alert severity="error">
        {error || 'No se pudo cargar el Inicio.'}
      </Alert>
    )
  }

  const { usuario } = datos

  const nombreCompleto =
    `${usuario.nombre} ${usuario.apellido}`.trim()

  const iniciales =
    `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()

  const nombreRol =
    usuario.rol?.nombre ?? `Rol ${usuario.id_rol}`

  const alcance =
    usuario.id_sucursal === null
      ? 'Alcance nacional'
      : usuario.sucursal?.nombre ??
        `Sucursal ${usuario.id_sucursal}`

  const hayVentas = datos.ventasUltimos7Dias.some(
    (punto) => punto.total > 0,
  )

  const hayFlujo = datos.flujoUltimos7Dias.some(
    (punto) =>
      punto.ingresos > 0 || punto.egresos > 0,
  )

  const totalInventario =
    datos.inventario.normal +
    datos.inventario.bajo +
    datos.inventario.sinStock

  // Datos que alimentan la gráfica circular del estado de inventario.
  const datosGraficaInventario = [
    {
      id: 0,
      value: datos.inventario.normal,
      label: 'Normal',
      color: theme.palette.success.main,
    },
    {
      id: 1,
      value: datos.inventario.bajo,
      label: 'Stock bajo',
      color: theme.palette.warning.main,
    },
    {
      id: 2,
      value: datos.inventario.sinStock,
      label: 'Sin stock',
      color: theme.palette.error.main,
    },
  ]

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}

      {datos.advertencias.map((advertencia) => (
        <Alert key={advertencia} severity="warning">
          {advertencia}
        </Alert>
      ))}

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 2.5, md: 3.5 },
          color: '#ffffff',
          background:
            'linear-gradient(120deg, #0f766e 0%, #0f9f7d 50%, #2563eb 135%)',
          boxShadow: '0 14px 40px rgba(15, 118, 110, 0.16)',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            right: -90,
            top: -120,
            backgroundColor: 'rgba(255,255,255,0.08)',
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          sx={{
            position: 'relative',
            zIndex: 1,
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center' }}
          >
            <Avatar
              sx={{
                width: 62,
                height: 62,
                bgcolor: 'rgba(255,255,255,0.16)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.24)',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              {iniciales}
            </Avatar>

            <Box>
              <Typography
                variant="body2"
                sx={{ opacity: 0.82 }}
              >
                Bienvenido a SIGFAR
              </Typography>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  mt: 0.2,
                  fontWeight: 900,
                  letterSpacing: -0.5,
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
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  label={nombreRol}
                  size="small"
                  sx={{
                    color: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.16)',
                  }}
                />

                <Chip
                  icon={
                    <StorefrontRoundedIcon
                      sx={{ color: '#ffffff !important' }}
                    />
                  }
                  label={alcance}
                  size="small"
                  sx={{
                    color: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          <Box sx={{ textAlign: { md: 'right' } }}>
            <Typography
              variant="body2"
              sx={{ opacity: 0.78 }}
            >
              {fechaActual}
            </Typography>

            <Typography
              variant="caption"
              sx={{ mt: 0.5, display: 'block', opacity: 0.66 }}
            >
              Sesión activa · Información actual del sistema
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {(datos.ventasDisponibles ||
        datos.flujoDisponible ||
        datos.inventarioDisponible) && (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
            }}
          >
            {datos.ventasDisponibles && (
              <IndicadorCompacto
                icono={<PointOfSaleRoundedIcon />}
                titulo="Ventas de hoy"
                valor={formatoMoneda.format(datos.ventasHoy)}
                descripcion="Ventas completadas"
                color={theme.palette.primary.main}
              />
            )}

            {datos.flujoDisponible && (
              <IndicadorCompacto
                icono={<AccountBalanceWalletRoundedIcon />}
                titulo="Flujo neto de hoy"
                valor={formatoMoneda.format(
                  datos.flujoNetoHoy,
                )}
                descripcion="Ingresos menos egresos"
                color={
                  datos.flujoNetoHoy >= 0
                    ? theme.palette.success.main
                    : theme.palette.error.main
                }
              />
            )}

            {datos.inventarioDisponible && (
              <IndicadorCompacto
                icono={<Inventory2RoundedIcon />}
                titulo="Stock crítico"
                valor={String(datos.stockCritico)}
                descripcion="Registros bajos o agotados"
                color={
                  datos.stockCritico > 0
                    ? theme.palette.warning.main
                    : theme.palette.success.main
                }
              />
            )}
          </Box>
        </Paper>
      )}

      {datos.ventasDisponibles && (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            transition:
              'box-shadow 180ms ease, transform 180ms ease',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              mb: 1,
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800 }}
              >
                Ventas de los últimos 7 días
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Comportamiento diario de las ventas completadas.
              </Typography>
            </Box>

            <TrendingUpRoundedIcon
              sx={{ color: 'primary.main' }}
            />
          </Stack>

          {/* Gráfica principal: muestra la tendencia monetaria de ventas por día. */}
          {hayVentas ? (
            <LineChart
              height={320}
              xAxis={[
                {
                  scaleType: 'point',
                  data: datos.ventasUltimos7Dias.map(
                    (punto) => punto.etiqueta,
                  ),
                },
              ]}
              series={[
                {
                  data: datos.ventasUltimos7Dias.map(
                    (punto) => punto.total,
                  ),
                  label: 'Ventas',
                  color: theme.palette.primary.main,
                  valueFormatter: (valor) =>
                    formatoMoneda.format(
                      Number(valor ?? 0),
                    ),
                },
              ]}
              margin={{
                left: 80,
                right: 24,
                top: 30,
                bottom: 30,
              }}
            />
          ) : (
            <EstadoSinDatos
              texto="Todavía no hay ventas completadas en los últimos 7 días."
            />
          )}
        </Paper>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              datos.flujoDisponible &&
              datos.inventarioDisponible
                ? '1.35fr 1fr'
                : '1fr',
          },
          gap: 3,
        }}
      >
        {datos.flujoDisponible && (
          <Paper
            variant="outlined"
            sx={{
              minWidth: 0,
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              transition:
                'box-shadow 180ms ease, transform 180ms ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800 }}
            >
              Ingresos vs. egresos
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 1 }}
            >
              Flujo de efectivo registrado durante la última
              semana.
            </Typography>

            {/* Gráfica financiera: compara ingresos y egresos de caja por día. */}
            {hayFlujo ? (
              <BarChart
                height={300}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: datos.flujoUltimos7Dias.map(
                      (punto) => punto.etiqueta,
                    ),
                  },
                ]}
                series={[
                  {
                    data: datos.flujoUltimos7Dias.map(
                      (punto) => punto.ingresos,
                    ),
                    label: 'Ingresos',
                    color: theme.palette.success.main,
                    valueFormatter: (valor) =>
                      formatoMoneda.format(
                        Number(valor ?? 0),
                      ),
                  },
                  {
                    data: datos.flujoUltimos7Dias.map(
                      (punto) => punto.egresos,
                    ),
                    label: 'Egresos',
                    color: theme.palette.error.main,
                    valueFormatter: (valor) =>
                      formatoMoneda.format(
                        Number(valor ?? 0),
                      ),
                  },
                ]}
                margin={{
                  left: 80,
                  right: 20,
                  top: 30,
                  bottom: 30,
                }}
              />
            ) : (
              <EstadoSinDatos
                texto="Todavía no hay movimientos de efectivo en los últimos 7 días."
              />
            )}
          </Paper>
        )}

        {datos.inventarioDisponible && (
          <Paper
            variant="outlined"
            sx={{
              minWidth: 0,
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              transition:
                'box-shadow 180ms ease, transform 180ms ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800 }}
            >
              Estado del inventario
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 1 }}
            >
              Distribución según los niveles mínimos definidos.
            </Typography>

            {/* Gráfica circular: resume la salud actual de las existencias. */}
            {totalInventario > 0 ? (
              <PieChart
                height={260}
                series={[
                  {
                    data: datosGraficaInventario,
                    innerRadius: 58,
                    outerRadius: 95,
                    paddingAngle: 2,
                    cornerRadius: 4,
                    valueFormatter: (item) =>
                      `${item.value} registros`,
                  },
                ]}
              />
            ) : (
              <EstadoSinDatos
                texto="No hay registros de inventario disponibles para mostrar."
              />
            )}

            {totalInventario > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <LeyendaInventario
                    texto="Normal"
                    valor={datos.inventario.normal}
                    color={theme.palette.success.main}
                  />
                  <LeyendaInventario
                    texto="Stock bajo"
                    valor={datos.inventario.bajo}
                    color={theme.palette.warning.main}
                  />
                  <LeyendaInventario
                    texto="Sin stock"
                    valor={datos.inventario.sinStock}
                    color={theme.palette.error.main}
                  />
                </Stack>
              </>
            )}
          </Paper>
        )}
      </Box>

      {!datos.ventasDisponibles &&
        !datos.flujoDisponible &&
        !datos.inventarioDisponible && (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800 }}
            >
              Tu sesión está lista
            </Typography>

            <Typography
              sx={{ mt: 0.7, color: 'text.secondary' }}
            >
              Este rol no consulta indicadores operativos de
              ventas, caja o inventario desde el Inicio.
            </Typography>
          </Paper>
        )}
    </Stack>
  )
}

interface IndicadorCompactoProps {
  icono: React.ReactNode
  titulo: string
  valor: string
  descripcion: string
  color: string
}

function IndicadorCompacto({
  icono,
  titulo,
  valor,
  descripcion,
  color,
}: IndicadorCompactoProps) {
  return (
    <Stack
      direction="row"
      spacing={1.7}
      sx={{
        p: 2.2,
        minWidth: 0,
        alignItems: 'center',
        borderRight: {
          xs: 0,
          sm: '1px solid',
        },
        borderBottom: {
          xs: '1px solid',
          sm: 0,
        },
        borderColor: 'divider',
        '&:last-of-type': {
          borderRight: 0,
          borderBottom: 0,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          bgcolor: `${color}14`,
        }}
      >
        {icono}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary' }}
        >
          {titulo}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mt: 0.1,
            fontWeight: 900,
            lineHeight: 1.2,
          }}
        >
          {valor}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: 'text.secondary' }}
        >
          {descripcion}
        </Typography>
      </Box>
    </Stack>
  )
}

function EstadoSinDatos({ texto }: { texto: string }) {
  return (
    <Box
      sx={{
        minHeight: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary' }}
      >
        {texto}
      </Typography>
    </Box>
  )
}

interface LeyendaInventarioProps {
  texto: string
  valor: number
  color: string
}

function LeyendaInventario({
  texto,
  valor,
  color,
}: LeyendaInventarioProps) {
  return (
    <Stack
      direction="row"
      spacing={0.8}
      sx={{ alignItems: 'center' }}
    >
      <Box
        sx={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          bgcolor: color,
        }}
      />
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary' }}
      >
        {texto}: {valor}
      </Typography>
    </Stack>
  )
}

export default Inicio
