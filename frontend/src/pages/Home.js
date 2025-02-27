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
        setVecinos(vecinosRes.data);
        setOrdenes(ordenesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const filteredVecinos = vecinos.filter((vecino) =>
    vecino.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vecino.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vecino.telefono.includes(searchTerm) ||
    (vecino.delegacion && vecino.delegacion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOrdenes = ordenes.filter((orden) =>
    orden.numeroOrden.toString().includes(searchTerm) ||
    orden.vecino.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    orden.vecino.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    orden.vecino.telefono.includes(searchTerm)
  );

  const ordenesPendientes = filteredOrdenes.filter((orden) => orden.estado !== 'completada');
  const ordenesCompletadas = filteredOrdenes.filter((orden) => orden.estado === 'completada');

  return (
    <Box sx={{ p: 4 }}>
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
                <TableCell>{vecino.nombre}</TableCell>
                <TableCell>{vecino.direccion}</TableCell>
                <TableCell>{vecino.telefono}</TableCell>
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
                <TableCell>{orden.numeroOrden}</TableCell>
                <TableCell>{orden.vecino.nombre}</TableCell>
                <TableCell>{orden.tipoServicio}</TableCell>
                <TableCell>{orden.estado}</TableCell>
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
                <TableCell>{orden.numeroOrden}</TableCell>
                <TableCell>{orden.vecino.nombre}</TableCell>
                <TableCell>{orden.tipoServicio}</TableCell>
                <TableCell>{orden.estado}</TableCell>
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