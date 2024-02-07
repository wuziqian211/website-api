'use strict';

// From pjax.js - https://github.com/MoOx/pjax
const isLoadAvailable = url => new URL(url, window.location).origin === window.location.origin;
const replacePage = text => {
  const html = new DOMParser().parseFromString(text, 'text/html');
  if (html.querySelector('parsererror')) throw new TypeError('Cannot parse HTML');
  ['title', "link[rel='apple-touch-icon']", 'style.extra', 'div.header > div.left > span.description', 'main', 'span.time-taken'].forEach(s => document.querySelector(s).outerHTML = html.querySelector(s).outerHTML);
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
    a.onclick = event => load(a.href, event),
    a.onkeyup = event => {
      if (event.code === 'Enter') load(a.href, event);
    };
  });
  document.querySelectorAll('form').forEach(form => {
    form.onsubmit = event => {
      const url = new URL(form.action, window.location);
      const params = new URLSearchParams(url.search);
      for (const e of form.elements) {
        if (e.tagName.toLowerCase() === 'input' && e.type !== 'submit') {
          params.set(e.name, e.value);
        }
      }
      url.search = params;
      load(url, event);
    };
  });
};
const loadPage = async url => {
  document.querySelector('main').classList.add('loading');
  document.activeElement?.blur();
  try {
    const resp = await fetch(url, { headers: { accept: 'text/html' } });
    if (!isLoadAvailable(resp.url)) {
      document.location.href = resp.url;
      return;
    }
    const text = await resp.text();
    replacePage(text);
    history.pushState({ text }, '', resp.url);
    bindLoad();
  } catch (e) {
    console.error(e);
    document.location.href = url;
  }
};
window.onpopstate = event => {
  document.activeElement?.blur();
  replacePage(event.state.text);
  bindLoad();
};
history.replaceState({ text: document.documentElement.outerHTML }, '');
bindLoad();

const runningTime = document.querySelector('span.running-time');
const updateTime = () => {
  const ts = Date.now() / 1000 - 1636816579.737;
  runningTime.innerText = `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
};
updateTime();
setInterval(updateTime, 1000);
