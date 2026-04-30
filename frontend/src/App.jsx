import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#001433',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
