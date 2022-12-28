import React from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';
import { App } from './local.tsx';
// Uncomment this and watch the build break.
// import './style.css';

const root = createRoot(document.getElementById('main')!);
root.render(<App />);
