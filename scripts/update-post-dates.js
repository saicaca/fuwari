/* This is a script to update the 'updated' field in all post markdown files based on their last modification time */

import fs from "fs";
import path from "path";
import crypto from "crypto";

// 存储文件内容哈希的文件路径
const HASH_CACHE_PATH = path.resolve(process.cwd(), 'scripts', '.content-hashes.json');

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 计算内容的哈希值，用于检测实际内容变化
function calculateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// 获取或创建哈希缓存
function getHashCache() {
  try {
    if (fs.existsSync(HASH_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(HASH_CACHE_PATH, 'utf-8'));
    }
  } catch (e) {
    console.log('创建新的内容哈希缓存');
  }
  return {};
}

// 保存哈希缓存
function saveHashCache(cache) {
  fs.writeFileSync(HASH_CACHE_PATH, JSON.stringify(cache, null, 2));
}

// Simple frontmatter parser
function parseFrontmatter(content) {
  const frontmatterRegex = /---\r?\n([\s\S]*?)\r?\n---/;
  const match = frontmatterRegex.exec(content);
  
  if (!match || !match[1]) {
    return { data: {}, content };
  }
  
  const frontMatterLines = match[1].split("\n");
  const data = {};
  
  frontMatterLines.forEach(line => {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Convert date strings to Date objects
      if ((key === 'published' || key === 'updated') && value) {
        if (value.startsWith("'") || value.startsWith('"')) {
          value = value.slice(1, -1);
        }
        try {
          const dateValue = new Date(value);
          data[key] = dateValue;
        } catch (e) {
          data[key] = value;
        }
      } else {
        data[key] = value;
      }
    }
  });
  
  // 获取原始文件中frontmatter之后的内容，保留所有空行和格式
  // 找到匹配的整个frontmatter部分的末尾位置
  const matchEndPosition = match.index + match[0].length;
  // 提取frontmatter之后的所有内容，不做trim处理
  const actualContent = content.substring(matchEndPosition);
  
  return { data, content: actualContent };
}

// Simple function to generate frontmatter string
function stringifyFrontmatter(data, content) {
  let frontmatterStr = "---\n";
  
  Object.entries(data).forEach(([key, value]) => {
    // Format dates properly
    if (value instanceof Date) {
      frontmatterStr += `${key}: ${formatDate(value)}\n`;
    } else {
      frontmatterStr += `${key}: ${value}\n`;
    }
  });
  
  frontmatterStr += "---";
  
  // 确保内容部分保留原始的格式，包括开头的空行
  return frontmatterStr + content;
}

async function main() {
  // 获取哈希缓存
  const hashCache = getHashCache();
  
  // Get all markdown files in posts directory
  const postsDir = "./src/content/posts/";
  
  // Use a simpler alternative without external dependencies
  const postFiles = [];
  
  function findMarkdownFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findMarkdownFiles(filePath);
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        postFiles.push(filePath);
      }
    }
  }
  
  // Start recursive search
  findMarkdownFiles(postsDir);
  console.log(`找到 ${postFiles.length} 个 markdown 文件`);
  
  // 清理不再存在的文件的哈希值
  const existingFiles = new Set(postFiles);
  const filesToRemove = Object.keys(hashCache).filter(filePath => !existingFiles.has(filePath));
  
  if (filesToRemove.length > 0) {
    console.log(`清理 ${filesToRemove.length} 个不再存在的文件的哈希值`);
    filesToRemove.forEach(filePath => {
      delete hashCache[filePath];
    });
  }
  
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const filePath of postFiles) {
    try {
      // 读取文件内容
      const fileContent = fs.readFileSync(filePath, "utf8");
      
      // 解析frontmatter
      const { data, content } = parseFrontmatter(fileContent);
      
      // 计算内容哈希值（不包括frontmatter）
      const contentHash = calculateHash(content);
      const previousHash = hashCache[filePath];
      
      // 如果内容哈希相同，说明内容没有实际变化
      if (previousHash === contentHash) {
        unchangedCount++;
        continue;
      }
      
      // 内容确实变化了，更新哈希缓存
      hashCache[filePath] = contentHash;
      
      // 获取文件最后修改时间
      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime;
      
      // 转换日期为字符串格式进行比较
      const lastModifiedDate = formatDate(lastModified);
      const publishedDate = data.published ? formatDate(new Date(data.published)) : null;
      
      // 跳过新创建的文件（发布日期等于最后修改日期）
      if (publishedDate === lastModifiedDate) {
        continue;
      }
      
      // 更新frontmatter
      data.updated = lastModified;
      
      // 序列化回文件
      const updatedFileContent = stringifyFrontmatter(data, content);
      
      // 检查内容是否为空，如果为空则不覆盖原文件
      if (content.trim() === '') {
        console.log(`跳过更新文件 '${path.basename(filePath)}': 内容为空`);
        continue;
      }
      
      fs.writeFileSync(filePath, updatedFileContent);
      
      updatedCount++;
      console.log(`更新了文件 '${path.basename(filePath)}' 的最后修改日期: ${lastModifiedDate}`);
      
    } catch (error) {
      console.error(`处理文件 ${filePath} 时出错:`, error);
    }
  }

  // 保存哈希缓存
  saveHashCache(hashCache);
  
  console.log(`\n更新完成：`);
  console.log(`- 更新了 ${updatedCount} 个文件`);
  console.log(`- ${unchangedCount} 个文件未变化`);
}

main().catch(console.error); 