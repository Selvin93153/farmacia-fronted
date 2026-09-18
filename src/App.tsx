import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AppLayout from './layouts/AppLayout'

import Login from './modules/auth/Login'
import RutaProtegida from './modules/auth/RutaProtegida'

import ControlSucursal from './modules/sucursales/ControlSucursal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route element={<RutaProtegida />}>
          <Route
            path="/app"
            element={<AppLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="farmacias"
                  replace
                />
              }
            />

            <Route
              path="farmacias"
              element={<ControlSucursal />}
            />
          </Route>
        </Route>

        <Route
          path="/"
          element={
            <Navigate
              to="/app/farmacias"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App