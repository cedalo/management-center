import React from 'react';

export default [
	{
		selector: '[data-tour="application"]',
		routing: '/home',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p style={{fontSize: '13pt'}}>Welcome to the Mosquitto Management Center!</p>
				<p>
					The Management Center allows you to inspect, manage and configure Mosquitto Broker Instances
					and Clusters. With this tour, we will give you an overview of key features of the Management
					Center. Please follow the steps to get an introduction of the features and key concepts.
				</p>
				<p>
					For further information, please visit
					the <a href="https://docs.cedalo.com/management-center/mc-overview" target="_blank">
					Mosquitto documentation
				</a>.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="appbar"]',
		routing: '/home',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p style={{fontSize: '13pt'}}>Title Bar</p>
				<p>
					The title bar allows you to open and close the navigation at the left burger menu. The application
					logo or name is displayed right next to it. At the right side you can select the active broker. This
					broker instance is used for broker specific pages.
				</p>
				<p>
					The list of brokers indicates, if the Management Center is connected to a broker instance. If not,
					all
					broker related functions are not available. The buttons right to the broker list allow you to start
					this tour, display the online documentation and user infos.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="navigation"]',
		routing: '/home',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p style={{fontSize: '13pt'}}>Navigation</p>
				<p>
					The navigation allows you to switch between the different pages of the Management Center. In the top
					region all broker related pages are available. First the status or inspection related pages. Below
					that the pages to manage dynamic security.
				</p>
				<p>
					At the bottom, you will find the pages for Management Center specific settings. Here you can
					define Cluster settings and set up broker connections. If you cliok on the button with the three
					dots, additional options are shown to organize Settings, Certificates, Topics and
					Management Center security options. In addition infos about the Management Center License and available
					Features can be viewed.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="navbar-home"]',
		routing: '/home',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p style={{fontSize: '13pt'}}>Home and Status</p>
				<p>
					The Home or Status page displays infos about some key figures of the active Broker Connection, you selected.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="page-status"]',
		routing: '/home',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p>
					At the left, you find infos about the accumulated traffic figures. In the middle the info about
					clients and license related usage of client connection. At the right general license and broker infos.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="navbar-topics"]',
		routing: '/topics',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p style={{fontSize: '13pt'}}>Topic Tree</p>
				<p>
					The topic tree display a tree with all used topics since the Management Center was loaded or
					the feature was activated. Please be aware, that the topics are only collected, if the feature is
					activated in the Management Center Settings
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="page-topics"]',
		routing: '/topics',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p>
					You can investigate the tree with the latest topics by opening the tree leaves in the topic tree. If you click
					on a topic, infos about the topic are displayed. Here you can observe the latest payloads.
				</p>
				<p>
					Please note, that
					only those payloads are displayed, that arrive while the page is open and the topic is selected.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="navbar-clientinspection"]',
		routing: '/clientinspection',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p style={{fontSize: '13pt'}}>Client Inspection</p>
				<p>
					The Client Inspection page lists all clients that are or were connected to the broker.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="page-clientinspection"]',
		routing: '/clientinspection',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p>
					The list of clients shows information about each client. You can reload this page to reflect the
					latest changes. You can also disconnect a client from the broker. In the title bar you have the
					option to filter the client list by entering a filter string.
				</p>
			</div>
		),
	},
];
