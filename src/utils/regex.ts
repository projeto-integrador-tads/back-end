export const phoneRegex = new RegExp(
  /(?:^\([0]?[1-9]{2}\)|^[0]?[1-9]{2}[\.-\s]?)[9]?[1-9]\d{3}[\.-\s]?\d{4}$/
);

export const plateRegex = new RegExp(/^[a-zA-Z]{3}[0-9][A-Za-z0-9][0-9]{2}$/);
