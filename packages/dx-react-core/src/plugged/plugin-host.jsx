import * as React from 'react';
import * as PropTypes from 'prop-types';
import { PluginHost as PluginHostCore } from '@devexpress/dx-core';
import { PluginIndexer } from './plugin-indexer';
import { Template } from './template';
import { TemplatePlaceholder } from './template-placeholder';

export class PluginHost extends React.PureComponent {
  constructor(props) {
    super(props);

    this.host = new PluginHostCore();
  }
  getChildContext() {
    return {
      pluginHost: this.host,
    };
  }
  render() {
    const { children } = this.props;

    return (
      <React.Fragment>
        <PluginIndexer>
          <Template name="root" />
          {children}
        </PluginIndexer>
        <TemplatePlaceholder name="root" />
      </React.Fragment>
    );
  }
}

PluginHost.propTypes = {
  children: PropTypes.node,
};

PluginHost.defaultProps = {
  children: undefined,
};

PluginHost.childContextTypes = {
  pluginHost: PropTypes.object.isRequired,
};
