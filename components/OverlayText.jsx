import React from 'react'

export default function OverlayText({ value, position, mask = true }) {
  if (!position) return null;

  // Base coordinates relative to 800x1131
  const leftPercent = (position.x / 800) * 100;
  const topPercent = (position.y / 1131) * 100;
  const widthPercent = (position.width / 800) * 100;
  const heightPercent = position.height ? (position.height / 1131) * 100 : null;

  const style = {
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    width: `${widthPercent}%`,
    height: heightPercent ? `${heightPercent}%` : 'auto',
    fontSize: `${position.fontSize || 13}px`,
    fontWeight: position.fontWeight || 500,
    textAlign: position.textAlign || 'left',
    lineHeight: position.lineHeight || 1.4,
    color: position.color || '#000000',
    justifyContent: position.textAlign === 'right' ? 'flex-end' : position.textAlign === 'center' ? 'center' : 'flex-start',
    zIndex: 10
  };

  // Mask overlay to hide the template's placeholder values underneath
  const maskStyle = mask ? {
    position: 'absolute',
    left: `${leftPercent - 0.5}%`,
    top: `${topPercent - 0.2}%`,
    width: `${widthPercent + 1}%`,
    height: heightPercent ? `${heightPercent + 0.4}%` : '1.4em',
    backgroundColor: '#ffffff',
    zIndex: 5
  } : null;

  return (
    <>
      {mask && <div style={maskStyle} className="mask-overlay" />}
      <div style={style} className="overlay-field">
        {value}
      </div>
    </>
  );
}
