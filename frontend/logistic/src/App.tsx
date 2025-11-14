import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { AddOrder } from '@/pages/AddOrder'
import { Fleet } from '@/pages/Fleet'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-order" element={<AddOrder />} />
        <Route path="/fleet" element={<Fleet />} />
      </Routes>
    </Router>
  )
}

export default App
