(function() {
  window.parent.postMessage({
    type: 'gimmeDaCodez',
  }, "*");

  // forward messages from iframe to parent
  window.addEventListener('message', (e) => {
    window.parent.postMessage(e.data, "*");
  });

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
    style.textContent = `
html, body, iframe {
  width: 100%;
  height: 100%;
  margin: 0;
}
iframe {
  border: none;
  display: block;
  width: 100%;
  height: 100%;
}
`;
    document.head.appendChild(style);
    const iframe = document.createElement('iframe');
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>jsGist runner frame</title>
    <style>
${mainCSS.content}
    </style>
    <script src="https://jsgistrunner.devcomments.org/helper.js" type="module"></script>
  </head>
  <body>
${mainHTML.content}
  </body>
  <${'script'} type="module">
${mainJS.content}
  </${'script'}>
</html>
`;
    const blob = new Blob([html], {type: 'text/html'});
    document.body.appendChild(iframe);
    iframe.src = URL.createObjectURL(blob);
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
