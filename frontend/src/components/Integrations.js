import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
        //   transition: 'transform 0.3s ease-in-out', // Smooth transition for transform property
        //   '&:hover': {
        //     transform: 'scale(1.05)', // Scale up the card slightly when hovered
        //   }
        overflow: 'hidden', // Allow the child elements to show outside the card boundaries on hover
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
            transform: 'scale(1.05)', // Scale up the card slightly when hovered
            '& $media': { // Target the media class when the card is hovered
                transform: 'scale(1.1)', // Scale up the image more than the card itself
            }
        },
        height: '100%',  // Make sure the card takes full height of its container
        display: 'flex',
        flexDirection: 'column',
    },
    media: {
        height: 140,
        transition: 'transform 0.3s ease-in-out',
        objectFit: 'contain',
        width: '100%', // Ensure the image takes the full width of the card
        backgroundSize: 'contain', // Contain the background size
        backgroundRepeat: 'no-repeat', // No repeat of the background
        backgroundPosition: 'center', // Center the background image
        transform: 'scale(0.9)', // Scale down the image to 90%
    },
    content: {
        flexGrow: 1,  // Allow the content area to grow and fill the space
    },
    actions: {
        // justifyContent: 'center', // Center the buttons within CardActions
        marginTop: 'auto', // Push the buttons to the bottom
    },
});


const integrations = [
    {
        name: 'PostgreSQL Bridge',
        descriptions: 'PostgreSQL is a powerful open-source object-relational database management system recognized for its advanced features and extensibility.',
        // image: 'https://1000logos.net/wp-content/uploads/2020/08/PostgreSQL-Logo.png',
        image: '/integration-logos/postgres.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-sql-bridge',
        emailTopic: 'PostgreSQL Bridge' 
    },
    {
        name: 'MySQL Bridge',
        descriptions: 'MySQL is a widely used open-source relational database management system known for its reliability and scalability.',
        image: '/integration-logos/mysql.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-sql-bridge',
        emailTopic: 'MySQL Bridge' 
    },
    {
        name: 'AlloyDB Bridge',
        descriptions: 'Google AlloyDB is a scalable, fully managed relational database service designed to handle high volumes of data and support mission-critical applications with high availability and strong consistency.',
        image: '/integration-logos/alloydb.webp',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-sql-bridge',
        emailTopic: 'AlloyDB Bridge' 
    },
    {
        name: 'TimescaleDB Bridge',
        descriptions: 'TimescaleDB is a leading open-source time-series database built on top of PostgreSQL, designed for handling time-series data at scale with SQL simplicity.',
        image: '/integration-logos/timescaledb.svg',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-sql-bridge',
        emailTopic: 'TimescaleDB Bridge' 
    },
    {
        name: 'MongoDB Bridge',
        descriptions: 'The MongoDB Bridge enables one-way data transfer from the MQTT broker to MongoDB. It’s built for effortless data migration, allowing users to handle MQTT-generated data in MongoDB efficiently.',
        image: '/integration-logos/mongodb.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-mongodb-bridge',
        emailTopic: 'MongoDB Bridge' 
    },
    {
        name: 'MongoDB Atlas Bridge',
        descriptions: 'MongoDB Atlas is a fully managed cloud database service for MongoDB, offering a flexible and scalable solution for modern application development.',
        image: '/integration-logos/mongodbatlas.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-mongodb-bridge',
        emailTopic: 'MongoDB Atlas Bridge' 
    },
    {
        name: 'Google Pub/Sub Bridge',
        descriptions: 'Google Pub/Sub is a managed messaging service provided by Google that enables users to send and receive messages between independent applications asynchronously.',
        image: '/integration-logos/googlecloud.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-google-pubsub-bridge',
        emailTopic: 'Google Pub/Sub Bridge' 
    },
    {
        name: 'Kafka Bridge',
        descriptions: 'The MQTT to Kafka bridge facilitates a unidirectional data transfer mechanism, enabling seamless MQTT data transmission from Pro Mosquitto to Kafka.',
        image: '/integration-logos/kafka.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/Bridges/mosquitto-kafka-bridge',
        emailTopic: 'Kafka Bridge' 
    },
    {
        name: 'Kubernetes',
        descriptions: 'Kubernetes container deployment support enables users to install and run Pro Mosquitto within Kubernetes.',
        image: '/integration-logos/kubernetes.png',
        link: 'https://docs.cedalo.com/mosquitto/kubernetes/introduction',
        emailTopic: 'Kubernetes' 
    },
    {
        name: 'Openshift',
        descriptions: 'OpenShift is a containerization platform developed by Red Hat based on Kubernetes. OpenShift support enables users to install and run Pro Mosquitto within OpenShift clusters.',
        image: '/integration-logos/openshift.svg',
        link: 'https://docs.cedalo.com/mosquitto/openshift/introduction',
        emailTopic: 'Openshift' 
    },
    {
        name: 'InfluxDB Metrics Exporter',
        descriptions: 'InfluxDB is an open-source time-series database designed to handle high write and query loads, ideal for IoT, monitoring, and analytics applications.',
        image: '/integration-logos/influxdb.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/mosquitto-metrics-exporter',
        emailTopic: 'InfluxDB Metrics Exporter' 
    },
    {
        name: 'Prometheus Metrics Exporter',
        descriptions: 'Prometheus is a very popular monitoring solution that is used for gaining insights into metrics. Pro Mosquitto now implements a Prometheus exporter.',
        image: '/integration-logos/prometheus.png',
        link: 'https://docs.cedalo.com/mosquitto/broker/Mosquitto%20Manual/mosquitto-metrics-exporter',
        emailTopic: 'Prometheus Metrics Exporter' 
    },
];

const SUPPORT_EMAIL = 'getting.started@cedalo.com';


const Integrations = ({topicTree, lastUpdated, currentConnectionName, settings, topicTreeRestFeature, connected}) => {
    const classes = useStyles();

	return (
		<ContentContainer
			dataTour="page-topics"
			overFlowX="hidden"
			breadCrumbs={<ContainerBreadCrumbs title="Integrations"
											   links={[{name: 'Home', route: '/integrations'}]}
			/>}
		>
			<ContainerHeader
				title="Integrations"
				subTitle="Pro Mosquitto offers several enterprise-grade integrations, enabling seamless connectivity between MQTT and widely-used services. Extend and enhance your setup with purpose-built integrations to integrate seamlessly with leading databases and data streaming solutions, perfectly suiting your use and business cases."
			>
			</ContainerHeader>
            <Grid container justify="center" spacing={3}>  
                    {integrations.map((integration) => (
                        <Grid item >
                            <Card className={classes.root}>
                                {/* <CardActionArea> */}
                                <CardMedia
                                    className={classes.media}
                                    image={integration.image}
                                    title={`${integration.name.replaceAll(' ', '-')}-logo`}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {integration.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        {integration.descriptions}
                                    </Typography>
                                </CardContent>
                                {/* </CardActionArea> */}
                                <CardActions className={classes.actions}>
                                    <Button size="small" component={Link} target="_blank" href={integration.link} color="primary">
                                        Configure
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        target="_top"
                                        rel="noopener noreferrer"
                                        href={`mailto:${SUPPORT_EMAIL}?subject=${integration.emailTopic}&body=Hello%20Cedalo%20Team%2C%0A%0AI%20am%20interested%20in%20the%20${integration.name}%20integration for Pro Mosquitto. Please contact me back.`}
                                    >
                                        Contact Us
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
            </Grid>
		</ContentContainer>
	);
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(Integrations);