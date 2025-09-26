// fs-patch.js - 强制补丁所有文件系统调用
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching filesystem operations...');

// 保存原始方法
const originals = {
  readFileSync: fs.readFileSync,
  statSync: fs.statSync,
  readdirSync: fs.readdirSync,
  opendirSync: fs.opendirSync,
  scandir: fs.scandir,
  readdir: fs.promises?.readdir,
  opendir: fs.promises?.opendir,
  access: fs.access,
  stat: fs.stat,
  readFile: fs.readFile,
  lstat: fs.lstat,
  realpath: fs.realpath
};

// 检查路径是否应该跳过
function shouldSkip(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  const blocked = [
    'AppData',
    'dockerInference',
    'userAnalyticsOtlpHttp',
    '.sock',
    'ActionsMcpHost.exe',
    'Comms',
    'UnistoreDB',
    'store.jfm'
  ];
  return blocked.some(block => filePath.includes(block));
}

// 包装函数生成器
function wrapSync(originalFn, defaultReturn) {
  return function(...args) {
    try {
      const filePath = args[0];
      if (shouldSkip(filePath)) {
        return defaultReturn();
      }
      return originalFn.apply(this, args);
    } catch (error) {
      if (error.code === 'EACCES' || error.code === 'EPERM' || error.code === 'EBUSY' || error.code === 'ENOENT') {
        return defaultReturn();
      }
      throw error;
    }
  };
}

function wrapAsync(originalFn, defaultReturn) {
  return function(...args) {
    try {
      const filePath = args[0];
      if (shouldSkip(filePath)) {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') {
          return callback(null, defaultReturn());
        }
        return Promise.resolve(defaultReturn());
      }

      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        // 带回调的异步版本
        return originalFn.call(this, ...args.slice(0, -1), (err, result) => {
          if (err && (err.code === 'EACCES' || err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'ENOENT')) {
            return callback(null, defaultReturn());
          }
          callback(err, result);
        });
      } else {
        // Promise版本
        return originalFn.apply(this, args).catch(error => {
          if (error.code === 'EACCES' || error.code === 'EPERM' || error.code === 'EBUSY' || error.code === 'ENOENT') {
            return defaultReturn();
          }
          throw error;
        });
      }
    } catch (error) {
      if (error.code === 'EACCES' || error.code === 'EPERM' || error.code === 'EBUSY' || error.code === 'ENOENT') {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') {
          return callback(null, defaultReturn());
        }
        return Promise.resolve(defaultReturn());
      }
      throw error;
    }
  };
}

// 应用补丁
fs.readFileSync = wrapSync(originals.readFileSync, () => '');
fs.statSync = wrapSync(originals.statSync, () => ({
  isDirectory: () => false,
  isFile: () => false,
  isSymbolicLink: () => false,
  isSocket: () => false,
  isBlockDevice: () => false,
  isCharacterDevice: () => false,
  isFIFO: () => false,
  size: 0,
  mode: 0,
  uid: 0,
  gid: 0,
  dev: 0,
  ino: 0,
  nlink: 0,
  rdev: 0,
  blksize: 0,
  blocks: 0,
  atime: new Date(),
  mtime: new Date(),
  ctime: new Date(),
  birthtime: new Date()
}));
fs.readdirSync = wrapSync(originals.readdirSync, () => []);
fs.opendirSync = wrapSync(originals.opendirSync, () => ({
  readSync: () => null,
  closeSync: () => {}
}));

if (originals.scandir) {
  fs.scandir = wrapAsync(originals.scandir, () => []);
}

// Promises API
if (fs.promises) {
  if (originals.readdir) {
    fs.promises.readdir = wrapAsync(originals.readdir, () => []);
  }
  if (originals.opendir) {
    fs.promises.opendir = wrapAsync(originals.opendir, () => ({
      async read() { return null; },
      async close() { return undefined; }
    }));
  }

  ['access', 'stat', 'readFile', 'lstat', 'realpath'].forEach(method => {
    if (originals[method] && fs.promises[method]) {
      const defaultReturn = method === 'stat' || method === 'lstat' ? () => ({
        isDirectory: () => false,
        isFile: () => false,
        isSymbolicLink: () => false,
        isSocket: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isFIFO: () => false,
        size: 0,
        mode: 0,
        uid: 0,
        gid: 0,
        dev: 0,
        ino: 0,
        nlink: 0,
        rdev: 0,
        blksize: 0,
        blocks: 0,
        atime: new Date(),
        mtime: new Date(),
        ctime: new Date(),
        birthtime: new Date()
      }) : () => null;
      fs.promises[method] = wrapAsync(fs.promises[method], defaultReturn);
    }
  });
}

// 异步版本
['access', 'stat', 'readFile', 'lstat', 'realpath'].forEach(method => {
  if (originals[method]) {
    const defaultReturn = method === 'stat' || method === 'lstat' ? () => ({
      isDirectory: () => false,
      isFile: () => false,
      isSymbolicLink: () => false,
      isSocket: () => false,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isFIFO: () => false,
      size: 0,
      mode: 0,
      uid: 0,
      gid: 0,
      dev: 0,
      ino: 0,
      nlink: 0,
      rdev: 0,
      blksize: 0,
      blocks: 0,
      atime: new Date(),
      mtime: new Date(),
      ctime: new Date(),
      birthtime: new Date()
    }) : () => null;
    fs[method] = wrapAsync(originals[method], defaultReturn);
  }
});

console.log('✅ Filesystem patches applied');

module.exports = fs;