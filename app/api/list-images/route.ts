import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getFilesRecursively(dir: string, fileList: any[] = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const name = path.join(dir, file)
    if (fs.statSync(name).isDirectory()) {
      if (!file.startsWith('.') || file === '.tempmediaStorage') {
        getFilesRecursively(name, fileList)
      }
    } else {
      if (file.endsWith('.png')) {
        const stat = fs.statSync(name)
        fileList.push({
          name: file,
          path: name,
          size: stat.size,
          mtime: stat.mtime.toISOString(),
          mtimeMs: stat.mtimeMs
        })
      }
    }
  }
  return fileList
}

export async function GET() {
  try {
    const baseDir = 'C:\\Users\\VISHNU VARDHAN\\.gemini\\antigravity\\brain\\a977d05c-c3da-4757-9ea4-ff76a14d70e4'
    const pngFiles = getFilesRecursively(baseDir)
    pngFiles.sort((a, b) => b.mtimeMs - a.mtimeMs)
    return NextResponse.json({ files: pngFiles })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
