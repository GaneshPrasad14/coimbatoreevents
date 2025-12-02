import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

try {
    const files = fs.readdirSync(publicDir);

    files.forEach(file => {
        if (file.startsWith('music (') && file.endsWith(').mpeg')) {
            // Extract number
            const match = file.match(/music \((\d+)\)\.mpeg/);
            if (match) {
                const number = match[1];
                const newName = `music_${number}.mpeg`;
                const oldPath = path.join(publicDir, file);
                const newPath = path.join(publicDir, newName);

                fs.renameSync(oldPath, newPath);
                console.log(`Renamed: ${file} -> ${newName}`);
            }
        }
    });
    console.log('Renaming complete.');
} catch (error) {
    console.error('Error renaming files:', error);
}
