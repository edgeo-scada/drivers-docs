import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Edgeo SCADA',
  tagline: 'Open-source SCADA platform for industrial automation',
  favicon: 'favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://edgeo.github.io',
  baseUrl: '/',

  organizationName: 'edgeo',
  projectName: 'docs',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/edgeo-scada/docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Edgeo SCADA',
      logo: {
        alt: 'Edgeo Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'scadaSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'dropdown',
          label: 'Drivers',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'modbusSidebar',
              label: 'Modbus TCP',
            },
            {
              type: 'docSidebar',
              sidebarId: 'opcuaSidebar',
              label: 'OPC UA',
            },
            {
              type: 'docSidebar',
              sidebarId: 'mqttSidebar',
              label: 'MQTT',
            },
            {
              type: 'docSidebar',
              sidebarId: 's7Sidebar',
              label: 'S7',
            },
            {
              type: 'docSidebar',
              sidebarId: 'bacnetSidebar',
              label: 'BACnet',
            },
            {
              type: 'docSidebar',
              sidebarId: 'snmpSidebar',
              label: 'SNMP',
            },
          ],
        },
        {
          href: 'https://github.com/edgeo-scada',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Platform',
          items: [
            {
              label: 'Introduction',
              to: '/introduction',
            },
            {
              label: 'Architecture',
              to: '/architecture',
            },
            {
              label: 'Installation',
              to: '/installation',
            },
            {
              label: 'Configuration',
              to: '/configuration',
            },
            {
              label: 'API Reference',
              to: '/api',
            },
            {
              label: 'CLI',
              to: '/cli',
            },
          ],
        },
        {
          title: 'Components',
          items: [
            {
              label: 'Devices',
              to: '/devices',
            },
            {
              label: 'Alarms',
              to: '/alarms',
            },
            {
              label: 'Historian',
              to: '/historian',
            },
            {
              label: 'Notifications',
              to: '/notifications',
            },
            {
              label: 'Gateway',
              to: '/gateway',
            },
            {
              label: 'SVG Graphics',
              to: '/graphics',
            },
          ],
        },
        {
          title: 'Drivers',
          items: [
            {
              label: 'Modbus TCP',
              to: '/modbus/',
            },
            {
              label: 'OPC UA',
              to: '/opcua/',
            },
            {
              label: 'MQTT',
              to: '/mqtt/',
            },
            {
              label: 'S7',
              to: '/s7/',
            },
            {
              label: 'BACnet',
              to: '/bacnet/',
            },
            {
              label: 'SNMP',
              to: '/snmp/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/edgeo-scada',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Edgeo SCADA. Licensed under Apache 2.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['go', 'bash', 'yaml', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
