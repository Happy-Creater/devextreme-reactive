import React from 'react';
import { Getter } from '@devexpress/dx-react-core';
import { sortedRows } from '@devexpress/dx-datagrid-core';

// eslint-disable-next-line react/prefer-stateless-function
export class LocalSorting extends React.PureComponent {
  render() {
    return (
      <Getter
        name="rows"
        pureComputed={sortedRows}
        connectArgs={getter => [
          getter('rows'),
          getter('sortings'),
        ]}
      />
    );
  }
}
