/**
 * @typedef {Object} Destination
 * @property {string} id - Уникальный идентификатор
 * @property {string} name - Название города
 * @property {string} description - Описание
 * @property {Array<{src: string, description: string}>} pictures - Фотографии
 */

/**
 * @typedef {Object} Offer
 * @property {string} id - Уникальный идентификатор
 * @property {string} type - Тип события (taxi, flight, etc.)
 * @property {string} title - Название опции
 * @property {number} price - Цена
 */

/**
 * @typedef {Object} Event
 * @property {string} id - Уникальный идентификатор
 * @property {string} type - Тип события
 * @property {string} destination - ID пункта назначения
 * @property {string} dateFrom - Дата начала (ISO string)
 * @property {string} dateEnd - Дата окончания (ISO string)
 * @property {number} basePrice - Базовая стоимость
 * @property {Array<string>} offers - Массив ID выбранных опций
 * @property {boolean} isFavorite - В избранном
 */

export {};
