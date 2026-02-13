import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createReactReplayStore, loadDemoReplay, ReplayPlayer, ReactReplayStore } from '@manaflow/react';
import './main.css';

function App() {
  const [store, setStore] = useState<ReactReplayStore | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let disposed = false;
    let activeStore: ReactReplayStore | null = null;

    const bootstrap = async () => {
      try {
        const replay = await loadDemoReplay('/replay.demo.json');
        activeStore = createReactReplayStore(replay);
        if (disposed) {
          activeStore.destroy();
          return;
        }
        setStore(activeStore);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!disposed) {
          setError(`Failed to load replay demo: ${message}`);
        }
      }
    };

    void bootstrap();

    return () => {
      disposed = true;
      activeStore?.destroy();
    };
  }, []);

  const content = useMemo(() => {
    if (error) {
      return (
        <p className="error" role="alert">
          {error}
        </p>
      );
    }
    if (!store) {
      return <p className="replay-player replay-player--loading">Loading replay...</p>;
    }
    return <ReplayPlayer store={store} />;
  }, [error, store]);

  return content;
}

const app = document.getElementById('app');
if (!app) {
  throw new Error('Missing required DOM node: #app');
}

createRoot(app).render(<App />);
