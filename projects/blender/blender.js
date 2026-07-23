import { initCaseModal } from '/src/case.js';

import storyboardImg from './assets/storyboard.webp';
import moodboardImg from './assets/moodboard.webp';
import characterSheetImg from './assets/character-sheet.webp';
import atlasImg from './assets/atlas-turnaround.webp';
import nyxImg from './assets/nyx-turnaround.webp';
import thalloImg from './assets/thallo-turnaround.webp';

const popupContent = {
  storyboard: {
    title: 'Storyboard',
    text:
      'The original storyboard helped structure the emotional arc of the animation, even though the final version changed during production.',
    images: [storyboardImg],
  },

  moodboard: {
    title: 'Moodboard',
    text:
      'This moodboard helped define the atmosphere of the project: UFO imagery, seasonal transitions, alien references, autumn warmth, winter blue tones and soft spring light.',
    images: [moodboardImg],
  },

  characters: {
    title: 'Character Sheet',
    text:
      'The character sheet maps the main roles and symbolism of Atlas, Nyx and Thallo.',
    images: [characterSheetImg],
  },

  atlas: {
    title: 'Atlas',
    text:
      'Atlas was designed as the emotional anchor of the story: a student moving through confusion, pressure and growth.',
    images: [atlasImg],
  },

  nyx: {
    title: 'Nyx',
    text:
      'Nyx represents darkness and emotional pressure, with a sharper and more unsettling silhouette.',
    images: [nyxImg],
  },

  thallo: {
    title: 'Thallo',
    text:
      'Thallo represents growth and calm, with a rounder and more approachable design.',
    images: [thalloImg],
  },
};

initCaseModal(popupContent);