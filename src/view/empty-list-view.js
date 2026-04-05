import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const EmptyListMessages = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

export default class EmptyListView extends AbstractView {
  #filterType;

  constructor(filterType) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return `<p class="trip-events__msg">${EmptyListMessages[this.#filterType]}</p>`;
  }
}
