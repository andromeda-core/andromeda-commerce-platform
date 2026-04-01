const getSocketId = () => {
    return new Promise((resolve) => {
        const id = window.Echo?.socketId();
        if (id) {
            resolve(id);
            return;
        }
        // Connected nahi hua abhi, wait karo
        window.Echo.connector.pusher.connection.bind('connected', function handler() {
            window.Echo.connector.pusher.connection.unbind('connected', handler);
            resolve(window.Echo.socketId());
        });
    });
};

export default getSocketId;
