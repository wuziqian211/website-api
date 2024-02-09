'use strict';

// Adapted from pjax.js - https://github.com/MoOx/pjax - MIT License
const isLoadAvailable = url => new URL(url, window.location).origin === window.location.origin;
const replacePage = text => {
  const html = new DOMParser().parseFromString(text, 'text/html');
  if (html.querySelector('parsererror')) throw new TypeError('Cannot parse HTML');
  ['title', 'style.extra', 'div.header > div.left > span.description', 'main', 'span.time-taken'].forEach(s => document.querySelector(s).innerHTML = html.querySelector(s).innerHTML);
  document.querySelector("link[rel='apple-touch-icon']").href = html.querySelector("link[rel='apple-touch-icon']").href;
  document.body.className = html.body.className;
};
const load = (url, event) => {
  if (isLoadAvailable(url)) {
    event.preventDefault();
    loadPage(url);
  }
};
const bindLoad = () => {
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', event => load(a.href, event), { passive: false });
    a.addEventListener('keyup', event => {
      if (event.code === 'Enter') load(a.href, event);
    }, { passive: false });
  });
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', event => {
      const url = new URL(form.action, window.location);
      const params = new URLSearchParams();
      for (const e of form.elements) {
        if (e.tagName === 'INPUT' && e.type.toUpperCase() !== 'SUBMIT' && (e.type.toUpperCase() !== 'CHECKBOX' || e.checked)) {
          params.set(e.name, e.value);
        }
      }
      url.search = params;
      load(url, event);
    }, { passive: false });
  });
};
const loadPage = async url => {
  document.querySelector('main').classList.add('loading');
  document.activeElement?.blur();
  try {
    const resp = await fetch(url, { headers: { accept: 'text/html' } });
    if (isLoadAvailable(resp.url) && resp.headers.get('Content-Type')?.split(';')[0].toUpperCase() === 'TEXT/HTML') { 
      const text = await resp.text();
      replacePage(text);
      history.pushState({ text }, '', resp.url);
      document.querySelector('main').classList.remove('loading');
      bindLoad();
    } else {
      document.location.href = resp.url;
    }
  } catch (e) {
    console.error(e);
    document.location.href = url;
  }
};
window.addEventListener('popstate', event => {
  document.activeElement?.blur();
  replacePage(event.state.text);
  bindLoad();
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
