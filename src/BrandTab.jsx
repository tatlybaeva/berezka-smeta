import { useState } from 'react'

export default function BrandTab() {
  const [page, setPage] = useState('brand.html')
  const pages = [
    { file: 'brand.html', label: 'v1 — Классика' },
    { file: 'brand-v2.html', label: 'v2 — Тёмный лес' },
    { file: 'brand-core.html', label: 'Основа' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 50px)' }}>
      <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: '#faf9f6', borderBottom: '1px solid #EBE2D3' }}>
        {pages.map(p => (
          <button key={p.file} onClick={() => setPage(p.file)} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: "'Georgia', serif", fontSize: 12,
            background: page === p.file ? '#1a1a1a' : '#f0ede8',
            color: page === p.file ? '#fff' : '#666',
          }}>{p.label}</button>
        ))}
      </div>
      <iframe src={`/${page}`} style={{ flex: 1, border: 'none', width: '100%' }} title="Brand" />
    </div>
  )
}
