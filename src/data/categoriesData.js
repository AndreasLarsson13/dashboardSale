const categoriesData = {
  'Hus': {
    label: 'Hus',
    value: 'hus',
    child: [
      {
        label: 'Kök',
        value: 'kok',
        child: [
          { label: 'Värmekyl', value: 'varmekyl' },
          { label: 'Diskmaskin', value: 'diskmaskin' },
          { label: 'Kranar', value: 'kranar' },
        ],
      },
      {
        label: 'Pizza-Ugn',
        value: 'pizza-ugn',
        child: [
          { label: 'Portabel', value: 'portabel' },
        ],
      },
      {
        label: 'Värme & Kyla',
        value: 'varme-kyla',
        child: [
          { label: 'Braskamin', value: 'braskamin' },
          { label: 'Luftvärmepump', value: 'luftvarmepump' },
        ],
      },
    ],
  },
  'Fritid': {
    label: 'Fritid',
    value: 'fritid',
    child: [
      {
        label: 'Camping',
        value: 'camping',
        child: [
          { label: 'Tält', value: 'talt' },
          { label: 'Sovsäck', value: 'sovsack' },
        ],
      },
      {
        label: 'Fiske',
        value: 'fiske',
        child: [
          { label: 'Spö', value: 'spo' },
          { label: 'Köpa', value: 'kopa' },
        ],
      },
    ],
  },
  'Trädgård': {
    label: 'Trädgård',
    value: 'tradgard',
    child: [
      {
        label: 'Plantering',
        value: 'plantering',
        child: [
          { label: 'Blommor', value: 'blommor' },
          { label: 'Grönsaker', value: 'gronsaker' },
        ],
      },
      {
        label: 'Utemöbler',
        value: 'utemobler',
        child: [
          { label: 'Soffa', value: 'soffa' },
          { label: 'Stolar', value: 'stolar' },
        ],
      },
    ],
  },
};

export default categoriesData;
