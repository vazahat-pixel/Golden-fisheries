import fs from 'fs';
import path from 'path';

const routerPath = path.join(process.cwd(), 'src', 'router', 'index.jsx');
const routerContent = fs.readFileSync(routerPath, 'utf-8');

// Match both lazy imports and standard imports
const importRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+.*?from\s+['"]([^'"]+)['"]/g;

let match;
const missingFiles = [];

const dummyContent = `import React from 'react';

const Placeholder = () => {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Under Construction</h2>
      <p className="text-gray-600">This component has not been implemented yet.</p>
    </div>
  );
};

export default Placeholder;
`;

while ((match = importRegex.exec(routerContent)) !== null) {
  const importPath = match[1] || match[2];
  
  // Only process relative imports starting with ..
  if (importPath && importPath.startsWith('..')) {
    // Resolve relative to src/router
    const resolvedDir = path.join(process.cwd(), 'src', 'router');
    let absolutePath = path.join(resolvedDir, importPath);
    
    // Add .jsx extension if no extension is present
    if (!path.extname(absolutePath)) {
      absolutePath += '.jsx';
    }

    if (!fs.existsSync(absolutePath)) {
      // Also check .js just in case
      const jsPath = absolutePath.replace('.jsx', '.js');
      if (!fs.existsSync(jsPath)) {
        console.log(`Missing file detected: ${absolutePath}`);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(absolutePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write dummy file
        fs.writeFileSync(absolutePath, dummyContent);
        console.log(`Created placeholder for: ${absolutePath}`);
      }
    }
  }
}

console.log("Finished generating missing placeholder files.");
