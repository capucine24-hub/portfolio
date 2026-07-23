import { initCaseModal } from '/src/case.js';

const popupContent = {
  xml: {
    title: 'XML Parsing',
    text:
      'The XML version helped me understand how raw structured data becomes usable app content: locating the file, reading player elements, collecting character data and converting it into native Swift objects.',
  },

  coredata: {
    title: 'Core Data',
    text:
      'The Core Data version moved the app from a fixed dataset to a persistent system, where players could be created, edited, saved, favourited and updated across screens.',
  },

  learning: {
    title: 'Why It Matters',
    text:
      'Together, the assignments showed how a sports app depends on what happens below the interface: data structure, persistence, validation, navigation and live updates.',
  },
};

initCaseModal(popupContent);