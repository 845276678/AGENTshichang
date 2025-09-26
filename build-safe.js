const { execSync } = require('child_process'); console.log('Building...'); execSync('npx next build', { stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '--max_old_space_size=4096' } });
