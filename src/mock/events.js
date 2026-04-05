import { EventType } from '../const.js';

const destinations = [
  {
    id: '1',
    name: 'Amsterdam',
    description: 'Amsterdam is the capital and most populous city of the Netherlands. Known for its artistic heritage, elaborate canal system and narrow houses with gabled facades.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=1', description: 'Amsterdam canal' },
      { src: 'https://loremflickr.com/248/152?random=2', description: 'Amsterdam street' },
    ],
  },
  {
    id: '2',
    name: 'Geneva',
    description: 'Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva). Surrounded by the Alps and Jura mountains, the city has views of dramatic Mont Blanc.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=3', description: 'Geneva lake' },
      { src: 'https://loremflickr.com/248/152?random=4', description: 'Geneva city' },
      { src: 'https://loremflickr.com/248/152?random=5', description: 'Geneva mountains' },
    ],
  },
  {
    id: '3',
    name: 'Chamonix',
    description: 'Chamonix-Mont-Blanc is a resort area near the junction of France, Switzerland and Italy. At the base of Mont Blanc, the highest summit in the Alps.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=6', description: 'Chamonix Alps' },
    ],
  },
  {
    id: '4',
    name: 'Paris',
    description: 'Paris, France\'s capital, is a major European city and a global center for art, fashion, culture and business. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=7', description: 'Paris Eiffel Tower' },
      { src: 'https://loremflickr.com/248/152?random=8', description: 'Paris street' },
    ],
  },
];

const offers = [
  {
    type: EventType.TAXI,
    offers: [
      { id: 'taxi-1', title: 'Order Uber', price: 20 },
      { id: 'taxi-2', title: 'Child seat', price: 5 },
    ],
  },
  {
    type: EventType.BUS,
    offers: [],
  },
  {
    type: EventType.TRAIN,
    offers: [
      { id: 'train-1', title: 'Book a taxi', price: 15 },
      { id: 'train-2', title: 'Travel class', price: 30 },
    ],
  },
  {
    type: EventType.SHIP,
    offers: [
      { id: 'ship-1', title: 'Choose meal', price: 25 },
      { id: 'ship-2', title: 'Choose cabin class', price: 80 },
    ],
  },
  {
    type: EventType.DRIVE,
    offers: [],
  },
  {
    type: EventType.FLIGHT,
    offers: [
      { id: 'flight-1', title: 'Add luggage', price: 30 },
      { id: 'flight-2', title: 'Switch to comfort class', price: 100 },
      { id: 'flight-3', title: 'Add meal', price: 15 },
    ],
  },
  {
    type: EventType.CHECK_IN,
    offers: [
      { id: 'checkin-1', title: 'Add breakfast', price: 20 },
      { id: 'checkin-2', title: 'Choose room type', price: 50 },
    ],
  },
  {
    type: EventType.SIGHTSEEING,
    offers: [
      { id: 'sightseeing-1', title: 'Book a guide', price: 40 },
      { id: 'sightseeing-2', title: 'Rent a bike', price: 10 },
    ],
  },
  {
    type: EventType.RESTAURANT,
    offers: [
      { id: 'restaurant-1', title: 'Order drink', price: 10 },
      { id: 'restaurant-2', title: 'Choose special menu', price: 25 },
    ],
  },
];

const events = [
  {
    id: '1',
    type: EventType.TAXI,
    destination: '1',
    dateFrom: '2024-03-18T10:30:00.000Z',
    dateEnd: '2024-03-18T11:00:00.000Z',
    basePrice: 20,
    offers: ['taxi-1'],
    isFavorite: true,
  },
  {
    id: '2',
    type: EventType.FLIGHT,
    destination: '2',
    dateFrom: '2024-03-19T08:00:00.000Z',
    dateEnd: '2024-03-19T10:30:00.000Z',
    basePrice: 150,
    offers: ['flight-1', 'flight-2'],
    isFavorite: false,
  },
  {
    id: '3',
    type: EventType.CHECK_IN,
    destination: '2',
    dateFrom: '2024-03-19T11:00:00.000Z',
    dateEnd: '2024-03-20T12:00:00.000Z',
    basePrice: 200,
    offers: ['checkin-1'],
    isFavorite: true,
  },
  {
    id: '4',
    type: EventType.SIGHTSEEING,
    destination: '3',
    dateFrom: '2024-03-20T14:00:00.000Z',
    dateEnd: '2024-03-20T17:00:00.000Z',
    basePrice: 50,
    offers: ['sightseeing-1'],
    isFavorite: false,
  },
];

export { destinations, offers, events };
