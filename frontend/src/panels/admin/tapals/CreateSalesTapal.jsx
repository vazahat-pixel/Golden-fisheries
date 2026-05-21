import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/** Sales tapals must originate from harvest — redirect to procurement flow */
const CreateSalesTapal = () => {
  const navigate = useNavigate();
  useEffect(() => {
    toast.error('Tapal must be created from an approved harvest slip with net rate saved.');
    navigate('/admin/procurement/tapal/create', { replace: true });
  }, [navigate]);
  return <p className="p-8 text-sm">Redirecting to harvest-based tapal creation...</p>;
};

export default CreateSalesTapal;
