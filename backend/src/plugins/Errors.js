const DEFAULT_ERROR_MESSAGE = 'An error has occured'

const makeError = (message) => {
	return new Error(message || DEFAULT_ERROR_MESSAGE);
};

const InputError = {
	conflict: (message='Conflict') => {
		const error = makeError(message);
		error.code = 'CONFLICT';
		return error;
	},
	invalid: (message='Bad request') => {
		const error = makeError(message);
		error.code = 'INVALID';
		return error;
	},
	notFound: (message='Not Found') => {
		const error = makeError(message);
		error.code = 'NOT_FOUND';
		return error;
	},
	gone: (message='Requestsed object does not exist') => {
		const error = makeError(message);
		error.code = 'GONE';
		return error;
	}
};

const OtherError = {
	somethingWentWrong: (message='Something went wrong') => {
		const error = makeError(message);
		error.code = 'SOMETHING_WRONG';
		return error;
	}
};

const InternalError = {
	unexpected: (message='Something went wrong!') => {
		const error = makeError(message);
		error.code = 'SOMETHING_WRONG';
		return error;
	}
};

const AuthError = {
	notAllowed: (message='Not Allowed') => {
		const error = makeError(message);
		error.code = 'NOT_ALLOWED';
		return error;
	}
};

module.exports = {
	InternalError,
	InputError,
	AuthError,
	OtherError
};
