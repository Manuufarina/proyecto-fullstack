import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VecinoForm from '../components/VecinoForm';
import { getVecinoById, updateVecino } from '../services/api';

const EditarVecino = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vecino, setVecino] = useState(null);

  useEffect(() => {
    const fetchVecino = async () => {
      try {
        const response = await getVecinoById(id);
        setVecino(response.data);
      } catch (error) {
        console.error('Error fetching vecino:', error);
      }
    };
    fetchVecino();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await updateVecino(id, data);
      navigate('/');
    } catch (error) {
      console.error('Error updating vecino:', error);
    }
  };

  if (!vecino) return <div>Cargando...</div>;

  return <VecinoForm onSubmit={handleSubmit} initialData={vecino} />;
};

export default EditarVecino;