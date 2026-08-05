import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Render error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="label-mono text-burgundy">— PAGINĂ RUPTĂ —</p>
        <h1 className="font-heading text-3xl">Ceva s-a stricat aici.</h1>
        <a href="/" className="label-mono underline underline-offset-4 hover:text-burgundy">înapoi la început</a>
      </div>
    );
  }
}
