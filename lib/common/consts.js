const _platform = process.platform;

exports._platform = process.platform;
exports._linux = _platform === 'linux';
exports._darwin = _platform === 'darwin';
exports._windows = _platform === 'win32';
exports._freebsd = _platform === 'freebsd';
exports._openbsd = _platform === 'openbsd';
exports._netbsd = _platform === 'netbsd';
exports._sunos = _platform === 'sunos';
