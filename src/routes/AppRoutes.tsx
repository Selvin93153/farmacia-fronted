import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'

import Login from '../modules/auth/Login'
import Inicio from '../modules/inicio/Inicio'
import Perfil from '../modules/perfil/Perfil'
import ControlSucursal from '../modules/sucursales/ControlSucursal'
import ControlEmpleado from '../modules/empleados/ControlEmpleado'

import PrivateRoute from './PrivateRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="inicio" replace />} />

          <Route path="inicio" element={<Inicio />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="farmacias" element={<ControlSucursal />} />
          <Route path="empleados" element={<ControlEmpleado />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/app/inicio" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes