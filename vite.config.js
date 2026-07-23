import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/portfolio/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        readyBuddy: resolve(__dirname, 'projects/ready-buddy/index.html'),
        masterTravel: resolve(__dirname, 'projects/master-travel/index.html'),
        blender: resolve(__dirname, 'projects/blender/index.html'),
        webxrClassroom: resolve(__dirname, 'projects/webxr-classroom/index.html'),
        rugbyIosApps: resolve(__dirname, 'projects/rugby-ios-apps/index.html'),
        indeedRedesign: resolve(__dirname, 'projects/indeed-redesign/index.html'),
        careerFilter: resolve(__dirname, 'projects/career-filter/index.html'),
        p5js: resolve(__dirname, 'projects/p5js/index.html'),
      },
    },
  },
});