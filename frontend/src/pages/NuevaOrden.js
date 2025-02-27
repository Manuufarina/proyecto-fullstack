import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OrdenTrabajoForm from '../components/OrdenTrabajoForm';
import { createOrden, getVecinos } from '../services/api';

const NuevaOrden = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vecinos, setVecinos] = useState([]);
  const queryParams = new URLSearchParams(location.search);
  const vecinoId = queryParams.get('vecino');

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

  const handleSubmit = async (data) => {
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
      initialData={{ vecino: vecinoId }}
    />
  );
};

export default NuevaOrden;