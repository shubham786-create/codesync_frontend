/**
 * CodeSync Preview Bundler
 * Resolves relative CSS & JavaScript imports and inlines them into a sandboxed HTML bundle
 * with an injected defensive console interceptor.
 */

const CONSOLE_INTERCEPTOR_SCRIPT = `
<script>
(function() {
  function safeSerialize(arg, depth) {
    depth = depth || 0;
    if (depth > 2) return '[Object]';
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'symbol') return arg.toString();
    if (typeof arg === 'function') return '[Function: ' + (arg.name || 'anonymous') + ']';
    if (typeof arg === 'bigint') return arg.toString() + 'n';
    if (arg instanceof Error) return arg.name + ': ' + arg.message + (arg.stack ? '\\n' + arg.stack : '');
    if (typeof arg === 'object') {
      if (arg.nodeType) return '<' + arg.nodeName.toLowerCase() + (arg.id ? '#' + arg.id : '') + '>';
      try {
        if (Array.isArray(arg)) {
          return '[' + arg.map(function(i) { return safeSerialize(i, depth + 1); }).join(', ') + ']';
        }
        var entries = Object.keys(arg).slice(0, 30).map(function(k) {
          return k + ': ' + safeSerialize(arg[k], depth + 1);
        });
        return '{ ' + entries.join(', ') + ' }';
      } catch (e) {
        return '[Circular Object]';
      }
    }
    return String(arg);
  }

  function sendLog(level, args) {
    try {
      var serialized = Array.from(args).map(function(a) { return safeSerialize(a); });
      var now = new Date();
      var timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      window.parent.postMessage({
        type: 'CODESYNC_CONSOLE_LOG',
        level: level,
        message: serialized.join(' '),
        time: timeStr
      }, '*');
    } catch (e) {}
  }

  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  var origInfo = console.info;

  console.log = function() { sendLog('log', arguments); if (origLog) origLog.apply(console, arguments); };
  console.warn = function() { sendLog('warn', arguments); if (origWarn) origWarn.apply(console, arguments); };
  console.error = function() { sendLog('error', arguments); if (origError) origError.apply(console, arguments); };
  console.info = function() { sendLog('info', arguments); if (origInfo) origInfo.apply(console, arguments); };

  window.addEventListener('error', function(event) {
    sendLog('error', [event.error ? event.error : (event.message + ' at line ' + event.lineno)]);
  });

  window.addEventListener('unhandledrejection', function(event) {
    sendLog('error', ['Unhandled Promise Rejection: ' + safeSerialize(event.reason)]);
  });
})();
</script>
`;

export function bundlePreview(files = [], preferredEntry = 'index.html') {
  if (!files || files.length === 0) {
    throw new Error('Workspace contains no files to preview.');
  }

  // 1. Locate HTML entry file
  let htmlFile = files.find(
    (f) => f.name.toLowerCase() === preferredEntry.toLowerCase() && f.type === 'file'
  );

  if (!htmlFile) {
    // Fallback: any HTML file
    htmlFile = files.find((f) => f.name.toLowerCase().endsWith('.html') && f.type === 'file');
  }

  if (!htmlFile) {
    throw new Error(
      'No HTML entry file found in workspace. Create an "index.html" file to run the web preview.'
    );
  }

  let htmlContent = htmlFile.content || '';

  // 2. Build map of workspace files by name and normalized paths
  const fileMap = new Map();
  files.forEach((f) => {
    if (f.type === 'file') {
      fileMap.set(f.name.toLowerCase(), f.content || '');
      fileMap.set(f.path.toLowerCase(), f.content || '');
      // Strip leading slash for relative matching
      fileMap.set(f.path.replace(/^\//, '').toLowerCase(), f.content || '');
      fileMap.set('./' + f.path.replace(/^\//, '').toLowerCase(), f.content || '');
    }
  });

  // 3. Inline CSS links: <link rel="stylesheet" href="...">
  htmlContent = htmlContent.replace(
    /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>|<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*\/?>/gi,
    (match, href1, href2) => {
      const href = (href1 || href2 || '').trim().toLowerCase();
      if (fileMap.has(href)) {
        const cssContent = fileMap.get(href);
        return `\n<style data-source="${href}">\n/* [Inlined CSS from ${href}] */\n${cssContent}\n</style>\n`;
      }
      return match;
    }
  );

  // 4. Inline Script tags: <script src="..."></script>
  htmlContent = htmlContent.replace(
    /<script\s+[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi,
    (match, src) => {
      const srcPath = (src || '').trim().toLowerCase();
      if (fileMap.has(srcPath)) {
        const jsContent = fileMap.get(srcPath);
        return `\n<script data-source="${srcPath}">\n/* [Inlined JS from ${srcPath}] */\n${jsContent}\n</script>\n`;
      }
      return match;
    }
  );

  // 5. Inject console interceptor at top of <head> or <html>
  if (htmlContent.includes('<head>')) {
    htmlContent = htmlContent.replace('<head>', `<head>\n${CONSOLE_INTERCEPTOR_SCRIPT}\n`);
  } else if (htmlContent.includes('<html>')) {
    htmlContent = htmlContent.replace('<html>', `<html>\n<head>${CONSOLE_INTERCEPTOR_SCRIPT}</head>\n`);
  } else {
    htmlContent = `<head>${CONSOLE_INTERCEPTOR_SCRIPT}</head>\n` + htmlContent;
  }

  return htmlContent;
}
