import type { ElementType } from 'react'

import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import StoreRoundedIcon from '@mui/icons-material/StoreRounded'
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'

export type CodigoRol =
  | 'ADMIN_SISTEMA'
  | 'ADMIN_SUCURSAL'
  | 'INVENTARIO'
  | 'RRHH'
  | 'TRABAJADOR_SUCURSAL'

export interface OpcionMenu {
  texto: string
  ruta: string
  icono: ElementType
  roles: CodigoRol[]
}

export interface SeccionMenu {
  titulo: string
  opciones: OpcionMenu[]
}

const TODOS_LOS_ROLES: CodigoRol[] = [
  'ADMIN_SISTEMA',
  'ADMIN_SUCURSAL',
  'INVENTARIO',
  'RRHH',
  'TRABAJADOR_SUCURSAL',
]

export const menuConfig: SeccionMenu[] = [
  {
    titulo: 'General',
    opciones: [
      {
        texto: 'Inicio',
        ruta: '/app/inicio',
        icono: HomeRoundedIcon,
        roles: TODOS_LOS_ROLES,
      },
    ],
  },
  {
    titulo: 'Operación',
    opciones: [
      {
        texto: 'Ventas',
        ruta: '/app/ventas',
        icono: ShoppingCartRoundedIcon,
        roles: [
          'ADMIN_SUCURSAL',
          'TRABAJADOR_SUCURSAL',
        ],
      },
      {
        texto: 'Cajas',
        ruta: '/app/cajas',
        icono: PointOfSaleRoundedIcon,
        roles: ['ADMIN_SUCURSAL'],
      },
      {
        texto: 'Movimientos de Caja',
        ruta: '/app/movimientos-caja',
        icono: AccountBalanceWalletRoundedIcon,
        roles: ['ADMIN_SUCURSAL'],
      },
    ],
  },
  {
    titulo: 'Inventario',
    opciones: [
      {
        texto: 'Medicamentos',
        ruta: '/app/medicamentos',
        icono: MedicationRoundedIcon,
        roles: [
          'ADMIN_SUCURSAL',
          'INVENTARIO',
          'TRABAJADOR_SUCURSAL',
        ],
      },
      {
        texto: 'Inventario',
        ruta: '/app/inventario',
        icono: InventoryRoundedIcon,
        roles: [
          'ADMIN_SUCURSAL',
          'INVENTARIO',
        ],
      },
      {
        texto: 'Movimientos de Inventario',
        ruta: '/app/movimientos-inventario',
        icono: SwapVertRoundedIcon,
        roles: [
          'ADMIN_SUCURSAL',
          'INVENTARIO',
        ],
      },
    ],
  },
  {
    titulo: 'Recursos Humanos',
    opciones: [
      {
        texto: 'Empleados',
        ruta: '/app/empleados',
        icono: BadgeRoundedIcon,
        roles: [
          'ADMIN_SUCURSAL',
          'RRHH',
        ],
      },
      {
        texto: 'Planillas',
        ruta: '/app/planillas',
        icono: ReceiptLongRoundedIcon,
        roles: [
          'ADMIN_SUCURSAL',
          'RRHH',
        ],
      },
    ],
  },


  {
    titulo: 'Usuarios',
    opciones: [
      {
        texto: 'Usuarios',
        ruta: '/app/usuarios',
        icono: BadgeRoundedIcon,
        roles: [
          'ADMIN_SISTEMA',
        ],
      },
    ],
  },
  {
    titulo: 'Administración',
    opciones: [
      {
        texto: 'Sucursales',
        ruta: '/app/farmacias',
        icono: StoreRoundedIcon,
        roles: [
          'ADMIN_SISTEMA',
        ],
      },
    ],
  },
]

// Verifica que el código recibido desde la sesión sea un rol conocido por el frontend.
export function esCodigoRol(
  codigo: string | undefined,
): codigo is CodigoRol {
  return (
    codigo === 'ADMIN_SISTEMA' ||
    codigo === 'ADMIN_SUCURSAL' ||
    codigo === 'INVENTARIO' ||
    codigo === 'RRHH' ||
    codigo === 'TRABAJADOR_SUCURSAL'
  )
}