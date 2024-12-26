import sharp from 'sharp';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 48, 128];
const inputPath = join(__dirname, '../src/assets/icon.png');
const outputDir = join(__dirname, '../public/icons');

async function generateIcons() {
  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  // Generate each size
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size)
      .toFile(join(outputDir, `icon${size}.png`));
    
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error); 