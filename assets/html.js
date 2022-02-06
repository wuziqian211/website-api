module.exports = data => `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0078B7" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#000064" media="(prefers-color-scheme: dark)" />
    <title>${data.title} | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/assets/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/assets/animate.min.css" />
    <script src="/assets/pjax.min.js"></script>
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <div class="data-pjax">${data.data}
    </div>
    <script>
      const pjax = new Pjax({selectors: ['title', '.data-pjax'], cacheBust: false});
      document.addEventListener('pjax:send', () => document.querySelectorAll('.animate__animated').forEach(e => {
        e.classList.remove('animate__fadeIn');
        e.classList.add('animate__fadeOut');
      }));
      document.addEventListener('pjax:error', () => document.location.href = event.request.responseURL);
    </script>
  </body>
</html>`;
