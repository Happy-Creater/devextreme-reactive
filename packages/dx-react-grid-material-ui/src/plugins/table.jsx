import React from 'react';
import PropTypes from 'prop-types';
import { Table as TableBase } from '@devexpress/dx-react-grid';
import { TableRow } from '../templates/table-row';
import { TableLayout } from '../templates/table-layout';
import { TableCell } from '../templates/table-cell';
import { TableStubCell } from '../templates/table-stub-cell';
import { TableNoDataCell } from '../templates/table-no-data-cell';

const defaultMessages = {
  noData: 'No data',
};

export class Table extends React.PureComponent {
  render() {
    const {
      messages,
      ...restProps
    } = this.props;

    return (
      <TableBase
        layoutComponent={TableLayout}
        rowComponent={TableRow}
        cellComponent={TableCell}
        noDataRowComponent={TableRow}
        noDataCellComponent={TableNoDataCell}
        stubCellComponent={TableStubCell}
        stubHeaderCellComponent={TableStubCell}
        messages={{ ...defaultMessages, ...messages }}
        {...restProps}
      />
    );
  }
}

Table.Cell = TableCell;
Table.Row = TableRow;
Table.NoDataCell = TableNoDataCell;
Table.NoDataRow = TableRow;
Table.StubCell = TableStubCell;
Table.StubHeaderCell = TableStubCell;

Table.propTypes = {
  messages: PropTypes.shape({
    noData: PropTypes.string,
  }),
};

Table.defaultProps = {
  messages: {},
};
