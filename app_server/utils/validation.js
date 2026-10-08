// Small input-validation helpers shared by the controllers.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True for a finite latitude in [-90, 90]. Note: 0 is a valid latitude. */
const isValidLatitude = (value) => typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;

/** True for a finite longitude in [-180, 180]. */
const isValidLongitude = (value) => typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;

/** Trimmed string, or '' if the value isn't a string. */
const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidEmail = (value) => EMAIL_PATTERN.test(cleanString(value));

module.exports = { isValidLatitude, isValidLongitude, cleanString, isValidEmail };
