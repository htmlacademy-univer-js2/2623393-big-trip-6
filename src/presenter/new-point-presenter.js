import { render, remove } from '../framework/render.js';
import NewPointView from '../view/new-point-view.js';
import { EventType } from '../const.js';

export default class NewPointPresenter {
  #eventListContainer = null;
  #eventsModel = null;
  #onClose = null;
  #onSave = null;

  #newPointComponent = null;

  constructor({ eventListContainer, eventsModel, onClose, onSave }) {
    this.#eventListContainer = eventListContainer;
    this.#eventsModel = eventsModel;
    this.#onClose = onClose;
    this.#onSave = onSave;
  }

  init() {
    if (this.#newPointComponent !== null) {
      return;
    }

    const newEvent = {
      type: EventType.FLIGHT,
      destination: '',
      dateFrom: '',
      dateEnd: '',
      basePrice: 0,
      offers: [],
      isFavorite: false,
    };

    this.#newPointComponent = new NewPointView(
      newEvent,
      this.#eventsModel.getDestinations(),
      this.#eventsModel.getOffers(),
      this.#handleCancel,
      this.#handleSave,
      this.#handleCancel // Передаем шестым аргументом (onDelete)
    );

    render(this.#newPointComponent, this.#eventListContainer, 'afterbegin');
    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  destroy() {
    if (this.#newPointComponent === null) {
      return;
    }

    remove(this.#newPointComponent);
    this.#newPointComponent = null; // Обязательно зануляем ссылку на компонент

    document.removeEventListener('keydown', this.#escKeydownHandler);
  }

  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#handleCancel();
    }
  };

  #handleCancel = () => {
    this.destroy();
    this.#onClose?.();
  };

  #handleSave = (newEvent) => {
    this.#onSave?.(newEvent);
    this.destroy();
  };
}
