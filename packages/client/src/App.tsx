import './App.css'
import Pagespeed from './pages/Pagespeed/Pagespeed'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pagespeed />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
