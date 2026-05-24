import { render, remove } from '../framework/render.js';
import NewPointView from '../view/event-edit-view.js';
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
      this.#handleSave,
      this.#handleCancel,
      this.#handleCancel
    );

    render(this.#newPointComponent, this.#eventListContainer, 'afterbegin');
    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  destroy() {
    if (this.#newPointComponent === null) {
      return;
    }

    remove(this.#newPointComponent);
    this.#newPointComponent = null;

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

  #handleSave = async (newEvent) => {
    this.#newPointComponent.setViewState({ isSaving: true });
    try {
      await this.#onSave(newEvent);
      this.destroy();
    } catch (err) {
      this.#newPointComponent.shake(() => {
        this.#newPointComponent.setViewState({ isAborting: true });
      });
    }
  };
}
