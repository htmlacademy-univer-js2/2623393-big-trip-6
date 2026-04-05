import MainPresenter from './presenter/main-presenter.js';

document.addEventListener('DOMContentLoaded', () => {
  const mainPresenter = new MainPresenter();
  mainPresenter.init();
});
