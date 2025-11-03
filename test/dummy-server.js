const net = require('net');

const ERROR_INVALID_REQUEST = '020A534F4E59000130021003';

const createDummyServer = (cb) => {
    const mocks = {};
    const server = net.createServer(socket => {
        socket.on('data', (data) => {
            const asHex = data.toString('hex').toUpperCase();
            if (mocks[asHex]) {
                socket.write(hexStringToBuffer(mocks[asHex]));
            } else {
                console.log('Unknown request', asHex);
                socket.write(hexStringToBuffer(ERROR_INVALID_REQUEST));
            }
        })
    })

    server.on('error', (err) => {
        throw err;
    })

    server.listen(s => {
        const { port } = server.address();
        cb({ port, mock, server });
    })

    const hexStringToBuffer = (value) => Buffer.from(value, 'hex');

    const mock = (request, reply) => {
        mocks[request] = reply
    }
}

module.exports = createDummyServer;
