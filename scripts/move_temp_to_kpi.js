const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const kpiDir = path.join(root, 'kpi_data');
const sources = [path.join(root, 'temp'), path.join(root, 'backend', 'temp')];

function ensureDir(dir){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function moveRecursive(srcDir, destDir){
  if(!fs.existsSync(srcDir)) return;
  const items = fs.readdirSync(srcDir, { withFileTypes: true });
  for(const it of items){
    const srcPath = path.join(srcDir, it.name);
    const rel = path.relative(srcDir, srcPath);
    const destPath = path.join(destDir, rel);
    if(it.isDirectory()){
      ensureDir(destPath);
      moveRecursive(srcPath, destPath);
      // remove empty dir if desired
      try{ fs.rmdirSync(srcPath); } catch(e){}
    } else if(it.isFile()){
      ensureDir(path.dirname(destPath));
      try{
        fs.renameSync(srcPath, destPath);
        console.log(`Moved: ${srcPath} -> ${destPath}`);
      } catch(err){
        console.error(`Failed to move ${srcPath}:`, err.message);
      }
    }
  }
}

ensureDir(kpiDir);
for(const s of sources){
  if(fs.existsSync(s)){
    console.log('Processing source:', s);
    moveRecursive(s, kpiDir);
  } else {
    console.log('Source not found:', s);
  }
}
console.log('Done.');
