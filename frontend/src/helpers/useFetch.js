import { useEffect, useState } from 'react';

export default function useFetch(url, opts) {
	const [response, setResponse] = useState(null);
	const [loading, setLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	useEffect(() => {
		setLoading(true);
		fetch(url, opts)
			.then(async (res) => {
				const json = await res.json();
				setResponse(json);
				setLoading(false);
			})
			.catch(() => {
				setHasError(true);
				setLoading(false);
			});
	}, [url]);
	return [response, loading, hasError];
}
