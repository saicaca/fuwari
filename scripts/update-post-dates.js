/* This is a script to update the 'updated' field in all post markdown files based on their last modification time */

import fs from "fs";
import path from "path";
import crypto from "crypto";

// Path to store the content hash cache file
const HASH_CACHE_PATH = path.resolve(process.cwd(), 'scripts', '.content-hashes.json');

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Calculate the hash of the content to detect actual content changes
function calculateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Get or create the hash cache
function getHashCache() {
  try {
    if (fs.existsSync(HASH_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(HASH_CACHE_PATH, 'utf-8'));
    }
  } catch (e) {
    console.log('Creating new content hash cache');
  }
  return {};
}

// Save the hash cache
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
  
  // Get the content after frontmatter, preserving all blank lines and formatting
  const matchEndPosition = match.index + match[0].length;
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
  
  // Ensure the content part retains its original formatting, including leading blank lines
  return frontmatterStr + content;
}

async function main() {
  // Get hash cache
  const hashCache = getHashCache();
  
  // Get all markdown files in posts directory
  const postsDir = "./src/content/posts/";
  
  // Use a simple alternative without external dependencies
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
  console.log(`Found ${postFiles.length} markdown files`);
  
  // Clean up hash values for files that no longer exist
  const existingFiles = new Set(postFiles);
  const filesToRemove = Object.keys(hashCache).filter(filePath => !existingFiles.has(filePath));
  
  if (filesToRemove.length > 0) {
    console.log(`Cleaning up hash values for ${filesToRemove.length} files that no longer exist`);
    filesToRemove.forEach(filePath => {
      delete hashCache[filePath];
    });
  }
  
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const filePath of postFiles) {
    try {
      // Read file content
      const fileContent = fs.readFileSync(filePath, "utf8");
      
      // Parse frontmatter
      const { data, content } = parseFrontmatter(fileContent);
      
      // Calculate content hash (excluding frontmatter)
      const contentHash = calculateHash(content);
      const previousHash = hashCache[filePath];
      
      // If the content hash is the same, the content has not actually changed
      if (previousHash === contentHash) {
        unchangedCount++;
        continue;
      }
      
      // Content has changed, update hash cache
      hashCache[filePath] = contentHash;
      
      // Get file last modification time
      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime;
      
      // Convert date to string for comparison
      const lastModifiedDate = formatDate(lastModified);
      const publishedDate = data.published ? formatDate(new Date(data.published)) : null;
      
      // Skip newly created files (publish date equals last modified date)
      if (publishedDate === lastModifiedDate) {
        continue;
      }
      
      // Update frontmatter
      data.updated = lastModified;
      
      // Serialize back to file
      const updatedFileContent = stringifyFrontmatter(data, content);
      
      // If content is empty, do not overwrite the original file
      if (content.trim() === '') {
        console.log(`Skip updating file '${path.basename(filePath)}': content is empty`);
        continue;
      }
      
      fs.writeFileSync(filePath, updatedFileContent);
      
      updatedCount++;
      console.log(`Updated last modified date for file '${path.basename(filePath)}': ${lastModifiedDate}`);
      
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  // Save hash cache
  saveHashCache(hashCache);
  
  console.log(`\nUpdate complete:`);
  console.log(`- Updated ${updatedCount} files`);
  console.log(`- ${unchangedCount} files unchanged`);
}

main().catch(console.error); 