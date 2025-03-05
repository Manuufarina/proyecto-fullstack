import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrdenById, addVisita } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Button, Typography, Box, TextField, Card, CardContent, IconButton, List, ListItem, ListItemText,
  Table, TableHead, TableRow, TableCell, TableBody
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

    // Encabezado
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DIRECCIÓN DE CONTROL DE VECTORES', 10, 10);
    doc.text('ORDEN DE TRABAJO', 160, 10, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AV. FONDO DE LA LEGUA 240, MARTINEZ', 10, 20);
    doc.text('4513-7828 / 11-3151-2985', 10, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nº: ${String(orden.numeroOrden).padStart(5, '0')}-`, 160, 20, { align: 'right' });
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 160, 25, { align: 'right' });

    // Logo (requiere convertir a base64 o usar un enlace, aquí lo omitimos por simplicidad)
    // Si tienes el logo en base64, puedes usar doc.addImage(base64, 'PNG', 180, 10, 20, 20);

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(10, 30, 200, 30);

    // Datos principales
    doc.setFontSize(10);
    doc.text('PAGO Y SELLO:', 10, 40);
    doc.text('SOLICITANTE:', 10, 50);
    doc.text(`${orden.vecino.nombre}`, 40, 50);
    doc.text('TEL:', 10, 60);
    doc.text(`${orden.vecino.telefono}`, 40, 60);
    doc.text('RECEPCIÓN:', 10, 70);
    doc.text('DIRECCIÓN:', 10, 80);
    doc.text(`${orden.vecino.direccion}`, 40, 80);
    doc.text('LOCALIDAD/BARRIO:', 10, 90);
    doc.text(`${orden.vecino.barrio}`, 40, 90);
    doc.text('TIPO DE PLAGA:', 10, 100);
    doc.text(`${orden.tipoServicio}`, 40, 100);

    doc.setFont('helvetica', 'bold');
    doc.text('ROEDOR:', 10, 110);
    doc.text('DESINSEC:', 40, 110);
    doc.text('DESINFEC:', 70, 110);
    doc.text('OBSERVACIONES:', 10, 120);

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(10, 125, 200, 125);

    // Título de seguimiento
    doc.setFontSize(12);
    doc.text('SEGUIMIENTO DE TAREAS REALIZADAS:', 10, 130);

    // Tabla de visitas
    const tableData = orden.visitas.map((visita, index) => [
      new Date(visita.fecha).toLocaleDateString('es-AR'),
      visita.observaciones || 'Sin detalle',
      visita.estado || 'INSPECCIÓN',
      `${visita.cantidadProducto} ${visita.tipoProducto}`,
      visita.tecnicos.join(', ')
    ]);

    doc.autoTable({
      startY: 135,
      head: [['FECHA', 'DETALLE', 'ESTADO', 'PRODUCTO Y DOSIS', 'RESPONSABLE']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100] },
      styles: { fontSize: 8 }
    });

    // Pie de página
    const finalY = doc.lastAutoTable.finalY || 135;
    doc.setFontSize(10);
    doc.text('PASADO A SISTEMA: SÍ - NO', 10, finalY + 10);
    doc.text('PASADO AL MAPA: SÍ - NO', 60, finalY + 10);
    doc.text('SUPERVISOR:', 140, finalY + 10);

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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Observaciones</TableCell>
            <TableCell>Cantidad de Producto</TableCell>
            <TableCell>Tipo de Producto</TableCell>
            <TableCell>Técnicos</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orden.visitas.map((visita, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(visita.fecha).toLocaleDateString()}</TableCell>
              <TableCell>{visita.observaciones}</TableCell>
              <TableCell>{visita.cantidadProducto}</TableCell>
              <TableCell>{visita.tipoProducto}</TableCell>
              <TableCell>{visita.tecnicos.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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