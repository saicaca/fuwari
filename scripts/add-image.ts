import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fetch from "node-fetch";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function downloadImage(url: string, outputPath: string): Promise<void> {
	try {
		const headers = {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
			"Accept-Language": "en-US,en;q=0.9",
			Referer: new URL(url).origin,
			"Cache-Control": "no-cache",
		};

		const response = await fetch(url, { headers });

		if (!response.ok) {
			throw new Error(`Failed to download image: ${response.status} ${response.statusText}
      URL: ${url}
      Headers: ${JSON.stringify(response.headers.raw(), null, 2)}`);
		}

		const contentType = response.headers.get("content-type");

		if (!contentType?.startsWith("image/")) {
			throw new Error(
				`Invalid content type: ${contentType}. Expected an image.`,
			);
		}

		const buffer = Buffer.from(await response.arrayBuffer());

		if (buffer.length === 0) {
			throw new Error("Downloaded file is empty");
		}

		await fs.writeFile(outputPath, buffer);
		console.log(`- Successfully downloaded image to: ${outputPath}`);
		console.log(`- File size: ${(buffer.length / 1024).toFixed(2)} KB`);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("ENOTFOUND")) {
				console.error(
					"❌ Could not resolve the host. Please check your internet connection and the URL.",
				);
			} else if (error.message.includes("Unauthorized")) {
				console.error("❌ Access denied. This might be because:");
				console.error("   1. The image requires authentication");
				console.error("   2. The server is blocking direct downloads");
				console.error("   3. The image URL might be temporary or expired");
				console.error(
					"\n💡 Try downloading the image manually and using a local path instead.",
				);
			} else {
				console.error("❌ Error downloading image:", error.message);
			}
		}
		throw error;
	}
}

async function getCurrentPostFolder(): Promise<string> {
	try {
		const cwd = process.cwd();

        const isInPostFolder = await fs.stat(path.join(cwd, 'index.md'))
        .then(() => true)
        .catch(() => false);
  
        if (isInPostFolder) {
            return cwd;
        }

		const possiblePostsDirs = [
			path.join(cwd, "src", "content", "posts"),
			path.join(cwd, "content", "posts"),
			path.join(cwd, "posts"),
		];

		let postsDir = "";
		for (const dir of possiblePostsDirs) {
			try {
				await fs.access(dir);
				postsDir = dir;
				break;
			} catch {}
		}

		if (!postsDir) {
			throw new Error("Could not find posts directory");
		}

		const items = await fs.readdir(postsDir);

		// Filter for directories only
		const folders = await Promise.all(
			items.map(async (item) => {
				const fullPath = path.join(postsDir, item);
				const stats = await fs.stat(fullPath);
				return stats.isDirectory() ? item : null;
			}),
		);

		const validFolders = folders.filter(
			(folder): folder is string => folder !== null,
		);
		console.log(postsDir);
		const { selectedFolder } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedFolder",
				message: "Select the folder to store image",
				choices: [
					{ name: "src/content/posts", value: "./" },
					...validFolders.map((folder) => ({
						name: `src/content/posts/${folder}`,
						value: folder,
					})),
				],
			},
		]);

		if (selectedFolder === ".") {
			return cwd;
		}

		return path.join(postsDir, selectedFolder);
	} catch (error) {
		console.error("❌ Error finding post folder:", error);
		throw error;
	}
}

async function main() {
	try {
		const { imageSource } = await inquirer.prompt([
			{
				type: "input",
				name: "imageSource",
				message: "Enter the image URL:",
				validate: (input: string) => {
					if (!input) return "Please enter a URL";
					try {
						new URL(input);
						return true;
					} catch (error) {
						return error.message;
					}
				},
			},
		]);

		const postFolder = await getCurrentPostFolder();
		const imageDir = postFolder;

		let filename: string;
		filename = path.basename(new URL(imageSource).pathname);
		if (!path.extname(filename)) {
			const { customFilename } = await inquirer.prompt([
				{
					type: "input",
					name: "customFilename",
					message: "Enter filename e.g. image.png:",
					default: "image.png",
					validate: (input: string) => {
						return path.extname(input)
							? true
							: "Please include a file extension e.g., .png, .jpg, .jpeg";
					},
				},
			]);
			filename = customFilename;
		}

		const outputPath = path.join(imageDir, filename);
		await downloadImage(imageSource, outputPath);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

main();
