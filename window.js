const loki = require('lokijs')
const lfsa = require('lokijs/src/loki-fs-structured-adapter.js')

let adapter = new lfsa()
let db = new loki('db/loki.json', {
  adapter: adapter,
  autoload: true,
  autoloadCallback: () => {
    people = db.getCollection('people');
  }
})

let people = [];

let createElement = (element, text = '') => {
  let el = document.createElement(element);
  el.innerText = text;
  return el;
}

setTimeout(() => {
  console.info(`people loaded: ${JSON.stringify(people.data)}`);

  let pl = document.querySelector('#peopleList');

  people.data.forEach(person => {
    let pre = createElement('pre');

    pre.appendChild(createElement('code', JSON.stringify(person, null, '  ')));
    pl.appendChild(pre);
  })


}, 1000);

window.addEventListener('load', () => {

  let sectionSwitcher = document.querySelector('#sectionList');

  document.querySelectorAll('section[data-route]').forEach(section => {
    console.info('section found: ', section.getAttribute('data-route'));
    let li = document.createElement('li');
    li.innerText = section.getAttribute('data-route');
    sectionSwitcher.appendChild(li);
  })

  //sectionSwitcher.children[0].setAttribute('selected', true);

  let sectionSwitchListener = e => {

    if (e.target.localName === 'li' && e.target.parentNode === sectionSwitcher) {
      let withSection = document.querySelector(`section[data-route=${e.target.innerText}]`);
      if (withSection) {
        document.querySelectorAll('section[data-route]').forEach(section => {
          if (section !== withSection) {
            section.setAttribute('hidden', true);
          } else {
            section.removeAttribute('hidden');
          }
        });
      }

      [...sectionSwitcher.children].forEach(li => li.removeAttribute('selected'))

      e.target.setAttribute('selected', true);
    }
  }

  document.addEventListener('click', sectionSwitchListener);
  sectionSwitcher.children[0].click();
});
