// Modern ES6+ syntax, utilizing the global `require` available via nodeIntegration
const loki = require('lokijs');
const LokiFsStructuredAdapter = require('lokijs/src/loki-fs-structured-adapter.js');

const adapter = new LokiFsStructuredAdapter();
const db = new loki('db/loki.json', {
  adapter: adapter,
  autoload: true,
  autoloadCallback: () => {
    let collection = db.getCollection('weatherEntries');
    if (!collection) {
      collection = db.addCollection('weatherEntries');
    }
    
    // Store reference globally for pagination functions
    window.allWeatherEntriesCollection = collection;

    const initialEntries = collection.chain()
      .simplesort('id')
      .sort((a, b) => b.id - a.id)
      .limit(100)
      .data();
      
    initializeTable(initialEntries);
  }
});

let page = 0;
const pageSize = 100;

const createElement = (element, text = '') => {
  const el = document.createElement(element);
  if (!['tr', 'thead', 'tbody'].includes(element)) {
    el.innerText = text;
  }
  return el;
};

const initializeTable = (entries) => {
  const pl = document.querySelector('#entryHeader');
  if (!pl) return;

  const header = createElement('tr');
  header.appendChild(createElement('td', 'ID'));
  header.appendChild(createElement('td', 'Description'));
  header.appendChild(createElement('td', 'Entry Date'));
  header.appendChild(createElement('td', 'Capture Date'));
  header.appendChild(createElement('td', 'Temp. Min.'));
  header.appendChild(createElement('td', 'Temp. Max.'));
  pl.appendChild(header);

  setPage(page);
};

const updateEntries = (entries) => {
  const entryData = document.querySelector('#entryData');
  if (!entryData) return;
  
  // Modern, cleaner way to remove all children
  entryData.innerHTML = ''; 

  entries.forEach(person => {
    const tr = createElement('tr');
    tr.appendChild(createElement('td', person.id));
    tr.appendChild(createElement('td', person.description));
    tr.appendChild(createElement('td', person.entryDate));
    tr.appendChild(createElement('td', person.captureDate));
    tr.appendChild(createElement('td', person.minimumTemperature));
    tr.appendChild(createElement('td', person.maximumTemperature));

    entryData.appendChild(tr);
  });
};

const setPage = (pageNum) => {
  console.info('setPage: ', pageNum);
  const collection = window.allWeatherEntriesCollection;
  if (!collection) return;

  const currentWeatherEntries = collection.chain()
    .simplesort('id')
    .sort((a, b) => b.id - a.id)
    .offset(pageSize * pageNum)
    .limit(pageSize)
    .data();

  updateEntries(currentWeatherEntries);
};

// Expose to window for the inline onclick handlers in index.html
window.nextPage = () => {
  const collection = window.allWeatherEntriesCollection;
  if (!collection) return;
  
  const allEntriesCount = collection.chain().data().length;

  if (((page + 1) * pageSize) < allEntriesCount) {
    page += 1;
    setPage(page);
  }
};

window.previousPage = () => {
  if (page > 0) {
    page -= 1;
    setPage(page);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const sectionSwitcher = document.querySelector('#sectionList');
  if (!sectionSwitcher) return;

  document.querySelectorAll('section[data-route]').forEach(section => {
    console.info('section found: ', section.getAttribute('data-route'));
    const li = document.createElement('li');
    li.innerText = section.getAttribute('data-route');
    sectionSwitcher.appendChild(li);
  });

  const sectionSwitchListener = e => {
    if (e.target.localName === 'li' && e.target.parentNode === sectionSwitcher) {
      const route = e.target.innerText;
      const withSection = document.querySelector(`section[data-route="${route}"]`);
      
      if (withSection) {
        document.querySelectorAll('section[data-route]').forEach(section => {
          if (section !== withSection) {
            section.setAttribute('hidden', true);
          } else {
            section.removeAttribute('hidden');
          }
        });
      }

      [...sectionSwitcher.children].forEach(li => li.removeAttribute('selected'));
      e.target.setAttribute('selected', true);
    }
  };

  sectionSwitcher.addEventListener('click', sectionSwitchListener);
  
  // Trigger click on first item if it exists
  if (sectionSwitcher.children[0]) {
    sectionSwitcher.children[0].click();
  }
});
