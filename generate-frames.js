const fs = require('fs');
const path = require('path');

const sequences = [
    'Flug-Tauchen',
    'Tauchen-Alpen',
    'Alpen-Skifahren'
];

const allFrames = [];

sequences.forEach(seq => {
    const dir = path.join(__dirname, 'public', seq);
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
            .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
            .sort(); // Sorts frame_000, frame_001 correctly

        files.forEach(f => {
            allFrames.push(`/${seq}/${f}`);
        });
    } else {
        console.warn(`Directory not found: ${dir}`);
    }
});

const outputPath = path.join(__dirname, 'public/animation-frames.json');
fs.writeFileSync(outputPath, JSON.stringify(allFrames, null, 2));
console.log(`Generated ${allFrames.length} frames map at ${outputPath}`);
