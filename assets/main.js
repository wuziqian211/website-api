'use strict';

// From pjax.js - https://github.com/MoOx/pjax
const isLoadAvailable = url => new URL(url, window.location.href).origin === window.location.origin;
const replacePage = text => {
  const html = new DOMParser().parseFromString(text, 'text/html');
  ['title', 'style.extra', 'span.desc', 'main', 'span.time-taken'].forEach(s => document.querySelector(s).innerHTML = html.querySelector(s).innerHTML);
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
    applyLoad();
    document.querySelector('main').classList.remove('loading');
  } catch (e) {
    console.error(e);
    document.location.href = url;
  }
};
history.replaceState({ text: document.documentElement.outerHTML }, '');
window.onpopstate = event => {
  document.activeElement?.blur();
  replacePage(event.state.text);
  applyLoad();
};
const aLoad = (el, event) => {
  if (isLoadAvailable(el.href)) {
    event.preventDefault();
    loadPage(el.href);
  }
};
const applyLoad = () => {
  document.querySelectorAll('a').forEach(a => {
    a.onclick = event => aLoad(a, event);
    a.onkeyup = event => event.code === 'Enter' && aLoad(a, event);
  });
  document.querySelectorAll('form').forEach(form => {
    form.onsubmit = event => {
      let params = new URLSearchParams();
      for (let e of form.elements) {
        if (e.tagName.toLowerCase() === 'input' && e.type !== 'submit') {
          params.append(e.name, e.value);
        }
      }
      const url = `${form.getAttribute('action') || ''}?${params.toString()}`;
      if (isLoadAvailable(url)) {
        event.preventDefault();
        loadPage(url);
      }
    };
  });
};
applyLoad();

const runningTime = document.querySelector('span.running-time');
const updateTime = () => {
  let ts = Date.now() / 1000 - 1636816579.737;
  runningTime.innerText = `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
};
updateTime();
setInterval(updateTime, 1000);
