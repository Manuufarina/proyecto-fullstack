import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography,
  IconButton, Box, Grid, Checkbox
} from '@mui/material';
import { Add, Edit, Delete, Visibility, CheckCircle, Route } from '@mui/icons-material';
import { getVecinos, getOrdenes, deleteVecino, deleteOrden, completarOrden } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const Home = ({ accessToken }) => {
  const [vecinos, setVecinos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrdenes, setSelectedOrdenes] = useState([]);
  const navigate = useNavigate();

  // Función para cargar datos
  const fetchData = async () => {
    try {
      const vecinosRes = await getVecinos();
      const ordenesRes = await getOrdenes();
      console.log('Datos de vecinos recibidos:', vecinosRes.data);
      console.log('Datos de órdenes recibidos:', ordenesRes.data);
      setVecinos(Array.isArray(vecinosRes.data) ? vecinosRes.data : []);
      setOrdenes(Array.isArray(ordenesRes.data) ? ordenesRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setVecinos([]);
      setOrdenes([]);
    }
  };

  useEffect(() => {
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

  const handleSelectOrden = (id) => {
    if (selectedOrdenes.includes(id)) {
      setSelectedOrdenes(selectedOrdenes.filter((ordenId) => ordenId !== id));
    } else {
      setSelectedOrdenes([...selectedOrdenes, id]);
    }
  };

  const optimizeRoute = async () => {
    if (selectedOrdenes.length === 0) {
      alert('Selecciona al menos una orden para crear la rutina.');
      return;
    }

    // Obtener órdenes seleccionadas
    const ordenesSeleccionadas = ordenes.filter((orden) => selectedOrdenes.includes(orden._id));

    // Obtener coordenadas de cada vecino
    const ordenesConCoordenadas = await Promise.all(ordenesSeleccionadas.map(async (orden) => {
      try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address: orden.vecino.direccion,
            key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          },
        });
        const location = response.data.results[0]?.geometry.location;
        return {
          ...orden,
          lat: location?.lat || 0,
          lng: location?.lng || 0,
        };
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        return { ...orden, lat: 0, lng: 0 };
      }
    }));

    // Algoritmo Nearest Neighbor para optimizar la ruta
    const start = { lat: -34.483663, lng: -58.503339 }; // Centro de San Isidro como punto inicial
    let currentPoint = start;
    const optimizedOrdenes = [];
    const remainingOrdenes = [...ordenesConCoordenadas];

    while (remainingOrdenes.length > 0) {
      let closest = null;
      let closestDistance = Infinity;

      for (const orden of remainingOrdenes) {
        // Si tiene horario específico, priorízalo
        if (orden.horarioEspecifico) {
          optimizedOrdenes.push(orden);
          remainingOrdenes.splice(remainingOrdenes.indexOf(orden), 1);
          continue;
        }

        const distance = Math.sqrt(
          Math.pow(orden.lat - currentPoint.lat, 2) +
          Math.pow(orden.lng - currentPoint.lng, 2)
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = orden;
        }
      }

      if (closest) {
        optimizedOrdenes.push(closest);
        currentPoint = { lat: closest.lat, lng: closest.lng };
        remainingOrdenes.splice(remainingOrdenes.indexOf(closest), 1);
      }
    }

    // Generar PDF de la rutina
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RUTINA DE TRABAJO', 10, 10);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 10, 20);

    const tableData = optimizedOrdenes.map((orden, index) => [
      index + 1,
      orden.numeroOrden,
      orden.vecino.nombre,
      orden.vecino.direccion,
      orden.tipoServicio,
      orden.horarioEspecifico || 'Sin horario específico'
    ]);

    doc.autoTable({
      startY: 30,
      head: [['#', 'Nº Orden', 'Vecino', 'Dirección', 'Servicio', 'Horario']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100] },
      styles: { fontSize: 8 }
    });

    doc.save('rutina_trabajo.pdf');
  };

  const filteredVecinos = vecinos.filter(vecino =>
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
                <TableCell>{vecino.nombre}</TableCell>
                <TableCell>{vecino.direccion}</TableCell>
                <TableCell>{vecino.telefono}</TableCell>
                <TableCell>
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item>
                      <IconButton onClick={() => navigate(`/vecinos/${vecino._id}/editar`)}>
                        <Edit />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Editar</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => handleDeleteVecino(vecino._id)}>
                        <Delete />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Eliminar</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => navigate(`/ordenes/nueva?vecino=${vecino._id}`)}>
                        <Add />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Agregar Orden</Typography>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Órdenes Pendientes o En Curso</Typography>
      <Button
        variant="contained"
        startIcon={<Route />}
        onClick={optimizeRoute}
        sx={{ mb: 2 }}
      >
        Crear Rutina de Trabajo
      </Button>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Seleccionar</TableCell>
              <TableCell>Nº Orden</TableCell>
              <TableCell>Vecino</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenesPendientes.map((orden) => (
              <TableRow key={orden._id} style={{ backgroundColor: '#fff3cd' }}>
                <TableCell>
                  <Checkbox
                    checked={selectedOrdenes.includes(orden._id)}
                    onChange={() => handleSelectOrden(orden._id)}
                  />
                </TableCell>
                <TableCell>{orden.numeroOrden}</TableCell>
                <TableCell>{orden.vecino.nombre}</TableCell>
                <TableCell>{orden.tipoServicio}</TableCell>
                <TableCell>{orden.estado}</TableCell>
                <TableCell>
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item>
                      <IconButton onClick={() => navigate(`/ordenes/${orden._id}`)}>
                        <Visibility />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Ver</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => navigate(`/ordenes/${orden._id}/editar`)}>
                        <Edit />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Editar</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => handleDeleteOrden(orden._id)}>
                        <Delete />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Eliminar</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => handleCompletarOrden(orden._id)}>
                        <CheckCircle />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Completar</Typography>
                    </Grid>
                  </Grid>
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
              <TableRow key={orden._id} style={{ backgroundColor: '#d4edda' }}>
                <TableCell>{orden.numeroOrden}</TableCell>
                <TableCell>{orden.vecino.nombre}</TableCell>
                <TableCell>{orden.tipoServicio}</TableCell>
                <TableCell>{orden.estado}</TableCell>
                <TableCell>
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item>
                      <IconButton onClick={() => navigate(`/ordenes/${orden._id}`)}>
                        <Visibility />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Ver</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => handleDeleteOrden(orden._id)}>
                        <Delete />
                      </IconButton>
                      <Typography variant="caption" display="block" align="center">Eliminar</Typography>
                    </Grid>
                  </Grid>
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