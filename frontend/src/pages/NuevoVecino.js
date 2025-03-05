import React from 'react';
import { useNavigate } from 'react-router-dom';
import VecinoForm from '../components/VecinoForm';
import { createVecino } from '../services/api';

const NuevoVecino = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await createVecino(data);
      navigate('/'); // Redirige a Home después de guardar
    } catch (error) {
      console.error('Error creating vecino:', error);
      alert('Hubo un error al guardar el vecino. Revisa la consola.');
    }
  };

  return <VecinoForm onSubmit={handleSubmit} />;
};

export default NuevoVecino;