import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVecinos, createOrden } from '../services/api';
import OrdenTrabajoForm from '../components/OrdenTrabajoForm';

const NuevaOrden = ({ accessToken }) => {
  const navigate = useNavigate();
  const [vecinos, setVecinos] = useState([]);

  useEffect(() => {
    const fetchVecinos = async () => {
      try {
        const response = await getVecinos();
        setVecinos(response.data);
      } catch (error) {
        console.error('Error fetching vecinos:', error);
      }
    };
    fetchVecinos();
  }, []);

  const handleSubmit = async (data, token) => {
    try {
      await createOrden(data);
      navigate('/');
    } catch (error) {
      console.error('Error creating orden:', error);
    }
  };

  return (
    <OrdenTrabajoForm
      onSubmit={handleSubmit}
      vecinos={vecinos}
      accessToken={accessToken}
    />
  );
};

export default NuevaOrden;