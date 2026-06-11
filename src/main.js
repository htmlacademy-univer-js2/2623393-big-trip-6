import MainPresenter from './presenter/main-presenter.js';
import EventsModel from './model/events-model.js';
import FilterModel from './model/filter-model.js';
import BigTripApiService from './big-trip-api-service.js';

const RADIX = 36;
const SLICE_START_INDEX = 2;

const AUTHORIZATION = `Basic ${Math.random().toString(RADIX).slice(SLICE_START_INDEX)}`;
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const apiService = new BigTripApiService(END_POINT, AUTHORIZATION);

const filterModel = new FilterModel();
const eventsModel = new EventsModel({ apiService });

const mainPresenter = new MainPresenter({
  eventsModel: eventsModel,
  filterModel: filterModel
});

mainPresenter.init();
eventsModel.init();
