const fs = require('fs');
const path = require('path');
const swaggerSpec = require('../swagger');

const routesDir = path.join(__dirname, '..', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

const routeEntries = [];
files.forEach(file => {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const re = /router\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    routeEntries.push({ file, method: m[1].toUpperCase(), path: m[2] });
  }
});

const specPaths = Object.keys(swaggerSpec.paths || {});

console.log('Found route files:', files);
console.log('\nRoutes parsed from files:');
routeEntries.forEach(r => console.log(` - ${r.file} : ${r.method} ${r.path}`));

console.log('\nPaths in swagger spec:');
specPaths.forEach(p => console.log(` - ${p}`));

const missing = routeEntries.filter(r => {
  const candidate = r.path.startsWith('/api') ? r.path : '/api' + (r.path.startsWith('/') ? r.path : '/' + r.path);
  return !specPaths.includes(candidate);
});

console.log('\nRoutes present in code but NOT in swagger.spec (prefixed with /api):');
if (missing.length === 0) console.log(' - Aucun manquant');
missing.forEach(m => console.log(` - ${m.file} : ${m.method} ${m.path}  => expected ${m.path.startsWith('/api')?m.path:'/api'+(m.path.startsWith('/')?m.path:'/\/'+m.path)}`));

process.exit(0);
