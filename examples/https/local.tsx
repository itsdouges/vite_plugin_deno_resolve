import React, { useState } from 'https://esm.sh/react@18.2.0';

export function App() {
  const [count, setCount] = useState(1);

  return (
    <button
      className='button button__pink'
      onClick={() => setCount((prev) => prev + 1)}
    >
      Hello {count}
    </button>
  );
}
