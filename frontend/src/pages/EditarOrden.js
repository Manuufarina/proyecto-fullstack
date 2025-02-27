import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrdenTrabajoForm from '../components/OrdenTrabajoForm';
import { getOrdenById, updateOrden, getVecinos } from '../services/api';

const EditarOrden = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [vecinos, setVecinos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordenRes = await getOrdenById(id);
        const vecinosRes = await getVecinos();
        setOrden(ordenRes.data);
        setVecinos(vecinosRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await updateOrden(id, data);
      navigate('/');
    } catch (error) {
      console.error('Error updating orden:', error);
    }
  };

  if (!orden || !vecinos.length) return <div>Cargando...</div>;

  return <OrdenTrabajoForm onSubmit={handleSubmit} initialData={orden} vecinos={vecinos} />;
};

export default EditarOrden;