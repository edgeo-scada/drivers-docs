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
  mqttSidebar: [
    {
      type: 'doc',
      id: 'mqtt/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'mqtt/getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'mqtt/client',
      label: 'Client',
    },
    {
      type: 'doc',
      id: 'mqtt/pool',
      label: 'Connection Pool',
    },
    {
      type: 'doc',
      id: 'mqtt/options',
      label: 'Configuration',
    },
    {
      type: 'doc',
      id: 'mqtt/errors',
      label: 'Error Handling',
    },
    {
      type: 'doc',
      id: 'mqtt/metrics',
      label: 'Metrics',
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'mqtt/examples/publisher',
        'mqtt/examples/subscriber',
      ],
    },
    {
      type: 'doc',
      id: 'mqtt/changelog',
      label: 'Changelog',
    },
  ],
};

export default sidebars;
