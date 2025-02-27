import React from 'react';
import { useNavigate } from 'react-router-dom';
import VecinoForm from '../components/VecinoForm';
import { createVecino } from '../services/api';

const NuevoVecino = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await createVecino(data);
      navigate('/');
    } catch (error) {
      console.error('Error creating vecino:', error);
    }
  };

  return <VecinoForm onSubmit={handleSubmit} />;
};

export default NuevoVecino;