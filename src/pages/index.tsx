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
          <Link
            className="button button--secondary button--lg"
            to="/docs/modbus/">
            Modbus TCP
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            to="/docs/opcua/">
            OPC UA
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            to="/docs/mqtt/">
            MQTT
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Modbus TCP',
    description: (
      <>
        Complete Modbus TCP implementation with client, server, and connection pool.
        Supports all standard Modbus functions (FC01-FC17) with automatic reconnection
        and built-in metrics.
      </>
    ),
    link: '/docs/modbus/',
  },
  {
    title: 'OPC UA',
    description: (
      <>
        Full OPC UA client and server with session management, subscriptions,
        and monitored items. Supports multiple security policies and authentication methods.
      </>
    ),
    link: '/docs/opcua/',
  },
  {
    title: 'MQTT',
    description: (
      <>
        Pure Go MQTT 5.0 client with TLS, WebSocket, and connection pooling.
        Supports all QoS levels, topic wildcards, and automatic reconnection with
        exponential backoff.
      </>
    ),
    link: '/docs/mqtt/',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link className="button button--primary" to={link}>
          Learn More
        </Link>
      </div>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Industrial Protocol Drivers"
      description="Multi-protocol industrial communication drivers for Go - Modbus TCP and OPC UA">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
