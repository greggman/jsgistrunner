(function() {
  window.parent.postMessage({
    type: 'gimmeDaCodez',
  }, "*");

  function find(files, endings) {
    // calling toLowerCase a bunch is bad but there will never be more than a few files
    for (const ending of endings) {
      const file = files.find(file => file.name.toLowerCase().endsWith(ending.toLowerCase()));
      if (file) {
        return file;
      }
    }
    return '';
  }

  function getOrFind(files, name, ...endings) {
    return files.find(f => f.name.toLowerCase() === name.toLowerCase) || find(files, endings);
  }

  const handlers = {
    run(data) {
      const files = data.files;
      const mainHTML = getOrFind(files, 'index.html', 'html');
      const mainJS = getOrFind(files, 'index.js', 'js', 'js', 'javascript');
      const mainCSS = getOrFind(files, 'index.css', 'css');
      const style = document.createElement('style');
      style.textContent = mainCSS;
      (document.head || document.body || document.documentElement).appendChild(style);
      document.body.innerHTML = mainHTML;
      const script = document.createElement('script');
      script.type = 'module';
      script.text = mainJS;
      document.body.appendChild(script);
    },
  };

  window.addEventListener('message', (e) => {
    const {type, data} = e.data;
    const fn = handlers[type];
    if (fn) {
      fn(data);
    }
  })
})();
