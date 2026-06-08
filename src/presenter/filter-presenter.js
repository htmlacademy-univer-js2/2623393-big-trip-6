import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #onFilterChange = null;
  #onSortReset = null;

  #filterComponent = null;

  constructor({ filterContainer, filterModel, onFilterChange, onSortReset }) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#onFilterChange = onFilterChange;
    this.#onSortReset = onSortReset;

    this.#filterModel.addObserver(this.#modelEventHandler);
  }

  init() {
    const currentFilter = this.#filterModel.getFilter();

    this.#filterComponent = new FiltersView(
      currentFilter,
      this.#filterTypeChangeHandler
    );

    render(this.#filterComponent, this.#filterContainer);
  }

  #filterTypeChangeHandler = (filterType) => {
    if (this.#filterModel.getFilter() === filterType) {
      return;
    }
    this.#filterModel.setFilter(filterType);
    this.#onSortReset?.();
    this.#onFilterChange?.();
  };

  #modelEventHandler = () => {
    this.#filterComponent.updateFilter(this.#filterModel.getFilter());
  };

  setFilterDisabled(filterType, isDisabled) {
    this.#filterComponent.setDisabled(filterType, isDisabled);
  }
}
