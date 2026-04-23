const WebSocket = require('ws');

const clients = new Set();

function safeSend(client, payload) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
    }
}

function attachNotificationSocket(server) {
    const wss = new WebSocket.Server({
        server,
        path: '/ws/notifications'
    });

    wss.on('connection', (socket) => {
        clients.add(socket);
        safeSend(socket, {
            type: 'connected',
            data: {
                message: '通知通道已连接',
                connectedAt: new Date().toISOString()
            }
        });

        socket.on('close', () => {
            clients.delete(socket);
        });

        socket.on('error', () => {
            clients.delete(socket);
        });
    });

    return wss;
}

function broadcastNotification(notification) {
    const payload = {
        type: 'notification',
        data: {
            id: notification.id || `${notification.type}-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...notification
        }
    };

    clients.forEach((client) => safeSend(client, payload));
}

module.exports = {
    attachNotificationSocket,
    broadcastNotification,
    clients
};
