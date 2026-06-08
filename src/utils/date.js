import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function humanizePointDate(date) {
  if (!date) {
    return '';
  }
  const month = dayjs(date).format('MMM');
  const day = dayjs(date).format('DD');
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}`;
}

export function humanizeTripDate(date) {
  if (!date) {
    return '';
  }
  return dayjs(date).format('DD MMM').toUpperCase();
}

export function humanizePointTime(date) {
  return date ? dayjs(date).format('HH:mm') : '';
}

export function getPointDuration(dateFrom, dateEnd) {
  if (!dateFrom || !dateEnd) {
    return '';
  }

  const diffInMs = dayjs(dateEnd).diff(dayjs(dateFrom));
  const pointDuration = dayjs.duration(diffInMs);

  if (pointDuration.asDays() >= 1) {
    return `${Math.floor(pointDuration.asDays()).toString().padStart(2, '0')}D ${pointDuration.hours().toString().padStart(2, '0')}H ${pointDuration.minutes().toString().padStart(2, '0')}M`;
  } else if (pointDuration.asHours() >= 1) {
    return `${pointDuration.hours().toString().padStart(2, '0')}H ${pointDuration.minutes().toString().padStart(2, '0')}M`;
  } else {
    return `${pointDuration.minutes().toString().padStart(2, '0')}M`;
  }
}
