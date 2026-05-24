import { render, replace, remove } from '../framework/render.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #eventListContainer = null;
  #eventsModel = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #pointEditComponent = null;

  #event = null;
  #mode = Mode.DEFAULT;

  constructor({ eventListContainer, eventsModel, onDataChange, onModeChange }) {
    this.#eventListContainer = eventListContainer;
    this.#eventsModel = eventsModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(event) {
    this.#event = event;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    const destination = this.#eventsModel.getDestinationById(this.#event.destination);
    const eventOffers = this.#event.offers
      .map((id) => this.#eventsModel.getOfferById(this.#event.type, id))
      .filter(Boolean);

    this.#pointComponent = new EventView({
      event: this.#event,
      destination,
      offers: eventOffers,
      onRollupClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#pointEditComponent = new EventEditView(
      this.#event,
      this.#eventsModel.getDestinations(),
      this.#eventsModel.getOffers(),
      this.#handleFormSubmit,
      this.#handleRollupClick,
      this.#handleDelete
    );

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#eventListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  resetView() {
    if (this.#mode === Mode.EDITING) {
      this.#replaceFormToPoint();
    }
  }

  #replacePointToForm() {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeydownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeydownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  #handleEditClick = () => {
    this.#replacePointToForm();
  };

  #handleRollupClick = () => {
    this.#replaceFormToPoint();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({
      ...this.#event,
      isFavorite: !this.#event.isFavorite
    });
  };

  #handleFormSubmit = () => {
    this.#replaceFormToPoint();
  };

  #handleDelete = () => {
    this.#replaceFormToPoint();
  };
}
