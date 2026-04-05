import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

export default class FiltersView extends AbstractView {
  #currentFilter;
  #onFilterChange;

  constructor(currentFilter = FilterType.EVERYTHING, onFilterChange) {
    super();
    this.#currentFilter = currentFilter;
    this.#onFilterChange = onFilterChange;

    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        <div class="trip-filters__filter">
          <input
            id="filter-everything"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="${FilterType.EVERYTHING}"
            ${this.#currentFilter === FilterType.EVERYTHING ? 'checked' : ''}
          >
          <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
        </div>
        <div class="trip-filters__filter">
          <input
            id="filter-future"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="${FilterType.FUTURE}"
            ${this.#currentFilter === FilterType.FUTURE ? 'checked' : ''}
          >
          <label class="trip-filters__filter-label" for="filter-future">Future</label>
        </div>
        <div class="trip-filters__filter">
          <input
            id="filter-present"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="${FilterType.PRESENT}"
            ${this.#currentFilter === FilterType.PRESENT ? 'checked' : ''}
          >
          <label class="trip-filters__filter-label" for="filter-present">Present</label>
        </div>
        <div class="trip-filters__filter">
          <input
            id="filter-past"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="${FilterType.PAST}"
            ${this.#currentFilter === FilterType.PAST ? 'checked' : ''}
          >
          <label class="trip-filters__filter-label" for="filter-past">Past</label>
        </div>
        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `;
  }

  #filterChangeHandler = (evt) => {
    evt.preventDefault();
    if (evt.target.tagName === 'INPUT') {
      this.#onFilterChange(evt.target.value);
    }
  };

  setDisabled(filterType, isDisabled) {
    const input = this.element.querySelector(`input[value="${filterType}"]`);
    if (input) {
      input.disabled = isDisabled;
    }
  }

  updateFilter(newFilter) {
    this.#currentFilter = newFilter;
    const inputs = this.element.querySelectorAll('input[type="radio"]');
    inputs.forEach((input) => {
      input.checked = input.value === newFilter;
    });
  }
}
