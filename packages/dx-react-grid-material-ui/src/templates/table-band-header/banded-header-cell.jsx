import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { getBorder } from '../utils';

const styles = theme => ({
  headerCellBorder: {
    borderRight: getBorder(theme),
    borderTop: 'none',
    '&:last-child': {
      borderRight: 0,
    },
    verticalAlign: 'bottom',
    paddingBottom: theme.spacing.unit * 2,
  },
});

export const BandedHeaderCellBase = ({
  component: HeaderCellComponent, className, classes, ...restProps
}) => (
  <HeaderCellComponent
    className={classNames(classes.headerCellBorder, className)}
    {...restProps}
  />
);

BandedHeaderCellBase.propTypes = {
  component: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
};

BandedHeaderCellBase.defaultProps = {
  className: undefined,
};

export const BandedHeaderCell = withStyles(styles, { name: 'BandedHeaderCell' })(BandedHeaderCellBase);
