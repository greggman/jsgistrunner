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

  function insertInline(mainHTML, mainJS, mainCSS) {
    const style = document.createElement('style');
    style.textContent = mainCSS.content;
    (document.head || document.body || document.documentElement).appendChild(style);
    document.body.innerHTML = mainHTML.content;
    const script = document.createElement('script');
    script.type = 'module';
    script.text = mainJS.content;
    document.body.appendChild(script);
  }

  function insertInBlob(mainHTML, mainJS, mainCSS) {
    const style = document.createElement('style');
    style.textContent = mainCSS.content;
    (document.head || document.body || document.documentElement).appendChild(style);
    document.body.innerHTML = mainHTML.content;
    const blob = new Blob([mainJS.content], {type: 'application/javascript'});
    const script = document.createElement('script');
    script.type = 'module';
    script.src = URL.createObjectURL(blob);
    document.body.appendChild(script);
  }

  const handlers = {
    run(data) {
      const files = data.files;
      const mainHTML = getOrFind(files, 'index.html', 'html');
      const mainJS = getOrFind(files, 'index.js', 'js', 'js', 'javascript');
      const mainCSS = getOrFind(files, 'index.css', 'css');
      if (data.inline) {
        insertInline(mainHTML, mainJS, mainCSS);
      } else {
        insertInBlob(mainHTML, mainJS, mainCSS);
      }
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
