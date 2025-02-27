import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NuevoVecino from './pages/NuevoVecino';
import EditarVecino from './pages/EditarVecino';
import NuevaOrden from './pages/NuevaOrden';
import EditarOrden from './pages/EditarOrden';
import DetalleOrden from './pages/DetalleOrden';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vecinos/nuevo" element={<NuevoVecino />} />
        <Route path="/vecinos/:id/editar" element={<EditarVecino />} />
        <Route path="/ordenes/nueva" element={<NuevaOrden />} />
        <Route path="/ordenes/:id" element={<DetalleOrden />} />
        <Route path="/ordenes/:id/editar" element={<EditarOrden />} />
      </Routes>
    </Router>
  );
}

export default App;
