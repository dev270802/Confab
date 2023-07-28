import './App.css'
import PrivateRoute from './components/PrivateRoute'
import Room from './pages/Room'
import Login from './pages/Login'
import RegisterPage from './pages/RegisterPage'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/register' element={<RegisterPage/>}/>
          <Route element={<PrivateRoute/>}>
            <Route path='chat' element={<Room/>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
