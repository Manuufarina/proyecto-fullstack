import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrdenById, updateOrden, getVecinos } from '../services/api';
import OrdenTrabajoForm from '../components/OrdenTrabajoForm';

const EditarOrden = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [vecinos, setVecinos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordenResponse = await getOrdenById(id);
        const vecinosResponse = await getVecinos();
        setInitialData(ordenResponse.data);
        setVecinos(vecinosResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await updateOrden(id, data);
      navigate(`/ordenes/${id}`);
    } catch (error) {
      console.error('Error updating orden:', error);
    }
  };

  if (!initialData) return <div>Cargando...</div>;

  return (
    <OrdenTrabajoForm
      onSubmit={handleSubmit}
      initialData={initialData}
      vecinos={vecinos}
    />
  );
};

export default EditarOrden;