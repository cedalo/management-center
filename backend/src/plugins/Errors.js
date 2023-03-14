const InputError = {
	conflict: (message) => {
		const error = new Error(message);
		error.code = 'CONFLICT';
		return error;
	},
	invalid: (message = 'Bad request') => {
		const error = new Error(message);
		error.code = 'INVALID';
		return error;
	},
	notFound: (message) => {
		const error = new Error(message);
		error.code = 'NOT_FOUND';
		return error;
	},
	gone: (message = 'Requestsed object does not exist') => {
		const error = new Error(message);
		error.code = 'GONE';
		return error;
	}
};

const OtherError = {
	somethingWentWrong: (message) => {
		const error = new Error(message);
		error.code = 'SOMETHING_WRONG';
		return error;
	}
};

const InternalError = {
	unexpected: (message = 'Something went wrong!') => {
		const error = new Error(message);
		error.code = 'SOMETHING_WRONG';
		return error;
	}
};

const AuthError = {
	notAllowed: (message) => {
		const error = new Error(message);
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
