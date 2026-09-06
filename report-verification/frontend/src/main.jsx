import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/theme.css'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './routes/routes.jsx'
import { Provider } from 'react-redux'
import store from './app/store.js'
import { ToastContainer } from 'react-toastify'

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <Provider store={store}>
      <RouterProvider router={router}/>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} pauseOnHover />
    </Provider>
  </StrictMode>,
)
