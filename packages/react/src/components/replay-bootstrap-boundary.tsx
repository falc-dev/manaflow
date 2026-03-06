import { ReactNode } from 'react';
import { ReplayValidationIssue } from '@manaflow/core';
import { ReactReplayStore } from '../store';

export interface ReplayBootstrapBoundaryProps {
  loading: boolean;
  error: Error | null;
  validationIssues?: ReplayValidationIssue[];
  store: ReactReplayStore | null;
  loadingFallback?: ReactNode;
  renderError?: (context: { error: Error; validationIssues: ReplayValidationIssue[] }) => ReactNode;
  children: (store: ReactReplayStore) => ReactNode;
}

function defaultRenderError({ error, validationIssues }: { error: Error; validationIssues: ReplayValidationIssue[] }) {
  return (
    <section className="replay-bootstrap-error" role="alert">
      <p>{error.message}</p>
      {validationIssues.length > 0 ? (
        <ul className="replay-bootstrap-error__issues">
          {validationIssues.map((issue, index) => (
            <li key={`${issue.path}-${index}`}>
              {issue.path}: {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function ReplayBootstrapBoundary({
  loading,
  error,
  validationIssues = [],
  store,
  loadingFallback,
  renderError,
  children
}: ReplayBootstrapBoundaryProps) {
  if (error) {
    return <>{(renderError ?? defaultRenderError)({ error, validationIssues })}</>;
  }

  if (loading || !store) {
    return <>{loadingFallback ?? <p className="replay-player replay-player--loading">Loading replay...</p>}</>;
  }

  return <>{children(store)}</>;
}
