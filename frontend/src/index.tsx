import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import './styles/index.scss'
import './index.css'
import App from './App'
import 'typeface-hind'
import 'typeface-montserrat'
import { QueryClient, QueryClientProvider } from 'react-query'
import { persistQueryClient } from 'react-query/persistQueryClient-experimental'
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5,
    },
  },
})

/*
VERY IMPORTANT: This utility is currently in an experimental stage. This means that breaking changes will happen in minor AND patch releases. Use at your own risk. If you choose to rely on this in production in an experimental stage, please lock your version to a patch-level version to avoid unexpected breakages.
 */
const localStoragePersistor = createWebStoragePersistor({
  storage: window.localStorage,
})
void persistQueryClient({
  queryClient,
  persistor: localStoragePersistor,
})

ReactDOM.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
  document.getElementById('root')
)
