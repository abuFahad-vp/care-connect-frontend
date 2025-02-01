import flowbitePlugin from 'flowbite/plugin'

import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
  darkMode: 'selector',
	theme: {
		extend: {
      colors: {
        // flowbite-svelte
        // primary: {
        //   50: '#FFF5F2',
        //   100: '#FFF1EE',
        //   200: '#FFE4DE',
        //   300: '#FFD5CC',
        //   400: '#FFBCAD',
        //   500: '#FE795D',
        //   600: '#EF562F',
        //   700: '#EB4F27',
        //   800: '#CC4522',
        //   900: '#A5371B'
        // }
        primary: {
            '50': '#EBF7F7', 
            '100': '#D5ECED', 
            '200': '#A3D4D6', 
            '300': '#73B9BD', 
            '400': '#2C858A', 
            '500': '#035257', 
            '600': '#02464F', 
            '700': '#013440', 
            '800': '#012733', 
            '900': '#001A26', 
            '950': '#000F1A'
        } 
      }
    }
	},

	plugins: [flowbitePlugin]
} as Config;