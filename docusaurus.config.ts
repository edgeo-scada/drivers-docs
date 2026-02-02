import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Edgeo Drivers',
  tagline: 'Multi-protocol industrial communication drivers for Go',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://edgeo.github.io',
  baseUrl: '/drivers/',

  organizationName: 'edgeo',
  projectName: 'drivers',

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
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/edgeo/drivers/tree/main/docs/',
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
      title: 'Edgeo Drivers',
      logo: {
        alt: 'Edgeo Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'modbusSidebar',
          position: 'left',
          label: 'Modbus TCP',
        },
        {
          type: 'docSidebar',
          sidebarId: 'opcuaSidebar',
          position: 'left',
          label: 'OPC UA',
        },
        {
          type: 'docSidebar',
          sidebarId: 'mqttSidebar',
          position: 'left',
          label: 'MQTT',
        },
        {
          type: 'docSidebar',
          sidebarId: 's7Sidebar',
          position: 'left',
          label: 'S7',
        },
        {
          type: 'docSidebar',
          sidebarId: 'bacnetSidebar',
          position: 'left',
          label: 'BACnet',
        },
        {
          type: 'docSidebar',
          sidebarId: 'snmpSidebar',
          position: 'left',
          label: 'SNMP',
        },
        {
          href: 'https://github.com/edgeo/drivers',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Modbus TCP',
              to: '/docs/modbus/',
            },
            {
              label: 'OPC UA',
              to: '/docs/opcua/',
            },
            {
              label: 'MQTT',
              to: '/docs/mqtt/',
            },
            {
              label: 'S7',
              to: '/docs/s7/',
            },
            {
              label: 'BACnet',
              to: '/docs/bacnet/',
            },
            {
              label: 'SNMP',
              to: '/docs/snmp/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/edgeo/drivers',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Edgeo. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['go', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
