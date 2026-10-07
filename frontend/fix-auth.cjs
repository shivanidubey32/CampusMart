const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const files = walkSync(path.join(process.cwd(), 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('useSelector((state) => state.auth)') || content.includes('useSelector(state => state.auth)')) {
    
    if(content.includes('import { useSelector } from \'react-redux\';')) {
        content = content.replace('import { useSelector } from \'react-redux\';', '');
    } else if(content.includes('import { useDispatch, useSelector } from \'react-redux\';')) {
        content = content.replace('import { useDispatch, useSelector } from \'react-redux\';', '');
    }

    const depth = file.split('src')[1].split(path.sep).length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    const authImport = `import { useAuth } from '${prefix}context/AuthContext';\n`;
    content = authImport + content;

    content = content.replace(/const \{.*?\} = useSelector\(\(state\) => state\.auth\);/g, 'const { user } = useAuth();');
    
    fs.writeFileSync(file, content);
    console.log('Updated: ', file);
  }
}
