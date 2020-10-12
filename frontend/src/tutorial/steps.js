export default [
	{
	  id: 'intro',
	  attachTo: {
		  element: '#menu-item-home',
		  on: 'right-start'
	  },
	  beforeShowPromise: function () {
		return new Promise(function (resolve) {
		  setTimeout(function () {
			window.scrollTo(0, 0);
			resolve();
		  }, 500);
		});
	  },
	  buttons: [
		{
		  classes: 'tour-button-secondary',
		  text: 'Exit',
		  type: 'cancel'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Back',
		  type: 'back'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Next',
		  type: 'next'
		}
	  ],
	  highlightClass: 'highlight',
	  scrollTo: false,
	  cancelIcon: {
		enabled: true,
	  },
	  title: 'Welcome to React-Shepherd!',
	  text: ['React-Shepherd is a JavaScript library for guiding users through your React app.'],
	  when: {
		show: () => {
		  console.log('show step');
		},
		hide: () => {
		  console.log('hide step');
		}
	  }
	},
	{
	  id: 'intro2',
	  attachTo: {
		element: '#menu-item-clients',
		on: 'right-start'
	  },
	  beforeShowPromise: function () {
		return new Promise(function (resolve) {
		  setTimeout(function () {
			window.scrollTo(0, 0);
			resolve();
		  }, 500);
		});
	  },
	  buttons: [
		{
		  classes: 'tour-button-secondary',
		  text: 'Exit',
		  type: 'cancel'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Back',
		  type: 'back'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Next',
		  type: 'next'
		}
	  ],
	  highlightClass: 'highlight',
	  scrollTo: false,
	  cancelIcon: {
		enabled: true,
	  },
	  title: 'Hello',
	  text: ['Create and manage clients'],
	  when: {
		show: () => {
		  console.log('show step');
		},
		hide: () => {
		  console.log('hide step');
		}
	  }
	},
	{
	  id: 'intro3',
	  attachTo: {
		element: '#menu-item-groups',
		on: 'right-start'
	  },
	  beforeShowPromise: function () {
		return new Promise(function (resolve) {
		  setTimeout(function () {
			window.scrollTo(0, 0);
			resolve();
		  }, 500);
		});
	  },
	  buttons: [
		{
		  classes: 'tour-button-secondary',
		  text: 'Exit',
		  type: 'cancel'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Back',
		  type: 'back'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Next',
		  type: 'next'
		}
	  ],
	  highlightClass: 'highlight',
	  scrollTo: false,
	  cancelIcon: {
		enabled: true,
	  },
	  title: 'Hello',
	  text: ['Create and manage groups'],
	  when: {
		show: () => {
		  console.log('show step');
		},
		hide: () => {
		  console.log('hide step');
		}
	  }
	},
	{
	  id: 'intro3',
	  attachTo: {
		element: '#menu-item-roles',
		on: 'right-start'
	  },
	  beforeShowPromise: function () {
		return new Promise(function (resolve) {
		  setTimeout(function () {
			window.scrollTo(0, 0);
			resolve();
		  }, 500);
		});
	  },
	  buttons: [
		{
		  classes: 'tour-button-secondary',
		  text: 'Exit',
		  type: 'cancel'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Back',
		  type: 'back'
		},
		{
		  classes: 'tour-button-primary',
		  text: 'Next',
		  type: 'next'
		}
	  ],
	  highlightClass: 'highlight',
	  scrollTo: false,
	  cancelIcon: {
		enabled: true,
	  },
	  title: 'Hello',
	  text: ['Create and manage roles and ACLs and add them to clients and groups'],
	  when: {
		show: () => {
		  console.log('show step');
		},
		hide: () => {
		  console.log('hide step');
		}
	  }
	},
  ];