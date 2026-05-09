import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// Force reload to clear HMR cache
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
import { LoadingFallback } from './design-system/components/LoadingFallback';

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<LoadingFallback type="full" />}>
        <AppRouter />
      </React.Suspense>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '0px',
            background: '#000000',
            color: '#fff',
            border: '2px solid #000000',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
