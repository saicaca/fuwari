import fs from 'fs'
import path from 'path'

// 指定要处理的目录路径
const directoryPath = './' // 替换为你的实际目录路径

// 递归遍历目录以查找所有 Markdown 文件
function findMarkdownFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      findMarkdownFiles(filePath, files)
    } else if (path.extname(file) === '.md') {
      files.push(filePath)
    }
  })
  return files
}

// 读取和更新 Markdown 文件
function updateDateToPublished(files) {
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    const updatedContent = content.replace(
      /^---\s*\n([\s\S]*?)\bdate:([^\n]*)([\s\S]*?\n---)/,
      '---\n$1published:$2$3',
    )

    // 只有在内容实际更改后才写回文件
    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent, 'utf8')
      console.log(`Updated 'date' to 'published' in file: ${file}`)
    }
  })
}

const markdownFiles = findMarkdownFiles(directoryPath)
updateDateToPublished(markdownFiles)
