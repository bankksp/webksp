import * as ReactDOM from 'react-dom';

// Polyfill findDOMNode for React 19 compatibility with legacy libraries (react-quill, react-pageflip)
try {
  const reactDomAny = ReactDOM as any;
  
  const findDOMNodePolyfill = (instance: any) => {
    if (!instance) return null;
    if (instance instanceof HTMLElement) return instance;
    return (instance as any).nativeElement || instance;
  };

  // Function to safely add the polyfill to an object
  const applyPolyfill = (obj: any) => {
    if (!obj) return;
    if (typeof obj.findDOMNode === 'undefined') {
      try {
        Object.defineProperty(obj, 'findDOMNode', {
          value: findDOMNodePolyfill,
          configurable: true,
          writable: true
        });
      } catch (e) {
        try {
          obj.findDOMNode = findDOMNodePolyfill;
        } catch (e2) {
          console.warn('Could not set findDOMNode on object:', e2);
        }
      }
    }
  };

  // Apply to the namespace
  applyPolyfill(reactDomAny);

  // Critical: Libraries like react-quill compiled to CJS/UMD might look for .default 
  // on the object returned by require('react-dom') or import * as ReactDOM
  if (typeof reactDomAny.default === 'undefined') {
    try {
      Object.defineProperty(reactDomAny, 'default', {
        value: reactDomAny,
        configurable: true,
        writable: true
      });
    } catch (e) {
      // Fallback if defineProperty fails
      try { reactDomAny.default = reactDomAny; } catch (e2) {}
    }
  }

  // Apply to the default export if it exists (or we just created it)
  if (reactDomAny.default) {
    applyPolyfill(reactDomAny.default);
  }
  
  // Also put it on window for global access (some libs might use it)
  if (typeof window !== 'undefined') {
    const windowAny = window as any;
    windowAny.ReactDOM = reactDomAny;
    applyPolyfill(windowAny.ReactDOM);
    if (windowAny.ReactDOM.default) {
      applyPolyfill(windowAny.ReactDOM.default);
    }
  }
} catch (e) {
  console.warn('Failed to polyfill findDOMNode:', e);
}
