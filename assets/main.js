'use strict';

// From pjax.js - https://github.com/MoOx/pjax
const isLoadAvailable = url => new URL(url, window.location.href).origin === window.location.origin;
const replacePage = text => {
  const html = new DOMParser().parseFromString(text, 'text/html');
  ['title', 'style.extra', 'div.header span.description', 'main', 'span.time-taken'].forEach(s => document.querySelector(s).innerHTML = html.querySelector(s).innerHTML);
};
const load = (url, event) => {
  if (isLoadAvailable(url)) {
    event.preventDefault();
    loadPage(url);
  }
};
const bindLoad = () => {
  document.querySelectorAll('a').forEach(a => {
    a.onclick = event => load(a.href, event);
    a.onkeyup = event => event.code === 'Enter' && load(a.href, event);
  });
  document.querySelectorAll('form').forEach(form => {
    form.onsubmit = event => {
      let params = new URLSearchParams();
      for (const e of form.elements) {
        if (e.tagName.toLowerCase() === 'input' && e.type !== 'submit') {
          params.append(e.name, e.value);
        }
      }
      load(`${form.getAttribute('action') || ''}?${params.toString()}`, event);
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
    history.pushState({ text }, '', resp.url);
    replacePage(text);
    bindLoad();
    document.querySelector('main').classList.remove('loading');
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
