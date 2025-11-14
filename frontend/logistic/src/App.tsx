import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { AddOrder } from '@/pages/AddOrder'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-order" element={<AddOrder />} />
      </Routes>
    </Router>
  )
}

export default App
