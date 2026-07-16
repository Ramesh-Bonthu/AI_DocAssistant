import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const srcDir = 'C:\\Users\\VISHNU VARDHAN\\.gemini\\antigravity\\brain\\a977d05c-c3da-4757-9ea4-ff76a14d70e4\\.tempmediaStorage'
    const destDir = 'd:\\Business_docs\\AI_DocAssistant\\public\\templates'

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    if (!fs.existsSync(srcDir)) {
      return NextResponse.json({ error: 'Source directory does not exist' })
    }

    const targetFile = 'media_a977d05c-c3da-4757-9ea4-ff76a14d70e4_1784097010171.png'
    const srcPath = path.join(srcDir, targetFile)
    const destPath = path.join(destDir, 'offer-letter.png')

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
    }

    // Also copy the logo file
    const baseDir = 'C:\\Users\\VISHNU VARDHAN\\.gemini\\antigravity\\brain\\a977d05c-c3da-4757-9ea4-ff76a14d70e4'
    const logoFile = 'media__1784099220759.png'
    const logoSrcPath = path.join(baseDir, logoFile)
    const logoDestPath = path.join(destDir, 'hps-logo.png')

    if (fs.existsSync(logoSrcPath)) {
      fs.copyFileSync(logoSrcPath, logoDestPath)
      return NextResponse.json({ success: true, message: 'Copied template screenshot and HPS logo successfully' })
    } else {
      return NextResponse.json({ success: true, message: 'Copied template, but logo source not found in baseDir' })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
