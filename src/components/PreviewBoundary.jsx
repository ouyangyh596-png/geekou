import { Component } from 'react'

// This boundary must live outside the lazy Three.js chunk: it also handles a
// failed chunk download after a deployment or an interrupted connection.
export default class PreviewBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <div className="cybertruck-viewer viewer-error" role="status">
      <p>{this.props.copy.error}</p>
      <button type="button" onClick={() => window.location.reload()}>{this.props.copy.reload}</button>
      <p>{this.props.copy.errorHelp}</p>
    </div>
  }
}
