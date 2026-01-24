import axios from 'axios';

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return new Promise(() => {});
        }

        if (error?.message === 'Network Error' && !error?.response) {
            return new Promise(() => {});
        }

        return Promise.reject(error);
    },
);
