import AbstractView from '../framework/view/abstract-view.js';
import { humanizeTripDate } from '../utils/date.js';

export default class TripInfoView extends AbstractView {
  #route = '';
  #startDate = null;
  #endDate = null;
  #totalCost = 0;

  constructor({ route, startDate, endDate, totalCost }) {
    super();
    this.#route = route;
    this.#startDate = startDate;
    this.#endDate = endDate;
    this.#totalCost = totalCost;
  }

  get template() {
    return `
      <section class="trip-main__trip-info trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${this.#route}</h1>
          <p class="trip-info__dates">${this.#formatDates()}</p>
        </div>
        <p class="trip-info__cost">
          &euro;&nbsp;<span class="trip-info__cost-value">${this.#totalCost}</span>
        </p>
      </section>
    `;
  }

  #formatDates() {
    if (!this.#startDate || !this.#endDate) {
      return '';
    }
    return `${humanizeTripDate(this.#startDate)} — ${humanizeTripDate(this.#endDate)}`;
  }

  updateElement({ route, startDate, endDate, totalCost }) {
    if (route !== undefined) {
      this.#route = route;
    }
    if (startDate !== undefined) {
      this.#startDate = startDate;
    }
    if (endDate !== undefined) {
      this.#endDate = endDate;
    }
    if (totalCost !== undefined) {
      this.#totalCost = totalCost;
    }
    this.element.innerHTML = this.template;
  }
}
