import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function humanizePointDate(date) {
  return date ? dayjs(date).format('MMM DD') : '';
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
    return `${Math.floor(pointDuration.asDays()).toString().padStart(2, '0')}d ${pointDuration.hours().toString().padStart(2, '0')}h ${pointDuration.minutes().toString().padStart(2, '0')}m`;
  } else if (pointDuration.asHours() >= 1) {
    return `${pointDuration.hours().toString().padStart(2, '0')}h ${pointDuration.minutes().toString().padStart(2, '0')}m`;
  } else {
    return `${pointDuration.minutes().toString().padStart(2, '0')}m`;
  }
}
