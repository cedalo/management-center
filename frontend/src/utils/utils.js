export const trimString = (value) => {
	return (typeof value === 'string') ? value.trim() : value;
};