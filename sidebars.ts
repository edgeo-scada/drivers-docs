import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Main SCADA platform sidebar
  scadaSidebar: [
    {
      type: 'doc',
      id: 'introduction',
      label: 'Introduction',
    },
    // ── Getting Started ──
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'architecture',
          label: 'Architecture',
        },
        {
          type: 'doc',
          id: 'installation',
          label: 'Installation',
        },
        {
          type: 'doc',
          id: 'configuration',
          label: 'Configuration',
        },
      ],
    },
    // ── Data Acquisition ──
    {
      type: 'category',
      label: 'Data Acquisition',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'devices',
          label: 'Devices',
        },
        {
          type: 'category',
          label: 'Drivers',
          link: {
            type: 'doc',
            id: 'drivers/index',
          },
          items: [
            {
              type: 'ref',
              id: 'modbus/index',
              label: 'Modbus TCP',
            },
            {
              type: 'ref',
              id: 'opcua/index',
              label: 'OPC UA',
            },
            {
              type: 'ref',
              id: 'mqtt/index',
              label: 'MQTT',
            },
            {
              type: 'ref',
              id: 's7/index',
              label: 'S7',
            },
            {
              type: 'ref',
              id: 'bacnet/index',
              label: 'BACnet',
            },
            {
              type: 'ref',
              id: 'snmp/index',
              label: 'SNMP',
            },
          ],
        },
      ],
    },
    // ── Alarming ──
    {
      type: 'category',
      label: 'Alarming',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'alarms',
          label: 'Alarms',
        },
        {
          type: 'doc',
          id: 'notifications',
          label: 'Notifications',
        },
      ],
    },
    // ── Historian ──
    {
      type: 'doc',
      id: 'historian',
      label: 'Historian',
    },
    // ── Dashboard ──
    {
      type: 'category',
      label: 'Dashboard',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'dashboard',
          label: 'Overview',
        },
        {
          type: 'doc',
          id: 'widgets',
          label: 'Widgets',
        },
        {
          type: 'doc',
          id: 'graphics',
          label: 'SVG Graphics',
        },
      ],
    },
    // ── Networking ──
    {
      type: 'category',
      label: 'Networking',
      items: [
        {
          type: 'doc',
          id: 'gateway',
          label: 'Gateway',
        },
      ],
    },
    // ── Administration ──
    {
      type: 'category',
      label: 'Administration',
      items: [
        {
          type: 'doc',
          id: 'users',
          label: 'Users & RBAC',
        },
      ],
    },
    // ── Reference ──
    {
      type: 'category',
      label: 'Reference',
      items: [
        {
          type: 'doc',
          id: 'api',
          label: 'API Reference',
        },
        {
          type: 'doc',
          id: 'cli',
          label: 'CLI',
        },
      ],
    },
  ],

  // Driver-specific sidebars
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
      type: 'doc',
      id: 'modbus/cli',
      label: 'CLI Tool',
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
      type: 'doc',
      id: 'opcua/cli',
      label: 'CLI Tool',
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
