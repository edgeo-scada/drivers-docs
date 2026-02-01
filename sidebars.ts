import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  modbusSidebar: [
    {
      type: 'doc',
      id: 'modbus/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'modbus/getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'modbus/client',
      label: 'Client',
    },
    {
      type: 'doc',
      id: 'modbus/server',
      label: 'Server',
    },
    {
      type: 'doc',
      id: 'modbus/pool',
      label: 'Connection Pool',
    },
    {
      type: 'doc',
      id: 'modbus/options',
      label: 'Configuration',
    },
    {
      type: 'doc',
      id: 'modbus/errors',
      label: 'Error Handling',
    },
    {
      type: 'doc',
      id: 'modbus/metrics',
      label: 'Metrics',
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'modbus/examples/basic-client',
        'modbus/examples/basic-server',
      ],
    },
    {
      type: 'doc',
      id: 'modbus/changelog',
      label: 'Changelog',
    },
  ],
  opcuaSidebar: [
    {
      type: 'doc',
      id: 'opcua/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'opcua/getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'opcua/client',
      label: 'Client',
    },
    {
      type: 'doc',
      id: 'opcua/server',
      label: 'Server',
    },
    {
      type: 'doc',
      id: 'opcua/pool',
      label: 'Connection Pool',
    },
    {
      type: 'doc',
      id: 'opcua/options',
      label: 'Configuration',
    },
    {
      type: 'doc',
      id: 'opcua/errors',
      label: 'Error Handling',
    },
    {
      type: 'doc',
      id: 'opcua/metrics',
      label: 'Metrics',
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'opcua/examples/basic-client',
        'opcua/examples/basic-server',
      ],
    },
    {
      type: 'doc',
      id: 'opcua/changelog',
      label: 'Changelog',
    },
  ],
};

export default sidebars;
