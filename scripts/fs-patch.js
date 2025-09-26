const fs = require('fs');

function wrapSync(original, fallback) {
  return function (...args) {
    try {
      return original.apply(this, args);
    } catch (error) {
      if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
        return fallback;
      }
      throw error;
    }
  };
}

function wrapAsync(original, fallback) {
  if (!original) return undefined;
  return async function (...args) {
    try {
      return await original.apply(this, args);
    } catch (error) {
      if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
        return fallback;
      }
      throw error;
    }
  };
}

fs.readFileSync = wrapSync(fs.readFileSync, '');
fs.statSync = wrapSync(fs.statSync, { isDirectory: () => false, isFile: () => false });
fs.readdirSync = wrapSync(fs.readdirSync, []);
fs.opendirSync = wrapSync(fs.opendirSync, { readSync: () => null, closeSync: () => undefined });

if (fs.promises) {
  fs.promises.readFile = wrapAsync(fs.promises.readFile, Buffer.from(''));
  fs.promises.stat = wrapAsync(fs.promises.stat, { isDirectory: () => false, isFile: () => false });
  fs.promises.readdir = wrapAsync(fs.promises.readdir, []);
  fs.promises.opendir = wrapAsync(fs.promises.opendir, {
    async read() { return null; },
    async close() { return undefined; }
  });
}

const gracefulFs = (() => {
  try {
    return require('graceful-fs');
  } catch (error) {
    return null;
  }
})();

if (gracefulFs) {
  gracefulFs.readFileSync = fs.readFileSync;
  gracefulFs.statSync = fs.statSync;
  gracefulFs.readdirSync = fs.readdirSync;
  gracefulFs.opendirSync = fs.opendirSync;

  if (gracefulFs.promises) {
    gracefulFs.promises.readFile = fs.promises.readFile;
    gracefulFs.promises.stat = fs.promises.stat;
    gracefulFs.promises.readdir = fs.promises.readdir;
    gracefulFs.promises.opendir = fs.promises.opendir;
  }
}