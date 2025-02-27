import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography } from '@mui/material';

const tiposServicio = [
  'Desratización', 'Retiro de Panal', 'Desinsectación general', 'Desinfección',
  'Fumigación por mosquitos', 'Alacranes', 'Otro'
];

const OrdenTrabajoForm = ({ onSubmit, initialData = {}, vecinos }) => {
  const [formData, setFormData] = useState({
    vecino: initialData.vecino?._id || '',
    tipoServicio: initialData.tipoServicio || '',
    otroServicio: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      vecino: formData.vecino,
      tipoServicio: formData.tipoServicio === 'Otro' ? formData.otroServicio : formData.tipoServicio,
    };
    onSubmit(data);
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {initialData._id ? 'Editar Orden' : 'Nueva Orden de Trabajo'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Vecino</InputLabel>
            <Select name="vecino" value={formData.vecino} onChange={handleChange} required>
              {vecinos.map((vecino) => (
                <MenuItem key={vecino._id} value={vecino._id}>{vecino.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Servicio</InputLabel>
            <Select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange} required>
              {tiposServicio.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.tipoServicio === 'Otro' && (
            <TextField
              label="Especificar Otro Servicio"
              name="otroServicio"
              value={formData.otroServicio}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          )}
          <Button type="submit" variant="contained" fullWidth>
            Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrdenTrabajoForm;