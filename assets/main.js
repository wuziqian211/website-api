'use strict';

// Adapted from pjax.js - https://github.com/MoOx/pjax - MIT License
const isLoadAvailable = url => new URL(url, window.location).origin === window.location.origin;
const isValidPage = html => !html.querySelector('parsererror') && ['title', "link[rel='apple-touch-icon']", 'div.header > div.left > span.description', 'main', 'span.time-taken'].every(s => html.querySelector(s));
const replacePage = html => {
  ['title', 'div.header > div.left > span.description', 'main', 'span.time-taken'].forEach(s => document.querySelector(s).innerHTML = html.querySelector(s).innerHTML);
  document.querySelector("link[rel='apple-touch-icon']").href = html.querySelector("link[rel='apple-touch-icon']").href;
  document.body.className = html.body.className;
  document.body.style.backgroundImage = html.body.style.backgroundImage;
};
const bindLoad = () => {
  if (bindController) bindController.abort();
  bindController = new AbortController();
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', event => {
      if (isLoadAvailable(a.href)) {
        event.preventDefault();
        loadPage(a.href);
      }
    }, { passive: false, signal: bindController.signal });
    a.addEventListener('keyup', event => {
      if (event.code === 'Enter' && isLoadAvailable(a.href)) {
        event.preventDefault();
        loadPage(a.href);
      }
    }, { passive: false, signal: bindController.signal });
  });
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', event => {
      const url = new URL(form.action, window.location);
      if (isLoadAvailable(url)) {
        event.preventDefault();
        const params = new URLSearchParams();
        for (const e of form.elements) {
          if (e.tagName === 'INPUT' && e.type.toUpperCase() !== 'SUBMIT' && (e.type.toUpperCase() !== 'CHECKBOX' || e.checked)) {
            params.set(e.name, e.value);
          }
        }
        url.search = params;
        loadPage(url);
      }
    }, { passive: false, signal: bindController.signal });
  });
};
const loadPage = async url => {
  if (loadController) loadController.abort();
  loadController = new AbortController();
  const urlObj = new URL(url, window.location);
  if (urlObj.origin === window.location.origin && (urlObj.pathname.startsWith('/api/') || urlObj.pathname === '/api') && !urlObj.searchParams.has('type')) {
    urlObj.searchParams.set('type', 'html');
  }
  if (isValidPage(document)) {
    document.querySelector('main').classList.add('loading');
    document.activeElement?.blur();
    try {
      const resp = await fetch(urlObj, { keepalive: true, signal: loadController.signal });
      if (isLoadAvailable(resp.url) && resp.headers.get('Content-Type')?.split(';')[0].toUpperCase() === 'TEXT/HTML') { 
        const text = await resp.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        if (isValidPage(html)) {
          history.pushState({ text }, '', resp.url);
          replacePage(html);
          bindLoad();
          document.querySelector('main').classList.remove('loading');
          return true;
        }
      } else {
        window.location.href = resp.url;
        document.querySelector('main').classList.remove('loading');
        return false;
      }
    } catch (e) {
      console.error(e);
      if (e instanceof DOMException && e.name === 'AbortError') return false;
    }
  }
  window.location.href = urlObj;
  document.querySelector('main').classList.remove('loading');
  return false;
};
let bindController, loadController;
window.addEventListener('popstate', event => {
  document.querySelector('main').classList.remove('loading');
  if (isValidPage(document)) {
    document.activeElement?.blur();
    const html = new DOMParser().parseFromString(event.state.text, 'text/html');
    replacePage(html);
    bindLoad();
  } else {
    window.location.reload();
  }
}, { passive: true });
history.replaceState({ text: document.documentElement.outerHTML }, '');
bindLoad();

const runningTime = document.querySelector('span.running-time');
const updateTime = () => {
  const ts = Date.now() / 1000 - 1636816579.737;
  runningTime.innerText = `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
};
updateTime();
setInterval(updateTime, 1000);
