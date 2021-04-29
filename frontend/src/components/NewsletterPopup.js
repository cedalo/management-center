import React, { useEffect } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import useLocalStorage from '../helpers/useLocalStorage';

const NEWSLETTER_POPUP_DELAY = 30000;

const MySwal = withReactContent(Swal)

const useStyles = makeStyles((theme) => ({
	button: {
		margin: theme.spacing(1)
	},
	updateButton: {
		marginLeft: '20px'
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const NewsletterPopup = () => {
	const classes = useStyles();
	const [subscribed, setSubscribed] = useLocalStorage('cedalo.managementcenter.subscribedToNewsletter');
	const [showNewsletterPopup, setShowNewsletterPopup] = useLocalStorage('cedalo.managementcenter.showNewsletterPopup');

	const subscribeNewsletter = async (email) => {
		try {
			const response = await fetch(`/api/newsletter/subscribe`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email
				})
			});
			setSubscribed('true');
		} catch (error) {
			// TODO: add error handling
			console.error(error);
		}
	};

	useEffect(() => {
		const timer = setTimeout(async () => {

			if (subscribed !== 'true' && showNewsletterPopup !== 'false') {
				const { value: email, isConfirmed } = await MySwal.fire({
					position: 'bottom-end',
					title: 'Want to get all the news?',
					input: 'email',
					inputLabel: 'Subscribe to our newsletter!',
					inputPlaceholder: 'Enter your email address here',
					showCancelButton: true,
					width: 500,
				  });
				  if (isConfirmed) {
					await subscribeNewsletter(email);
					setShowNewsletterPopup('false');
					MySwal.fire({
						position: 'bottom-end',
						title: 'That worked!',
						text: 'You now get all the news for Mosquitto, MQTT and Streamsheets.',
						icon: 'success',
						width: 500,
					})
				  } else {
					setShowNewsletterPopup('false');
				  }
			}

		}, NEWSLETTER_POPUP_DELAY);
		return () => clearTimeout(timer);
	  }, []);
	return null;
};

const mapStateToProps = (state) => {
	return {};
};

export default connect(mapStateToProps)(NewsletterPopup);
