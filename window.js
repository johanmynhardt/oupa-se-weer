const loki = require('lokijs')
const lfsa = require('lokijs/src/loki-fs-structured-adapter.js')

let adapter = new lfsa()
let db = new loki('db/loki.json', {
  adapter: adapter,
  autoload: true,
  autoloadCallback: () => {
    people = db.getCollection('people');
    if (!people) {
      people = db.addCollection('people');
    }

    weatherEntries = people.chain()
      .simplesort('id')
      .sort((a,b) => b.id - a.id)
      .limit(100)
      .data();
  }
})

let weatherEntries = [];

let createElement = (element, text = '') => {
  let el = document.createElement(element);
  if (!(['tr', 'thead', 'tbody'].indexOf(element) > -1)) {
    el.innerText = text;
  }
  return el;
}

setTimeout(() => {

  if (!people) {
    console.error('people collection not initialised');
    return;
  }
  console.info(`people loaded: ${weatherEntries.length}`);

  let pl = document.querySelector('#peopleList');

  let header = createElement('thead');
  header.appendChild(createElement('td', 'ID'))
  header.appendChild(createElement('td', 'Description'))
  header.appendChild(createElement('td', 'Entry Date'))
  header.appendChild(createElement('td', 'Capture Date'))
  header.appendChild(createElement('td', 'Temp. Min.'))
  header.appendChild(createElement('td', 'Temp. Max.'))
  pl.appendChild(header);

  weatherEntries.forEach(person => {

    // {
    //   "id": 1,
    //   "description": " Lekker herfsweer   \n\n(Olieprys:-  $101.35)",
    //   "entryDate": "2013-05-01",
    //   "captureDate": "2013-05-01",
    //   "minimumTemperature": 5,
    //   "maximumTemperature": 26,
    //   "windEntry": {
    //     "id": 1,
    //     "description": "",
    //     "windDirection": "NORTH",
    //     "windspeed": 0,
    //     "weatherEntry": null
    //   },
    //   "rainEntry": {
    //     "id": 1,
    //     "volume": 0,
    //     "description": "",
    //     "weatherEntry": null
    //   }
    // }

    let tr = createElement('tr');
    tr.appendChild(createElement("td", person.id))
    tr.appendChild(createElement("td", person.description))
    tr.appendChild(createElement("td", person.entryDate))
    tr.appendChild(createElement("td", person.captureDate))
    tr.appendChild(createElement("td", person.minimumTemperature))
    tr.appendChild(createElement("td", person.maximumTemperature))

    //pre.appendChild(createElement('code', JSON.stringify(person, null, '  ')));
    pl.appendChild(tr);
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
