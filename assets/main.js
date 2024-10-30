'use strict';

// AJAX 导航，改编自 pjax.js（https://github.com/MoOx/pjax，MIT License）

/**
 * 指定的 URL 是否与当前页面 URL 同源
 * @param {string | URL} url
 * @returns {boolean}
 */
const isLoadAvailable = url => new URL(url, window.location.href).origin === window.location.origin;

/**
 * 页面是否可被替换
 * @param {Document} html
 * @returns {boolean}
 */
const isValidPage = html => !html.querySelector('parsererror') && ['title', "link[rel='apple-touch-icon']", 'div.header > div.left > span.description', 'main', 'span.time-taken'].every(s => html.querySelector(s));

/**
 * 替换页面内容
 * @param {Document} html
 */
const replacePage = html => {
  ['title', 'div.header > div.left > span.description', 'main', 'span.time-taken'].forEach(s => { /** @type HTMLElement */(document.querySelector(s)).innerHTML = /** @type HTMLElement */(html.querySelector(s)).innerHTML; });
  /** @type HTMLLinkElement */(document.querySelector("link[rel='apple-touch-icon']")).href = /** @type HTMLLinkElement */(html.querySelector("link[rel='apple-touch-icon']")).href;
  document.body.className = html.body.className;
  document.body.style.backgroundImage = html.body.style.backgroundImage;
};

/**
 * 加载页面
 * @param {string | URL} url
 * @returns {Promise<boolean>}
 */
const loadPage = async url => {
  if (loadController) loadController.abort();
  loadController = new AbortController();
  const urlObj = new URL(url, window.location.href);
  if (urlObj.origin === window.location.origin && (urlObj.pathname.startsWith('/api/') || urlObj.pathname === '/api') && !urlObj.searchParams.has('type')) {
    urlObj.searchParams.set('type', 'html');
  }
  if (isValidPage(document)) {
    mainElement.classList.add('loading');
    /** @type HTMLElement */(document.activeElement)?.blur();
    try {
      const resp = await fetch(urlObj, { keepalive: true, signal: loadController.signal });
      if (isLoadAvailable(resp.url) && resp.headers.get('Content-Type')?.split(';')[0].toUpperCase() === 'TEXT/HTML') {
        const text = await resp.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        if (isValidPage(html)) {
          history.pushState({ text }, '', resp.url);
          replacePage(html);
          mainElement.classList.remove('loading');
          return true;
        }
      } else {
        window.location.href = resp.url;
        mainElement.classList.remove('loading');
        return false;
      }
    } catch (e) {
      console.error(e);
      if (e instanceof DOMException && e.name === 'AbortError') return false;
    }
  }
  window.location.href = urlObj.href;
  mainElement.classList.remove('loading');
  return false;
};

/**
 * 给 `<a>` 元素绑定事件
 * @param {HTMLAnchorElement} a
 */
const bindAnchorElement = a => {
  a.addEventListener('click', event => {
    if (isLoadAvailable(a.href)) {
      event.preventDefault();
      loadPage(a.href);
    }
  }, { passive: false });
  a.addEventListener('keyup', event => {
    if (event.code === 'Enter' && isLoadAvailable(a.href)) {
      event.preventDefault();
      loadPage(a.href);
    }
  }, { passive: false });
};

/**
 * 给 `<form>` 元素绑定事件
 * @param {HTMLFormElement} form
 */
const bindFormElement = form => {
  form.addEventListener('submit', event => {
    const url = new URL(form.action, window.location.href);
    if (isLoadAvailable(url)) {
      event.preventDefault();
      const params = new URLSearchParams(url.searchParams);
      for (const e of form.elements) {
        if (e.tagName === 'INPUT') {
          const input = /** @type HTMLInputElement */(e);
          if (input.type.toUpperCase() !== 'SUBMIT') {
            if (input.type.toUpperCase() === 'CHECKBOX' && !input.checked) {
              params.delete(input.name);
            } else {
              params.set(input.name, input.value);
            }
          }
        }
      }
      url.search = params.toString();
      loadPage(url);
    }
  }, { passive: false });
};

/**
 * 给 `<img>` 元素绑定事件，使图片在加载完毕前模糊
 * @param {HTMLImageElement} img
 */
const bindImageElement = img => {
  img.style.filter = 'blur(10px)';
  img.addEventListener('load', () => {
    img.style.filter = '';
  });
  img.addEventListener('error', () => {
    switch (img.className) {
      case 'face':
        img.src = '/assets/noface.jpg';
        break;
      case 'vpic':
      case 'spic':
      case 'ppic':
        img.src = '/assets/nocover.png';
        break;
    }
  });
  if (img.complete) img.style.filter = '';
};

let loadController;
window.addEventListener('popstate', event => {
  mainElement.classList.remove('loading');
  if (isValidPage(document)) {
    /** @type HTMLElement */(document.activeElement)?.blur();
    const html = new DOMParser().parseFromString(event.state.text, 'text/html');
    replacePage(html);
  } else {
    window.location.reload();
  }
}, { passive: true });
history.replaceState({ text: document.documentElement.outerHTML }, '');

document.querySelectorAll('a').forEach(bindAnchorElement);
document.querySelectorAll('form').forEach(bindFormElement);
document.querySelectorAll('img').forEach(bindImageElement);

/** @param {Node} node */
const bindElement = node => {
  if (node instanceof HTMLElement) {
    if (node instanceof HTMLAnchorElement) {
      bindAnchorElement(node);
    } else if (node instanceof HTMLFormElement) {
      bindFormElement(node);
    } else if (node instanceof HTMLImageElement) {
      bindImageElement(node);
    }
    if (node.children.length) Array.from(node.children).forEach(bindElement);
  }
};

/**
 * 监视 DOM 树的变化
 */
const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.type === 'childList') m.addedNodes.forEach(bindElement);
  }
});
observer.observe(document.body, { childList: true, subtree: true });

const runningTimeElement = /** @type HTMLSpanElement */(document.querySelector('span.running-time')),
      mainElement = /** @type HTMLElement */(document.querySelector('main'));
const updateTime = () => {
  const ts = Date.now() / 1000 - 1636816579.737;
  runningTimeElement.innerText = `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
};
updateTime();
setInterval(updateTime, 1000);
