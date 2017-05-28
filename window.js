const loki = require('lokijs')
const lfsa = require('lokijs/src/loki-fs-structured-adapter.js')

let adapter = new lfsa()
let db = new loki('db/loki.json', {
  adapter: adapter,
  autoload: true,
  autoloadCallback: () => {
    allWeatherEntries = db.getCollection('weatherEntries');
    if (!allWeatherEntries) {
      allWeatherEntries = db.addCollection('weatherEntries');
    }

    weatherEntries = allWeatherEntries.chain()
      .simplesort('id')
      .sort((a, b) => b.id - a.id)
      .limit(100)
      .data();
  }
})

let allWeatherEntries = [];
let weatherEntries = [];
let page = 0;
let pageSize = 100;

let createElement = (element, text = '') => {
  let el = document.createElement(element);
  if (!(['tr', 'thead', 'tbody'].indexOf(element) > -1)) {
    el.innerText = text;
  }
  return el;
}

setTimeout(() => {

  if (!weatherEntries) {
    console.error('allWeatherEntries collection not initialised');
    return;
  }

  let pl = document.querySelector('#entryHeader');

  let header = createElement('tr');

  header.appendChild(createElement('td', 'ID'))
  header.appendChild(createElement('td', 'Description'))
  header.appendChild(createElement('td', 'Entry Date'))
  header.appendChild(createElement('td', 'Capture Date'))
  header.appendChild(createElement('td', 'Temp. Min.'))
  header.appendChild(createElement('td', 'Temp. Max.'))
  pl.appendChild(header);

  setPage(page);
}, 1000);

window.addEventListener('load', () => {

  let sectionSwitcher = document.querySelector('#sectionList');

  document.querySelectorAll('section[data-route]').forEach(section => {
    console.info('section found: ', section.getAttribute('data-route'));
    let li = document.createElement('li');
    li.innerText = section.getAttribute('data-route');
    sectionSwitcher.appendChild(li);
  })

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

function updateEntries(entries) {
  let entryData = document.querySelector('#entryData');
  [...entryData.children].forEach(child => child.remove());

  entries.forEach(person => {
    let tr = createElement('tr');
    tr.appendChild(createElement("td", person.id))
    tr.appendChild(createElement("td", person.description))
    tr.appendChild(createElement("td", person.entryDate))
    tr.appendChild(createElement("td", person.captureDate))
    tr.appendChild(createElement("td", person.minimumTemperature))
    tr.appendChild(createElement("td", person.maximumTemperature))

    entryData.appendChild(tr);
  })
}

function setPage(pageNum) {
  console.info('setPage: ', pageNum);
  weatherEntries = allWeatherEntries.chain()
    .simplesort('id')
    .sort((a, b) => b.id - a.id)
    .offset((pageSize * pageNum))
    .limit(pageSize)
    .data();

  updateEntries(weatherEntries);
}

function nextPage() {
  let allEntries = allWeatherEntries.chain().data().length;

  if (((page + 1) * pageSize) < allEntries) {
    page = page + 1;
    setPage(page);
  }
};

function previousPage() {
  if (page > 0) {
    page = page - 1;
    setPage(page);
  }
}
