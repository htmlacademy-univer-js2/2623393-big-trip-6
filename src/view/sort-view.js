import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';

export default class SortView extends AbstractView {
  #currentSort;
  #onSortChange;

  constructor(currentSort = SortType.DAY, onSortChange) {
    super();
    this.#currentSort = currentSort;
    this.#onSortChange = onSortChange;

    this.element.addEventListener('change', this.#sortChangeHandler);
  }

  get template() {
    return `
      <form class="trip-events__trip-sort trip-sort" action="#" method="get">
        <div class="trip-sort__item trip-sort__item--day">
          <input
            id="sort-day"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="${SortType.DAY}"
            ${this.#currentSort === SortType.DAY ? 'checked' : ''}
          >
          <label class="trip-sort__btn" for="sort-day">Day</label>
        </div>
        <div class="trip-sort__item trip-sort__item--event">
          <input
            id="sort-event"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="${SortType.EVENT}"
            disabled
          >
          <label class="trip-sort__btn" for="sort-event">Event</label>
        </div>
        <div class="trip-sort__item trip-sort__item--time">
          <input
            id="sort-time"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="${SortType.TIME}"
            ${this.#currentSort === SortType.TIME ? 'checked' : ''}
          >
          <label class="trip-sort__btn" for="sort-time">Time</label>
        </div>
        <div class="trip-sort__item trip-sort__item--price">
          <input
            id="sort-price"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="${SortType.PRICE}"
            ${this.#currentSort === SortType.PRICE ? 'checked' : ''}
          >
          <label class="trip-sort__btn" for="sort-price">Price</label>
        </div>
        <div class="trip-sort__item trip-sort__item--offer">
          <input
            id="sort-offer"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="${SortType.OFFER}"
            disabled
          >
          <label class="trip-sort__btn" for="sort-offer">Offers</label>
        </div>
      </form>
    `;
  }

  #sortChangeHandler = (evt) => {
    evt.preventDefault();
    if (evt.target.tagName === 'INPUT' && !evt.target.disabled) {
      this.#onSortChange(evt.target.value);
    }
  };
}
