import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVecinos, getOrdenes, deleteVecino, deleteOrden, completarOrden } from '../services/api';
import {
  TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography,
  IconButton, Box
} from '@mui/material';
import { Add, Edit, Delete, Visibility, CheckCircle } from '@mui/icons-material';

const Home = () => {
  const [vecinos, setVecinos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vecinosRes = await getVecinos();
        const ordenesRes = await getOrdenes();
        // Asegurarse de que los datos sean arrays, incluso si la API falla
        setVecinos(Array.isArray(vecinosRes.data) ? vecinosRes.data : []);
        setOrdenes(Array.isArray(ordenesRes.data) ? ordenesRes.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // En caso de error, establecer arrays vacíos
        setVecinos([]);
        setOrdenes([]);
      }
    };
    fetchData();
  }, []);

  const handleDeleteVecino = async (id) => {
    try {
      await deleteVecino(id);
      setVecinos(vecinos.filter((vecino) => vecino._id !== id));
    } catch (error) {
      console.error('Error deleting vecino:', error);
    }
  };

  const handleDeleteOrden = async (id) => {
    try {
      await deleteOrden(id);
      setOrdenes(ordenes.filter((orden) => orden._id !== id));
    } catch (error) {
      console.error('Error deleting orden:', error);
    }
  };

  const handleCompletarOrden = async (id) => {
    try {
      await completarOrden(id);
      setOrdenes(ordenes.map((orden) =>
        orden._id === id ? { ...orden, estado: 'completada' } : orden
      ));
    } catch (error) {
      console.error('Error completing orden:', error);
    }
  };

  const filteredVecinos = Array.isArray(vecinos) ? vecinos.filter(vecino => {
    // Protección contra propiedades indefinidas
    const nombre = vecino.nombre || '';
    const direccion = vecino.direccion || '';
    const telefono = vecino.telefono || '';
    const delegacion = vecino.delegacion || '';
    return (
      nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      telefono.includes(searchTerm) ||
      delegacion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  const filteredOrdenes = Array.isArray(ordenes) ? ordenes.filter((orden) => {
    // Protección contra propiedades indefinidas
    const numeroOrden = orden.numeroOrden ? orden.numeroOrden.toString() : '';
    const vecinoNombre = orden.vecino && orden.vecino.nombre ? orden.vecino.nombre : '';
    const vecinoDireccion = orden.vecino && orden.vecino.direccion ? orden.vecino.direccion : '';
    const vecinoTelefono = orden.vecino && orden.vecino.telefono ? orden.vecino.telefono : '';
    return (
      numeroOrden.includes(searchTerm) ||
      vecinoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vecinoDireccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vecinoTelefono.includes(searchTerm)
    );
  }) : [];

  const ordenesPendientes = filteredOrdenes.filter((orden) => orden.estado !== 'completada');
  const ordenesCompletadas = filteredOrdenes.filter((orden) => orden.estado === 'completada');

  return (
    <Box sx={{ p: 4 }}>
      <img src="/logo-san-isidro.png" alt="Logo San Isidro" style={{ width: '150px', marginBottom: '20px' }} />
      <Typography variant="h4" gutterBottom>Control de Vectores - San Isidro</Typography>
      <TextField
        label="Buscar (nombre, dirección, teléfono, delegación, número de orden)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
      />
      
      <Typography variant="h5" gutterBottom>Vecinos</Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate('/vecinos/nuevo')}
        sx={{ mb: 2 }}
      >
        Nuevo Vecino
      </Button>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVecinos.map((vecino) => (
              <TableRow key={vecino._id}>
                <TableCell>{vecino.nombre || 'Sin nombre'}</TableCell>
                <TableCell>{vecino.direccion || 'Sin dirección'}</TableCell>
                <TableCell>{vecino.telefono || 'Sin teléfono'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/vecinos/${vecino._id}/editar`)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteVecino(vecino._id)}>
                    <Delete />
                  </IconButton>
                  <IconButton onClick={() => navigate(`/ordenes/nueva?vecino=${vecino._id}`)}>
                    <Add />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Órdenes Pendientes o En Curso</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº Orden</TableCell>
              <TableCell>Vecino</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenesPendientes.map((orden) => (
              <TableRow key={orden._id}>
                <TableCell>{orden.numeroOrden || 'Sin número'}</TableCell>
                <TableCell>{orden.vecino && orden.vecino.nombre ? orden.vecino.nombre : 'Sin vecino'}</TableCell>
                <TableCell>{orden.tipoServicio || 'Sin servicio'}</TableCell>
                <TableCell>{orden.estado || 'Sin estado'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/ordenes/${orden._id}`)}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => navigate(`/ordenes/${orden._id}/editar`)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteOrden(orden._id)}>
                    <Delete />
                  </IconButton>
                  <IconButton onClick={() => handleCompletarOrden(orden._id)}>
                    <CheckCircle />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Órdenes Completadas</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº Orden</TableCell>
              <TableCell>Vecino</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenesCompletadas.map((orden) => (
              <TableRow key={orden._id}>
                <TableCell>{orden.numeroOrden || 'Sin número'}</TableCell>
                <TableCell>{orden.vecino && orden.vecino.nombre ? orden.vecino.nombre : 'Sin vecino'}</TableCell>
                <TableCell>{orden.tipoServicio || 'Sin servicio'}</TableCell>
                <TableCell>{orden.estado || 'Sin estado'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/ordenes/${orden._id}`)}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteOrden(orden._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Home;