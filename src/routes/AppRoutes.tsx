import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'

import Login from '../modules/auth/Login'
import Inicio from '../modules/inicio/Inicio'
import Perfil from '../modules/perfil/Perfil'
import ControlSucursal from '../modules/sucursales/ControlSucursal'
import ControlEmpleado from '../modules/empleados/ControlEmpleado'
import ControlMedicamento from '../modules/medicamentos/ControlMedicamento'
import ControlInventario from '../modules/inventarios/ControlInventario'
import ControlMovimientoInventario from '../modules/movimientos-inventario/ControlMovimientoInventario'
import ControlPlanilla from '../modules/planillas/ControlPlanilla'
import ControlDetallePlanilla from '../modules/detalles-planilla/ControlDetallePlanilla'
import ControlCaja from '../modules/caja/ControlCaja'
import ControlVenta from '../modules/ventas/ControlVenta'
import ControlVentasRealizadas from '../modules/ventas/ControlVentasRealizadas'
import ControlDetalleVenta from '../modules/detalles-venta/ControlDetalleVenta'
import ControlUsuario from '../modules/usuarios/ControlUsuario'
import ControlMovimientoCaja from '../modules/movimientos-caja/ControlMovimientoCaja'
import ControlActivoFijo from '../modules/activos-fijos/ControlActivoFijo'
import ControlAuditoriaEfectivo from '../modules/auditoria-efectivo/ControlAuditoriaEfectivo'
import ControlEntregas from '../modules/entregas/ControlEntregas'
import ControlPedidos from '../modules/pedidos/ControlPedidos'
import ControlTranslado from '../modules/traslados/ControlTraslados'

import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="inicio" replace />} />



          <Route
            path="inicio"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SISTEMA',
                  'ADMIN_SUCURSAL',
                  'INVENTARIO',
                  'RRHH',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <Inicio />
              </RoleRoute>
            }
          />




          <Route
            path="perfil"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SISTEMA',
                  'ADMIN_SUCURSAL',
                  'INVENTARIO',
                  'RRHH',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <Perfil />
              </RoleRoute>
            }
          />



          <Route
            path="farmacias"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SISTEMA',
                ]}
              >
                <ControlSucursal />
              </RoleRoute>
            }
          />



          <Route
            path="empleados"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'RRHH',
                ]}
              >
                <ControlEmpleado />
              </RoleRoute>
            }
          />



          <Route
            path="medicamentos"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'INVENTARIO',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <ControlMedicamento />
              </RoleRoute>
            }
          />



          <Route
            path="inventario"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'INVENTARIO',
                ]}
              >
                <ControlInventario />
              </RoleRoute>
            }
          />



          <Route
            path="movimientos-inventario"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'INVENTARIO',
                  'ADMIN_SISTEMA',
                ]}
              >
                <ControlMovimientoInventario />
              </RoleRoute>
            }
          />



          <Route
            path="planillas"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'RRHH',
                ]}
              >
                <ControlPlanilla />
              </RoleRoute>
            }
          />



          <Route
            path="planillas/:id/detalle"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'RRHH',
                ]}
              >
                <ControlDetallePlanilla />
              </RoleRoute>
            }
          />



          <Route
            path="cajas"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                ]}
              >
                <ControlCaja />
              </RoleRoute>
            }
          />



          <Route
            path="ventas"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <ControlVenta />
              </RoleRoute>
            }
          />



          <Route
            path="ventas/realizadas"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <ControlVentasRealizadas />
              </RoleRoute>
            }
          />



          <Route
            path="ventas/:id/detalle"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <ControlDetalleVenta />
              </RoleRoute>
            }
          />



          <Route
            path="usuarios"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SISTEMA',
                  'ADMIN_SUCURSAL'
                ]}
              >
                <ControlUsuario />
              </RoleRoute>
            }
          />



          <Route
            path="movimientos-caja"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                   'ADMIN_SISTEMA'
                ]}
              >
                <ControlMovimientoCaja />
              </RoleRoute>
            }
          />



          <Route
            path="activos-fijos"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',  'ADMIN_SISTEMA',
                  
                ]}
              >
                <ControlActivoFijo />
              </RoleRoute>
            }
          />



          <Route
            path="auditoria-efectivo"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SISTEMA',
                  'ADMIN_SUCURSAL',
                ]}
              >
                <ControlAuditoriaEfectivo />
              </RoleRoute>
            }
          />



          <Route
            path="entregas"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <ControlEntregas />
              </RoleRoute>
            }
          />



          <Route
            path="pedidos"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'TRABAJADOR_SUCURSAL',
                ]}
              >
                <ControlPedidos />
              </RoleRoute>
            }
          />



          <Route
            path="traslados"
            element={
              <RoleRoute
                rolesPermitidos={[
                  'ADMIN_SUCURSAL',
                  'INVENTARIO',
                  'ADMIN_SISTEMA'
                ]}
              >
                <ControlTranslado />
              </RoleRoute>
            }
          />
        </Route>
      </Route>



      <Route
        path="/"
        element={<Navigate to="/app/inicio" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default AppRoutes

