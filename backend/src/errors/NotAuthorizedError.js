module.exports = class NotAuthorizedError extends Error {
	constructor() {
		super(`You don't have enough user rights to perform this operation`);
		this.name = 'NotAuthorizedError';
	}
}