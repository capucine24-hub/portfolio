import { initCaseModal } from '/src/case.js';

import processImg from './assets/design-thinking-map.webp';
import architectureImg from './assets/app-architecture.webp';
import storyboardImg from './assets/whiteboard.webp';
import paletteImg from './assets/color-palette.webp';

const popupContent = {
  process: {
    title: 'Process Map',
    text:
      'This diagram maps the Design Thinking framework to the Ready Buddy development phases, from research and scope definition to prototyping, integration and testing.',
    images: [processImg],
  },

  architecture: {
    title: 'App Architecture',
    text:
      'This diagram shows the app structure, including the main squads, theme entry points, games folders, final quiz, chatbot view and SwiftUI file organization.',
    images: [architectureImg],
  },

  storyboard: {
    title: 'Storyboard',
    text:
      'A visual planning document used to think through the child’s journey, screen flow and learning moments.',
    images: [storyboardImg],
  },

  palette: {
    title: 'Visual Identity',
    text:
      'The Ready Buddy visual direction uses friendly colours, rounded forms and clear interface elements to make emergency learning feel less intimidating.',
    images: [paletteImg],
  },
};

initCaseModal(popupContent);