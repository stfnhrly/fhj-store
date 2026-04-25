'use client';
export default function GlobalError({ error, reset }: { error: any, reset: () => void }) {
  return (
    <html lang="id">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Global Error</h2>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
