import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const ToggleButton = ({
  onToggle, className,
  getMessage, buttonRef,
  ...restProps
}) => (
  <button
    className={classNames('btn btn-link', className)}
    onClick={onToggle}
    ref={buttonRef}
    {...restProps}
  >
    <i className="glyphicon glyphicon-eye-close" />
  </button>
);

ToggleButton.propTypes = {
  onToggle: PropTypes.func.isRequired,
  getMessage: PropTypes.func.isRequired,
  buttonRef: PropTypes.func.isRequired,
  className: PropTypes.string,
};

ToggleButton.defaultProps = {
  className: undefined,
};
