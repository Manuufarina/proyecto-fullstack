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
            address: `${orden.vecino.direccion}, San Isidro, Buenos Aires, Argentina`,
            key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          },
        });
        console.log(`Respuesta de geocodificación para ${orden.vecino.direccion}:`, response.data);
        if (response.data.status !== 'OK' || !response.data.results[0]) {
          throw new Error(`No se encontraron coordenadas para ${orden.vecino.direccion}`);
        }
        const location = response.data.results[0].geometry.location;
        return {
          ...orden,
          lat: location.lat,
          lng: location.lng,
        };
      } catch (error) {
        console.error(`Error fetching coordinates for ${orden.vecino.direccion}:`, error.message);
        return { ...orden, lat: -34.483663, lng: -58.503339 }; // Usar punto inicial si falla
      }
    }));

    // Verificar si hay coordenadas válidas
    if (ordenesConCoordenadas.every(orden => orden.lat === -34.483663 && orden.lng === -58.503339)) {
      alert('No se pudieron obtener coordenadas válidas para las direcciones. Por favor, verifica las direcciones.');
      return;
    }

    // Algoritmo Nearest Neighbor para optimizar la ruta
    const start = { lat: -34.483663, lng: -58.503339 }; // Av. Fondo de la Legua 240, Martínez, San Isidro
    let currentPoint = start;
    const optimizedOrdenes = [];
    const remainingOrdenes = [...ordenesConCoordenadas];

    // Primero, manejar órdenes con horario específico
    const ordenesConHorario = remainingOrdenes.filter(orden => orden.horarioEspecifico);
    const ordenesSinHorario = remainingOrdenes.filter(orden => !orden.horarioEspecifico);

    // Ordenar órdenes con horario específico por hora
    ordenesConHorario.sort((a, b) => {
      const horaA = a.horarioEspecifico.split(':').map(Number);
      const horaB = b.horarioEspecifico.split(':').map(Number);
      return (horaA[0] * 60 + horaA[1]) - (horaB[0] * 60 + horaB[1]);
    });

    optimizedOrdenes.push(...ordenesConHorario);
    remainingOrdenes.splice(0, remainingOrdenes.length, ...ordenesSinHorario);

    // Optimizar las órdenes sin horario usando Nearest Neighbor
    while (remainingOrdenes.length > 0) {
      let closest = null;
      let closestDistance = Infinity;

      for (const orden of remainingOrdenes) {
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
    doc.text(`Inicio: Av. Fondo de la Legua 240, Martínez, San Isidro`, 10, 20);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 10, 25);

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
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Route />}
          onClick={optimizeRoute}
        >
          Crear Rutina de Trabajo
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/ordenes/nueva')}
        >
          Nueva Orden de Trabajo
        </Button>
      </Box>
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