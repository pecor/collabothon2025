import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home, AddOrder, Fleet, Requirements, Matching, Route as RoutePage, Dashboard, Docs } from '@/pages'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-order" element={<AddOrder />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/route" element={<RoutePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
    </Router>
  )
}

export default App
