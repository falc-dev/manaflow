import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@manaflow/react/styles.css';
import './main.css';
import { Example01BasicControls } from './examples/example-01-basic-controls';
import { Example02CustomRender } from './examples/example-02-custom-render';
import { Example03TimelineMarkers } from './examples/example-03-timeline-markers';
import { Example04AdvancedRiftbound } from './examples/example-04-advanced-riftbound';
import { Example05Playground } from './examples/example-05-playground';

type ExampleDefinition = {
  id: string;
  level: string;
  title: string;
  description: string;
  Component: () => JSX.Element;
};

const EXAMPLES: ExampleDefinition[] = [
  {
    id: '01-basic-controls',
    level: 'Level 1',
    title: 'ReplayPlayer mínimo',
    description: 'Carga el replay y monta el componente de alto nivel con pocos props.',
    Component: Example01BasicControls
  },
  {
    id: '02-custom-render',
    level: 'Level 2',
    title: 'Controles + viewport personalizado',
    description: 'Usa store headless y render callbacks para adaptar zonas y cartas.',
    Component: Example02CustomRender
  },
  {
    id: '03-timeline-markers',
    level: 'Level 3',
    title: 'Timeline y autoplay',
    description: 'Agrega marcadores semánticos, seek por frame y velocidad de reproducción.',
    Component: Example03TimelineMarkers
  },
  {
    id: '04-advanced-riftbound',
    level: 'Level 4',
    title: 'Demo avanzada completa',
    description: 'Panel explicativo, mapa dual, score race y onboarding visual.',
    Component: Example04AdvancedRiftbound
  },
  {
    id: '05-playground',
    level: 'Playground',
    title: 'Editor JSON interactivo',
    description: 'Edita el JSON y ve la preview en tiempo real. Valida el esquema automáticamente.',
    Component: Example05Playground
  }
];

function getExampleIdFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const candidate = params.get('example');

  if (candidate && EXAMPLES.some((example) => example.id === candidate)) {
    return candidate;
  }

  return EXAMPLES[0].id;
}

function setUrlExample(exampleId: string) {
  const params = new URLSearchParams(window.location.search);
  params.set('example', exampleId);
  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ exampleId }, '', nextUrl);
}

function App() {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(() => getExampleIdFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setSelectedExampleId(getExampleIdFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectedExample = useMemo(() => {
    return EXAMPLES.find((example) => example.id === selectedExampleId) ?? EXAMPLES[0];
  }, [selectedExampleId]);

  return (
    <section className="demo-examples" aria-label="React demo examples">
      <header className="demo-examples__header">
        <h2 className="demo-examples__title">Progressive Examples</h2>
        <p className="demo-examples__description">
          Recorre ejemplos de menor a mayor complejidad para integrar `@manaflow/react` paso a paso.
        </p>
      </header>

      <nav className="demo-examples__nav" aria-label="Example selector">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            type="button"
            className={`demo-examples__option${example.id === selectedExample.id ? ' demo-examples__option--active' : ''}`}
            onClick={() => {
              setSelectedExampleId(example.id);
              setUrlExample(example.id);
            }}
          >
            <span className="demo-examples__option-level">{example.level}</span>
            <span className="demo-examples__option-title">{example.title}</span>
            <span className="demo-examples__option-description">{example.description}</span>
          </button>
        ))}
      </nav>

      <div className="demo-examples__content">
        <selectedExample.Component />
      </div>
    </section>
  );
}

const app = document.getElementById('app');
if (!app) {
  throw new Error('Missing required DOM node: #app');
}

createRoot(app).render(<App />);
