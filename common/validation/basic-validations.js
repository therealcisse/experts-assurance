export function required(field, value, prop) {
  return prop ? !value : false;
}

export function matchField(field, value, prop, allValues) {
  return !allValues[prop] ? false : value !== allValues[prop];
}

export function minLength(field, value, prop) {
  return prop && value ? value.length < prop : false;
}

export function email(field, value, prop) {
  return prop && value ? !(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(value)) : false; // eslint-disable-line max-len
}

export function promise(field, value, prop, allValues) {
  if (typeof prop == 'function') {
    return prop(field, value, allValues);
  }
  throw new Error('FormValidation: type promise must be a function!');
}

export function equalTo(field, value, prop) {
  return !value ? false : prop !== value;
}
