import React from 'react';

interface Props {
  error: Error;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#fef2f2',
      color: '#991b1b',
    }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Algo salió mal</h1>
      <pre style={{
        background: '#fff',
        padding: 16,
        borderRadius: 8,
        overflow: 'auto',
        maxWidth: '100%',
        fontSize: 14,
        marginBottom: 16,
      }}>
        {error.toString()}
      </pre>
      {resetError && (
        <button
          onClick={resetError}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
