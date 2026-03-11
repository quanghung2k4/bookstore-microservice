import React from 'react';
import AuthSection from './components/AuthSection.jsx';
import StorefrontShell from './components/StorefrontShell.jsx';
import { useBookstoreApp } from './app/useBookstoreApp.js';

export default function App() {
  const app = useBookstoreApp();
  const {
    authForm,
    authMode,
    bannerMessage,
    busyAction,
    currentCustomer,
    errorMessage,
    handleAuthFieldChange,
    handleAuthSubmit,
    setAuthMode,
  } = app;

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <div className="shell-content">
        <div className="message-stack global-message-stack">
          {errorMessage ? <p className="state-line error">{errorMessage}</p> : null}
          {bannerMessage ? <p className="state-line success">{bannerMessage}</p> : null}
        </div>

        {!currentCustomer ? (
          <main className="auth-layout">
            <AuthSection
              authMode={authMode}
              onModeChange={setAuthMode}
              authForm={authForm}
              onFieldChange={handleAuthFieldChange}
              onSubmit={handleAuthSubmit}
              busyAction={busyAction}
            />
          </main>
        ) : (
          <StorefrontShell {...app} />
        )}
      </div>
    </div>
  );
}
