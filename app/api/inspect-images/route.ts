import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const destDir = 'd:\\Business_docs\\AI_DocAssistant\\public\\templates'
    if (!fs.existsSync(destDir)) {
      return new NextResponse('No templates directory', { status: 404 })
    }

    const files = fs.readdirSync(destDir).filter(f => f.endsWith('.png'))
    const html = `
      <html>
        <head>
          <title>Inspect Images</title>
          <style>
            body { font-family: sans-serif; background: #eaeaea; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
            img { max-width: 100%; max-height: 400px; border: 1px solid #ccc; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Inspect Copied Images</h1>
          <div class="grid">
            ${files.map(file => `
              <div class="card">
                <h3>${file}</h3>
                <img src="/templates/${file}" />
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
