import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  throw new Error('Falta configurar VITE_API_URL en el frontend')
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
})

export default api