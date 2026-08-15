import "./App.css";

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Homelab Platform</p>
          <h1>Internship Tracker</h1>
          <p className="subtitle">
            Manage internship and job applications from one place.
          </p>
        </div>

        <button type="button" disabled>
          Add application
        </button>
      </header>

      <section className="applications" aria-labelledby="applications-heading">
        <h2 id="applications-heading">Applications</h2>
        <p>
          The frontend foundation is running. Application data will be connected
          next.
        </p>
      </section>
    </main>
  );
}

export default App;
