export function formatDateTime(value) {
  if (!value) {
    return 'Unknown time';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatScore(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not set';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
}

export function getStatusClassName(status) {
  return status === 'PUBLISHED' ? 'pill-published' : 'pill-draft';
}
