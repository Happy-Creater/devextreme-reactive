import React from 'react';
import { Getter, Template } from '@devexpress/dx-react-core';
import { getColumnFilterValue } from '@devexpress/dx-datagrid-core';

export class TableFilterRow extends React.PureComponent {
  constructor(props) {
    super(props);

    this._tableHeaderRows = tableHeaderRows => [...tableHeaderRows, { type: 'filter', height: props.rowHeight }];
  }
  render() {
    return (
      <div>
        <Getter
          name="tableHeaderRows"
          pureComputed={this._tableHeaderRows}
          connectArgs={getter => [
            getter('tableHeaderRows'),
          ]}
        />

        <Template
          name="tableViewCell"
          predicate={({ row }) => row.type === 'filter'}
          connectGetters={(getter, { column }) => ({
            filter: getColumnFilterValue(getter('filters'), column.name),
          })}
          connectActions={(action, { column }) => ({
            changeFilter: value => action('setColumnFilter')({ columnName: column.name, value }),
          })}
        >
          {params => this.props.filterCellTemplate(params)}
        </Template>
      </div>
    );
  }
}

TableFilterRow.propTypes = {
  rowHeight: React.PropTypes.any,
  filterCellTemplate: React.PropTypes.func.isRequired,
};

TableFilterRow.defaultProps = {
  rowHeight: undefined,
};
