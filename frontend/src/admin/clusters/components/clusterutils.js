const SYNCMODES = Object.freeze([
	{
		label: 'Full Sync',
		value: 'full'
	},
	{
		label: 'Dynamic Security Sync',
		value: 'dynsec'
	}
]);

module.exports = {
	getSyncModes: () => SYNCMODES,
	getSyncModeLabel: (syncmode) => {
		const modeidx = syncmode === 'dynsec' ? 1 : 0;
		return SYNCMODES[modeidx].label;
	}
};
