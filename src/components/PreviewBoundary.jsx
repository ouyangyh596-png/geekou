import { Component } from 'react'

// This boundary must live outside the lazy Three.js chunk: it also handles a
// failed chunk download after a deployment or an interrupted connection.
export default class PreviewBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <div className="cybertruck-viewer viewer-error" role="status">
      <p>The 3D preview is temporarily unavailable.</p>
      <button type="button" onClick={() => window.location.reload()}>Reload preview</button>
      <p>You can still explore every product and colour below.</p>
    </div>
  }
}
