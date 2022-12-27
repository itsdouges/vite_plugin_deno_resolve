import React, { useState } from 'https://esm.sh/react@18.2.0';
import { titleCase } from 'https://deno.land/x/case@2.1.1/mod.ts';

export function App() {
  const [count, setCount] = useState(1);

  return (
    <button
      className='button button__pink'
      onClick={() => setCount((prev) => prev + 1)}
    >
      {titleCase('hello_world')} {count}
    </button>
  );
}
