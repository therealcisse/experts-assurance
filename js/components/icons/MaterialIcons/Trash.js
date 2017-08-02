import React from 'react';
import T from 'prop-types';

export default function Trash({ size, color }) {
  return (
    <svg
      fill={color}
      height={size}
      viewBox='0 0 24 24'
      width={size}
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
      <path d='M0 0h24v24H0z' fill='none' />
    </svg>
  );
}

Trash.propTypes = {
  color: T.string,
  size: T.number.isRequired,
};

Trash.defaultProps = {
  color: 'currentColor',
};
