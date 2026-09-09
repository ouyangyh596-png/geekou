import { useEffect, useRef, useState } from 'react'
import { englishSiteContent } from '../content/site-content.js'
import {
  DEFAULT_PRINT_PLACEMENT,
  updatePrintPlacement,
  validateArtworkFile,
} from '../printable-wrap-state.js'
import PrintableWrapViewer from './PrintableWrapViewer.jsx'

const copy = englishSiteContent.cybertruck.printableWrap

export default function PrintableWrapConfigurator() {
  const [artworkUrl, setArtworkUrl] = useState('')
  const [placement, setPlacement] = useState(() => ({ ...DEFAULT_PRINT_PLACEMENT }))
  const [finish, setFinish] = useState('glossy')
  const [editMode, setEditMode] = useState('positionArtwork')
  const [error, setError] = useState('')
  const artworkUrlRef = useRef('')
  const fileInputRef = useRef(null)

  const revokeArtwork = () => {
    if (!artworkUrlRef.current) return
    URL.revokeObjectURL(artworkUrlRef.current)
    artworkUrlRef.current = ''
  }

  useEffect(() => () => {
    if (artworkUrlRef.current) URL.revokeObjectURL(artworkUrlRef.current)
  }, [])

  const changePlacement = patch => {
    setPlacement(current => updatePrintPlacement(current, patch))
  }

  const handleArtworkChange = event => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateArtworkFile(file)
    if (!validation.valid) {
      setError(validation.message)
      event.target.value = ''
      return
    }

    const nextArtworkUrl = URL.createObjectURL(file)
    revokeArtwork()
    artworkUrlRef.current = nextArtworkUrl
    setArtworkUrl(nextArtworkUrl)
    setPlacement({ ...DEFAULT_PRINT_PLACEMENT })
    setEditMode('positionArtwork')
    setError('')
  }

  const handleRemove = () => {
    revokeArtwork()
    setArtworkUrl('')
    setPlacement({ ...DEFAULT_PRINT_PLACEMENT })
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleReset = () => {
    setPlacement({ ...DEFAULT_PRINT_PLACEMENT })
    setFinish('glossy')
    setEditMode('positionArtwork')
    setError('')
  }

  return <section className="printable-wrap-config" aria-labelledby="printable-wrap-title">
    <div className="printable-wrap-heading">
      <div>
        <p className="kicker">{copy.kicker}</p>
        <h2 id="printable-wrap-title">{copy.title}</h2>
      </div>
      <p>{copy.description}</p>
    </div>

    <div className="printable-wrap-layout">
      <PrintableWrapViewer
        artworkUrl={artworkUrl}
        placement={placement}
        finish={finish}
        editMode={editMode}
        onPlacementChange={changePlacement}
      />

      <div className="printable-wrap-controls">
        <div className="printable-control-group">
          <span className="printable-control-label">{copy.artworkLabel}</span>
          <label className="printable-control printable-upload-control">
            <span>{artworkUrl ? copy.replaceArtwork : copy.uploadArtwork}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleArtworkChange}
            />
          </label>
          <p className="printable-upload-note">{copy.uploadNote}</p>
          <p className={error ? 'printable-upload-status is-error' : 'printable-upload-status'} role={error ? 'alert' : 'status'} aria-live="polite">
            {error || (artworkUrl ? copy.artworkReady : copy.noArtwork)}
          </p>
        </div>

        <fieldset className="printable-control-group">
          <legend>{copy.interactionLabel}</legend>
          <div className="printable-segmented">
            <button className="printable-control" type="button" aria-pressed={editMode === 'positionArtwork'} onClick={() => setEditMode('positionArtwork')}>{copy.positionArtwork}</button>
            <button className="printable-control" type="button" aria-pressed={editMode === 'rotateVehicle'} onClick={() => setEditMode('rotateVehicle')}>{copy.rotateVehicle}</button>
          </div>
          <p className="printable-control-help">{editMode === 'positionArtwork' ? copy.positionHelp : copy.rotateHelp}</p>
        </fieldset>

        <fieldset className="printable-control-group">
          <legend>{copy.finishLabel}</legend>
          <div className="printable-segmented printable-finish-options">
            <label className="printable-control"><input type="radio" name="printable-finish" value="glossy" checked={finish === 'glossy'} onChange={() => setFinish('glossy')} />{copy.glossy}</label>
            <label className="printable-control"><input type="radio" name="printable-finish" value="matte" checked={finish === 'matte'} onChange={() => setFinish('matte')} />{copy.matte}</label>
          </div>
        </fieldset>

        <div className="printable-control-group printable-sliders">
          <label htmlFor="printable-scale">{copy.scaleLabel}<output htmlFor="printable-scale">{placement.scale.toFixed(2)}×</output></label>
          <input id="printable-scale" type="range" min="0.35" max="2.5" step="0.05" value={placement.scale} onChange={event => changePlacement({ scale: event.target.value })} />
          <label htmlFor="printable-rotation">{copy.rotationLabel}<output htmlFor="printable-rotation">{Math.round(placement.rotation)}°</output></label>
          <input id="printable-rotation" type="range" min="-180" max="180" step="1" value={placement.rotation} onChange={event => changePlacement({ rotation: event.target.value })} />
        </div>

        <div className="printable-actions">
          <button className="printable-control printable-action-primary" type="button" onClick={handleReset}>{copy.reset}</button>
          <button className="printable-control" type="button" onClick={handleRemove} disabled={!artworkUrl}>{copy.remove}</button>
        </div>
      </div>
    </div>
  </section>
}
