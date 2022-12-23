import { createRoot } from 'npm:react-dom@18.2.0/client';
import { App } from './local.tsx';

const root = createRoot(document.getElementById('main'));
root.render(<App />);
