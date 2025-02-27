import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrdenById, addVisita } from '../services/api';
import { jsPDF } from 'jspdf';
import {
  Button, Typography, Box, TextField, Card, CardContent, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import { ArrowBack, Download } from '@mui/icons-material';

const DetalleOrden = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [nuevaVisita, setNuevaVisita] = useState({
    fecha: '',
    observaciones: '',
    cantidadProducto: '',
    tipoProducto: '',
    tecnicos: '',
  });

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        const response = await getOrdenById(id);
        setOrden(response.data);
      } catch (error) {
        console.error('Error fetching orden:', error);
      }
    };
    fetchOrden();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaVisita({ ...nuevaVisita, [name]: value });
  };

  const handleAddVisita = async () => {
    try {
      const visitaData = {
        ...nuevaVisita,
        tecnicos: nuevaVisita.tecnicos.split(',').map((tecnico) => tecnico.trim()),
      };
      await addVisita(id, visitaData);
      setOrden((prevOrden) => ({
        ...prevOrden,
        visitas: [...prevOrden.visitas, visitaData],
      }));
      setNuevaVisita({
        fecha: '',
        observaciones: '',
        cantidadProducto: '',
        tipoProducto: '',
        tecnicos: '',
      });
    } catch (error) {
      console.error('Error adding visita:', error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Orden de Trabajo #${orden.numeroOrden}`, 10, 10);
    doc.text(`Vecino: ${orden.vecino.nombre}`, 10, 20);
    doc.text(`Dirección: ${orden.vecino.direccion}`, 10, 30);
    doc.text(`Tipo de Servicio: ${orden.tipoServicio}`, 10, 40);
    doc.text(`Estado: ${orden.estado}`, 10, 50);
    doc.text('Visitas:', 10, 60);
    orden.visitas.forEach((visita, index) => {
      doc.text(`Visita ${index + 1}:`, 10, 70 + index * 40);
      doc.text(`Fecha: ${new Date(visita.fecha).toLocaleDateString()}`, 20, 80 + index * 40);
      doc.text(`Observaciones: ${visita.observaciones}`, 20, 90 + index * 40);
      doc.text(`Producto: ${visita.cantidadProducto} ${visita.tipoProducto}`, 20, 100 + index * 40);
      doc.text(`Técnicos: ${visita.tecnicos.join(', ')}`, 20, 110 + index * 40);
    });
    doc.save(`orden_${orden.numeroOrden}.pdf`);
  };

  if (!orden) return <div>Cargando...</div>;

  return (
    <Box sx={{ p: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>
      <Typography variant="h4" gutterBottom>
        Orden de Trabajo #{orden.numeroOrden}
      </Typography>
      <Typography>Vecino: {orden.vecino.nombre}</Typography>
      <Typography>Dirección: {orden.vecino.direccion}</Typography>
      <Typography>Tipo de Servicio: {orden.tipoServicio}</Typography>
      <Typography>Estado: {orden.estado}</Typography>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={handleDownloadPDF}
        sx={{ mt: 2, mb: 2 }}
      >
        Descargar PDF
      </Button>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Visitas
      </Typography>
      <List>
        {orden.visitas.map((visita, index) => (
          <ListItem key={index}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <ListItemText
                  primary={`Fecha: ${new Date(visita.fecha).toLocaleDateString()}`}
                  secondary={
                    <>
                      <Typography>Observaciones: {visita.observaciones}</Typography>
                      <Typography>Cantidad: {visita.cantidadProducto} {visita.tipoProducto}</Typography>
                      <Typography>Técnicos: {visita.tecnicos.join(', ')}</Typography>
                    </>
                  }
                />
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      {orden.estado !== 'completada' && (
        <Card sx={{ maxWidth: 500, mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Agregar Visita</Typography>
            <TextField
              label="Fecha"
              name="fecha"
              type="date"
              value={nuevaVisita.fecha}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Observaciones"
              name="observaciones"
              value={nuevaVisita.observaciones}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Cantidad de Producto"
              name="cantidadProducto"
              type="number"
              value={nuevaVisita.cantidadProducto}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Tipo de Producto"
              name="tipoProducto"
              value={nuevaVisita.tipoProducto}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Técnicos (separados por coma)"
              name="tecnicos"
              value={nuevaVisita.tecnicos}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleAddVisita} fullWidth>
              Agregar Visita
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DetalleOrden;