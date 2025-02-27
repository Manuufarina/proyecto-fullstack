import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography } from '@mui/material';

const barrios = [
  'San isidro', 'Boulogne', 'Beccar', 'Acasusso', 'Villa Adelina', 'Lomas de San Isidro', 'Martinez', 'La Cava' // Reemplaza con la lista real de barrios/localidades
];

const VecinoForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    direccion: initialData.direccion || '',
    barrio: initialData.barrio || '',
    telefono: initialData.telefono || '',
    m2: initialData.m2 || '',
    esDelegacion: initialData.esDelegacion || false,
    delegacion: initialData.delegacion || '',
    abona: initialData.abona || false,
    numeroRecibo: initialData.numeroRecibo || '',
    motivoNoAbona: initialData.motivoNoAbona || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {initialData._id ? 'Editar Vecino' : 'Nuevo Vecino'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Barrio/Localidad</InputLabel>
            <Select name="barrio" value={formData.barrio} onChange={handleChange} required>
              {barrios.map((barrio) => (
                <MenuItem key={barrio} value={barrio}>{barrio}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="m2"
            name="m2"
            type="number"
            value={formData.m2}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>¿Es delegación municipal?</InputLabel>
            <Select name="esDelegacion" value={formData.esDelegacion} onChange={handleChange}>
              <MenuItem value={true}>Sí</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
          {formData.esDelegacion && (
            <TextField
              label="Delegación"
              name="delegacion"
              value={formData.delegacion}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>¿Abona?</InputLabel>
            <Select name="abona" value={formData.abona} onChange={handleChange}>
              <MenuItem value={true}>Sí</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
          {formData.abona ? (
            <TextField
              label="Número de recibo"
              name="numeroRecibo"
              value={formData.numeroRecibo}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          ) : (
            <TextField
              label="Motivo no abona"
              name="motivoNoAbona"
              value={formData.motivoNoAbona}
              onChange={handleChange}
              fullWidth
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

export default VecinoForm;