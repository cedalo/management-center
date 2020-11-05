import { Dispatch, useCallback, useEffect, useState } from 'react';

export default function useLocalStorage(key, initialValue = '') {
	const [value, setValue] = useState(() => window.localStorage.getItem(key) || initialValue);

	const setItem = (newValue) => {
		setValue(newValue);
		window.localStorage.setItem(key, newValue);
	};

	useEffect(() => {
		const newValue = window.localStorage.getItem(key);
		if (value !== newValue) {
			setValue(newValue || initialValue);
		}
	});

	const handleStorage = useCallback(
		(event) => {
			if (event.key === key && event.newValue !== value) {
				setValue(event.newValue || initialValue);
			}
		},
		[value]
	);

	useEffect(() => {
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, [handleStorage]);

	return [value, setItem];
}
