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
      type: 'doc',
      id: 'mqtt/cli',
      label: 'CLI Tool',
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
  s7Sidebar: [
    {
      type: 'doc',
      id: 's7/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 's7/getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 's7/client',
      label: 'Client',
    },
    {
      type: 'doc',
      id: 's7/pool',
      label: 'Connection Pool',
    },
    {
      type: 'doc',
      id: 's7/options',
      label: 'Configuration',
    },
    {
      type: 'doc',
      id: 's7/errors',
      label: 'Error Handling',
    },
    {
      type: 'doc',
      id: 's7/metrics',
      label: 'Metrics',
    },
    {
      type: 'doc',
      id: 's7/cli',
      label: 'CLI Tool',
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        's7/examples/basic-client',
        's7/examples/pool',
      ],
    },
    {
      type: 'doc',
      id: 's7/changelog',
      label: 'Changelog',
    },
  ],
  bacnetSidebar: [
    {
      type: 'doc',
      id: 'bacnet/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'bacnet/getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'bacnet/client',
      label: 'Client',
    },
    {
      type: 'doc',
      id: 'bacnet/options',
      label: 'Configuration',
    },
    {
      type: 'doc',
      id: 'bacnet/errors',
      label: 'Error Handling',
    },
    {
      type: 'doc',
      id: 'bacnet/metrics',
      label: 'Metrics',
    },
    {
      type: 'doc',
      id: 'bacnet/cli',
      label: 'CLI Tool',
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'bacnet/examples/basic-client',
        'bacnet/examples/cov',
      ],
    },
    {
      type: 'doc',
      id: 'bacnet/changelog',
      label: 'Changelog',
    },
  ],
  snmpSidebar: [
    {
      type: 'doc',
      id: 'snmp/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'snmp/getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'snmp/client',
      label: 'Client',
    },
    {
      type: 'doc',
      id: 'snmp/pool',
      label: 'Connection Pool',
    },
    {
      type: 'doc',
      id: 'snmp/options',
      label: 'Configuration',
    },
    {
      type: 'doc',
      id: 'snmp/trap',
      label: 'Trap Listener',
    },
    {
      type: 'doc',
      id: 'snmp/errors',
      label: 'Error Handling',
    },
    {
      type: 'doc',
      id: 'snmp/metrics',
      label: 'Metrics',
    },
    {
      type: 'doc',
      id: 'snmp/cli',
      label: 'CLI Tool',
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'snmp/examples/basic-client',
        'snmp/examples/snmpv3',
      ],
    },
    {
      type: 'doc',
      id: 'snmp/changelog',
      label: 'Changelog',
    },
  ],
};

export default sidebars;
