import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  failed: boolean;
}

// Without a boundary, one uncaught render/effect error unmounts the whole app and
// leaves the dark page background: a "black screen". Show a recovery prompt instead.
export class RootErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Something went wrong loading this page</h1>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ padding: "10px 20px", borderRadius: "8px", border: 0, background: "#fafafa", color: "#0a0a0a", fontWeight: 600 }}
        >
          Reload
        </button>
      </div>
    );
  }
}
