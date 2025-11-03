const net = require('net');
const Bacon = require('baconjs');
const { actions } = require('./commands');

const RawSdcpClient = (config = {}) => {
	const debug = (msg, param) => {
		if (config.debug) {
			console.log(`** DEBUG: ${msg}`, param);
		}
	}

	const createMessageAsHex = (action, command, data) => {
		const VERSION = '02';
		const CATEGORY = '0A';
		const COMMUNITY = config.community || '534F4E59'; // Default to 'SONY'
		if (typeof command !== 'string') {
			throw new Error(`Accepts command only as String (HEX) for now, was ${typeof command}`);
		}
		if (command.length !== 4) {
			throw new Error('Command must be 4 bytes long');
		}
		if (data && typeof data !== 'string') {
			throw new Error(`Accepts data only as String (HEX) for now, was ${typeof data}`);
		}
		const dataLength = ('00' + ((data || '').length / 2)).substr(-2);

		return hexStringToBuffer([VERSION, CATEGORY, COMMUNITY, action, command, dataLength, data || ''].join(''));
	}

	const parseResponse = (value) => {
		if (value && (value.Error || value.errno)) {
			return Bacon.once(new Bacon.Error(value));
		}
		const str = value.toString('hex').toUpperCase();
		if (str.length < 20) {
			return Bacon.once(new Bacon.Error(`Unknown response ${str} (${value})`));
		}
		const version = str.substring(0, 2);
		const category = str.substring(2, 4);
		const community = str.substring(4, 12);
		const success = str.substring(12, 14);
		const command = str.substring(14, 18);
		const dataLength = str.substring(18, 20);
		const data = str.substring(20, 20 + parseInt(dataLength, 16) * 2);
		const result = {
			version,
			category,
			community,
			command,
			dataLength,
			data,
			error: success !== '01',
			raw: value
		}
		return Bacon.once(result.error ? new Bacon.Error(result) : result);
	}

	const processActionQueue = ({ msg, id }) => {
		debug('Process queue, next msg', msg);
		const client = new net.Socket();
		const disconnected = Bacon.fromEvent(client, 'close').take(1);
		const errors = Bacon.mergeAll(
			Bacon.fromEvent(client, 'timeout'),
			Bacon.fromEvent(client, 'error'),
			Bacon.later(config.timeout || 5000, { Error: 'Response timeout' })
		).flatMapError(v => v).take(1);

		const connected = Bacon.fromNodeCallback(client, 'connect', config.port, config.address).take(1);

		const response = Bacon.fromEvent(client, 'data')
			.merge(errors)
			.flatMap(parseResponse)
			.take(1)
			.takeUntil(disconnected);

		connected.onValue(_ => client.write(msg));

		response.flatMapError(() => true).onValue(() => client.destroy());

		return response.map(value => ({ ...value, id: id }));
	}

	debug('Connecting to ', { port: config.port, address: config.address });
	let msgId = 0; // Mutable message id, nasty.
	const actionQueue = new Bacon.Bus();
	const responses = actionQueue.flatMapConcat(processActionQueue);

	const addActionToQueue = (action, command, data) => {
		const msg = createMessageAsHex(action, command, data);
		// What follows is nasty mutate!
		const currentId = ++msgId;
		setTimeout(() => {
			debug(`Add message id ${currentId} to queue`, { action, command, data });
			actionQueue.push({ msg, id: currentId });
		}, 1);

		return responses.filter(response => response.id === currentId).take(1);
	}

	return {
		getAction: (command, data) => addActionToQueue(actions.GET, command, data),
		setAction: (command, data) => addActionToQueue(actions.SET, command, data),
		responses
	}
}

const hexStringToBuffer = (value) => Buffer.from(value, 'hex');

module.exports = RawSdcpClient;
