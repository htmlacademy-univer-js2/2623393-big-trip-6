import { render } from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EventEditView from '../view/event-edit-view.js';
import EventView from '../view/event-view.js';

export default class MainPresenter {
  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');

    const filtersComponent = new FiltersView();
    render(filtersComponent, filtersContainer);

    const sortComponent = new SortView();
    render(sortComponent, eventsSection);

    const listContainer = document.createElement('ul');
    listContainer.classList.add('trip-events__list');
    eventsSection.append(listContainer);

    const editComponent = new EventEditView();
    const editListItem = document.createElement('li');
    editListItem.classList.add('trip-events__item');
    render(editComponent, editListItem);
    listContainer.append(editListItem);

    for (let i = 0; i < 3; i++) {
      const eventComponent = new EventView();
      const eventListItem = document.createElement('li');
      eventListItem.classList.add('trip-events__item');
      render(eventComponent, eventListItem);
      listContainer.append(eventListItem);
    }
  }
}
