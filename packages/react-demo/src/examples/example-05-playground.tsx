import { useState, useCallback, useMemo } from 'react';
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import { validateReplayJson, formatValidationIssues, ReplayValidationIssue } from '@manaflow/core';
import demoReplay from '../demo.replay.json';

const DEFAULT_JSON = JSON.stringify(demoReplay, null, 2);

export function Example05Playground() {
  const [jsonContent, setJsonContent] = useState(DEFAULT_JSON);
  const [validationIssues, setValidationIssues] = useState<ReplayValidationIssue[]>([]);
  const [store, setStore] = useState<ReturnType<typeof createReactReplayStore> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJsonChange = useCallback((value: string) => {
    setJsonContent(value);
    
    const result = validateReplayJson(value);
    if (!result.ok) {
      setValidationIssues(result.issues);
      setStore(null);
      setError(null);
      return;
    }
    
    setValidationIssues([]);
    
    try {
      const replayStore = createReactReplayStore(result.replay);
      setStore(replayStore);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStore(null);
    }
  }, []);

  const formattedErrors = useMemo(() => {
    if (validationIssues.length === 0) return '';
    return formatValidationIssues(validationIssues);
  }, [validationIssues]);

  return (
    <div className="playground">
      <div className="playground__editor">
        <div className="playground__header">
          <h3>Editor JSON</h3>
          <button
            className="playground__reset"
            onClick={() => handleJsonChange(DEFAULT_JSON)}
            type="button"
          >
            Reset
          </button>
        </div>
        <textarea
          className="playground__textarea"
          value={jsonContent}
          onChange={(e) => handleJsonChange(e.target.value)}
          spellCheck={false}
        />
        {formattedErrors && (
          <div className="playground__errors">
            <pre>{formattedErrors}</pre>
          </div>
        )}
        {error && (
          <div className="playground__errors">
            <pre>Error: {error}</pre>
          </div>
        )}
      </div>
      
      <div className="playground__preview">
        {store ? (
          <ReplayPlayer 
            store={store} 
            showTimeline 
            viewportLayout="board"
          />
        ) : (
          <div className="playground__placeholder">
            {validationIssues.length > 0 
              ? 'Corrige los errores en el JSON para ver la preview'
              : error 
                ? 'Error al cargar el replay'
                : 'Cargando preview...'}
          </div>
        )}
      </div>
    </div>
  );
}
