import React from 'react';

export default [
    {
        selector: '[data-tour="navbar-connections"]',
        routing: '/connections',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p style={{ fontSize: '13pt' }}>Broker Connections</p>
                <p>Define broker connections for the Management Center.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="page-connections"]',
        routing: '/connections',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p>
                    Set up and manage your connection here. The connection is done via regular client connection to the
                    broker. Make sure the connected client has the necessary ACLs to be able to control the Management
                    Center. The roles “super-admin”,”topic-observe” and “sys-observe” cover these ACLs. Depending on
                    your subscription, the Management Center is able to connect to one or multiple brokers at the same
                    time.
                </p>
            </div>
        ),
    },
    {
        selector: '[data-tour="navbar-clusters"]',
        routing: '/clusters',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p style={{ fontSize: '13pt' }}>Cluster Management</p>
                <p>Create and manage clusters.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="page-clusters"]',
        routing: '/clusters',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p>
                    A cluster connects multiple brokers. To be able to set up a cluster, the brokers need to be
                    configured to work as cluster nodes. At least three brokers form a cluster. The cluster mode can
                    either be “dynamic-security sync” or “full sync”.
                </p>
            </div>
        ),
    },
    {
        selector: '[data-tour="navbar-certs"]',
        routing: '/certs',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p style={{ fontSize: '13pt' }}>Certificate Management</p>
                <p>Upload and deploy client CA certificates with the Management Center.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="page-certs"]',
        routing: '/certs',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p>
                    Management Center users can upload CA certificates to the Management Center and deploy them to
                    connected broker instances. Uploaded CA certificates allow for client certificate connections. To
                    deploy a CA certificate to a broker, ensure the broker configuration is set accordingly.
                </p>
            </div>
        ),
    },
    {
        selector: '[data-tour="navbar-info"]',
        routing: '/info',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p style={{ fontSize: '13pt' }}>Info</p>
                <p>Get information about the Management Center.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="page-info"]',
        routing: '/info',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p>Information about the current license, version, and plugins are listed in the “info” menu.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="navbar-users"]',
        routing: '/users',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p style={{ fontSize: '13pt' }}>User Management</p>
                <p>Create and manage users to access the Management Center.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="page-users"]',
        routing: '/users',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p>
                    Define different users to give access to the Management Center. The users can acquire rights by
                    having an assigned role. The users can further be grouped to User Groups.
                </p>
            </div>
        ),
    },
    {
        selector: '[data-tour="navbar-user-groups"]',
        routing: '/user-groups',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p style={{ fontSize: '13pt' }}>User Groups</p>
                <p>Create user groups to manage user access to different connections.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="page-user-groups"]',
        routing: '/user-groups',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p>
                    User Groups allow the grouping of users and define group access management. In addition, Groups
                    allow defining, which connections can be accessed by group members. Using these restrictions, you
                    can limit users to only the functionality they need ensuring higher levels of security, knowing that
                    users as part of a group will not be able to see or touch anything they are not supposed to.
                </p>
            </div>
        ),
    },
    {
        selector: '[data-tour="navbar-tokens"]',
        routing: '/tokens',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p style={{ fontSize: '13pt' }}>App Token</p>
                <p>Create and manage App Token.</p>
            </div>
        ),
    },
    {
        selector: '[data-tour="page-tokens"]',
        routing: '/tokens',
        content: () => (
            <div style={{ fontSize: '10pt' }}>
                <p>
                    Application tokens enable accessing Management Center features through the Rest APIs. This offers
                    and alternative authorization method to control the MMC Rest APIs.
                </p>
                <p>Click on Close to finish the Tour.</p>
            </div>
        ),
    },
];
