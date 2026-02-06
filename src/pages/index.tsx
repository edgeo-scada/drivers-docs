import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/introduction">
            Get Started
          </Link>
          <Link className="button button--secondary button--lg" to="/drivers/">
            Drivers
          </Link>
          <Link className="button button--secondary button--lg" to="/api">
            API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

type SectionItem = {
  title: string;
  description: ReactNode;
  link: string;
};

const PlatformSections: SectionItem[] = [
  {
    title: 'Architecture',
    description: (
      <>
        Layered Go backend with React frontend, PostgreSQL storage,
        WebSocket real-time updates, and pluggable historian backends.
      </>
    ),
    link: '/architecture',
  },
  {
    title: 'Devices',
    description: (
      <>
        Connect to PLCs and industrial equipment via 6 protocol drivers.
        Automatic polling, reconnection, and address space browsing.
      </>
    ),
    link: '/devices',
  },
  {
    title: 'Alarms',
    description: (
      <>
        Threshold, deviation, boolean, and string-match alarms with deadband,
        delay, acknowledgment workflows, and notification dispatch.
      </>
    ),
    link: '/alarms',
  },
  {
    title: 'Historian',
    description: (
      <>
        Time-series storage with PostgreSQL or InfluxDB backends.
        Aggregation queries, retention policies, and per-tag configuration.
      </>
    ),
    link: '/historian',
  },
  {
    title: 'Gateway',
    description: (
      <>
        Connect multiple Edgeo instances together via WebSocket.
        Sync providers between sites with optional write-through.
      </>
    ),
    link: '/gateway',
  },
  {
    title: 'SVG Graphics',
    description: (
      <>
        Synoptic process diagrams with live tag value bindings.
        Import SVG files and map elements to real-time data.
      </>
    ),
    link: '/graphics',
  },
];

const DriverList: SectionItem[] = [
  {
    title: 'Modbus TCP',
    description: (
      <>
        Complete Modbus TCP with client, server, and connection pool.
        All standard Modbus functions (FC01-FC17).
      </>
    ),
    link: '/modbus/',
  },
  {
    title: 'OPC UA',
    description: (
      <>
        Full OPC UA client and server with session management,
        subscriptions, and security policies.
      </>
    ),
    link: '/opcua/',
  },
  {
    title: 'MQTT',
    description: (
      <>
        Pure Go MQTT 5.0 client with TLS, WebSocket,
        connection pooling, and all QoS levels.
      </>
    ),
    link: '/mqtt/',
  },
  {
    title: 'S7 (Siemens)',
    description: (
      <>
        S7comm for Siemens PLCs. S7-200 through S7-1500
        and LOGO! with connection pooling.
      </>
    ),
    link: '/s7/',
  },
  {
    title: 'BACnet',
    description: (
      <>
        BACnet/IP for building automation. Device discovery,
        ReadProperty, WriteProperty, and COV subscriptions.
      </>
    ),
    link: '/bacnet/',
  },
  {
    title: 'SNMP',
    description: (
      <>
        SNMP v1/v2c/v3 with trap listener. SNMPv3 auth
        and encryption, MIB walk operations.
      </>
    ),
    link: '/snmp/',
  },
];

function SectionCard({title, description, link}: SectionItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{marginBottom: '2rem'}}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link className="button button--primary" to={link}>
          Learn More
        </Link>
      </div>
    </div>
  );
}

function PlatformFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className="text--center" style={{marginBottom: '2rem'}}>
          Platform
        </Heading>
        <div className="row">
          {PlatformSections.map((props, idx) => (
            <SectionCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DriversSection(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className="text--center" style={{marginBottom: '2rem'}}>
          Drivers
        </Heading>
        <div className="row">
          {DriverList.map((props, idx) => (
            <SectionCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Industrial SCADA Platform"
      description="Open-source SCADA platform for industrial automation — Modbus TCP, OPC UA, MQTT, S7, BACnet, and SNMP">
      <HomepageHeader />
      <main>
        <PlatformFeatures />
        <DriversSection />
      </main>
    </Layout>
  );
}
