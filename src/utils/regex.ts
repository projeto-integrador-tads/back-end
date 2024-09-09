export const phone = new RegExp("^\\d{10,11}$");

export const plate = new RegExp(/^[a-zA-Z]{3}[0-9][A-Za-z0-9][0-9]{2}$/);

export const password = new RegExp(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
);
