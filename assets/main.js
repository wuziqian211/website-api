'use strict';

// From pjax.js - https://github.com/MoOx/pjax
const load = async url => {
  document.querySelector('main').classList.add('loading');
  document.activeElement && document.activeElement.blur();
  try {
    const text = await (await fetch(url, {headers: {accept: 'text/html'}})).text();
    [
      {name: 'title'},
      {name: 'style', class: 'extra'},
      {name: 'span', class: 'desc'},
      {name: 'main'},
      {name: 'span', class: 'time-taken'}
    ].forEach(e => {
      const html = `<${e.name}${e.class ? ` class="${e.class}"` : ''}>`;
      const t = text.slice(text.indexOf(html) + html.length);
      document.querySelector(`${e.name}${e.class ? `.${e.class}` : ''}`).innerHTML = t.slice(0, t.indexOf(`</${e.name}>`));
    });
    history.pushState({}, '', url);
    apply();
    document.querySelector('main').classList.remove('loading');
  } catch (e) {
    document.location.href = url;
  }
};
const isAvailable = url => {
  let a = document.createElement('a');
  a.href = url;
  return a.origin === window.location.origin;
};
const aLoad = (el, event) => {
  if (isAvailable(el.href)) {
    event.preventDefault();
    load(el.href);
  }
};
const apply = () => {
  document.querySelectorAll('a').forEach(a => {
    a.onclick = event => aLoad(a, event);
    a.onkeyup = event => event.keyCode === 13 ? aLoad(a, event) : void 0;
  });
  document.querySelectorAll('form').forEach(form => {
    form.onsubmit = event => {
      var params = new URLSearchParams();
      for (let i = 0; i < form.elements.length; i++) {
        if (form.elements[i].tagName.toLowerCase() === 'input' && form.elements[i].type !== 'submit') {
          params.append(form.elements[i].name, form.elements[i].value);
        }
      }
      const url = `${form.action || window.location.origin + window.location.pathname}?${params.toString()}`;
      if (isAvailable(url)) {
        event.preventDefault();
        load(url);
      }
    };
  });
};
apply();

const runningTime = document.querySelector('span.running-time');
const updateTime = () => {
  let ts = Date.now() / 1000 - 1636816579.737;
  runningTime.innerText = `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
};
updateTime();
setInterval(updateTime, 1000);
