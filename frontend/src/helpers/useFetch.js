import { useEffect, useState } from 'react';

const LOGIN_ENDPOINT = '/login?error=session-expired';

export default function useFetch(url, opts) {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(url, opts)
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                return response;
            })
            .then(async (response) => {
                const json = await response.json();
                setResponse(json);
                setLoading(false);
            })
            .catch((errorResponse) => {
                errorResponse
                    .json()
                    .then((errorData) => {
                        if (
                            errorResponse.status === 401 &&
                            errorData.code === 'UNAUTHORIZED' &&
                            !errorData.data?.session
                        ) {
                            // If the session has expired, redirect to login
                            console.error('Session has expired or is invalid');
                            window.location.href = (process.env.PUBLIC_URL || '') + LOGIN_ENDPOINT;
                        } else {
                            console.error(errorData);
                        }
                    })
                    .catch((error) => {
                        console.error('useFetch:', error);
                    });
                setHasError(true);
                setLoading(false);
            });
    }, [url]);
    return [response, loading, hasError];
}
