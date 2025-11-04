const Bacon = require('baconjs')
const RawSdcpClient = require('./raw-client')
const { commands, actions, aspectRatio, powerStatus, memoryLens, inputs } = require('./commands')

const SdcpClient = (config = {}) => {
	const rawClient = RawSdcpClient(config);

	return {
		setPower: (powerOn) => {
			return rawClient.setAction(commands.SET_POWER, powerOn ? powerStatus.START_UP : powerStatus.STANDBY)
				.flatMap(() => rawClient.getAction(commands.GET_STATUS_POWER)
					.flatMap(result => Bacon.once(convertPowerStatusToString(result)))
				)
				.firstToPromise();
		},
		getPower: () => {
			return rawClient.getAction(commands.GET_STATUS_POWER)
				.flatMap(result => Bacon.once(convertPowerStatusToString(result)))
				.firstToPromise();
		},
		setAspectRatio: (ratio) => {
			return rawClient.setAction(commands.ASPECT_RATIO, ratio)
				.flatMap(() => rawClient.getAction(commands.ASPECT_RATIO)
					.flatMap(result => Bacon.once(convertAspectRatioToString(result)))
				)
				.firstToPromise();
		},
		getAspectRatio: () => {
			return rawClient.getAction(commands.ASPECT_RATIO)
				.flatMap(result => Bacon.once(convertAspectRatioToString(result)))
				.firstToPromise();
		},
		setMemoryLens: (command) => {
			return rawClient.setAction(commands.LENS_MEMORY, command)
				.flatMap(() => rawClient.getAction(commands.LENS_MEMORY)
					.flatMap(result => Bacon.once(convertMemoryLensToString(result)))
				)
				.firstToPromise();
		},
		getMemoryLens: () => {
			return rawClient.getAction(commands.LENS_MEMORY)
				.flatMap(result => Bacon.once(convertMemoryLensToString(result)))
				.firstToPromise();
		},
		setInput: (input) => {
			return rawClient.setAction(commands.INPUT, input)
				.flatMap(() => rawClient.getAction(commands.INPUT)
					.flatMap(result => Bacon.once(convertInputsToString(result)))
				)
				.firstToPromise();
		},
		getInput: () => {
			return rawClient.getAction(commands.INPUT)
				.flatMap(result => Bacon.once(convertInputsToString(result)))
				.firstToPromise();
		},
		getAction: (command, data) => {
			return rawClient.getAction(command, data).firstToPromise();
		},
		setAction: (command, data) => {
			return rawClient.setAction(command, data).firstToPromise();
		}
	};
}

const convertPowerStatusToString = (result) => {
	switch (result.data) {
		case powerStatus.STANDBY:
			return 'OFF';
		case powerStatus.START_UP:
		case powerStatus.START_UP_LAMP:
			return 'WARMING';
		case powerStatus.POWER_ON:
			return 'ON';
		case powerStatus.COOLING:
		case powerStatus.COOLING2:
			return 'COOLING';
		default:
			return new Bacon.Error(`Unknown power status ${result.data} (${result.raw.toString('hex').toUpperCase()})`);
	}
}

const convertValueToKey = (object = {}, name, result) => {
	const key = Object.keys(object).find(k => object[k] == result.data);
	if (typeof key == 'string')
		return key;
	return new Bacon.Error(`Unknown ${name} ${result.data} (${result.raw.toString('hex').toUpperCase()})`);
}

const convertAspectRatioToString = (result) => {
	return convertValueToKey(aspectRatio, 'aspect ratio', result);
}

const convertMemoryLensToString = (result) => {
	return convertValueToKey(memoryLens, 'memory lens', result);
}

const convertInputsToString = (result) => {
	return convertValueToKey(inputs, 'input', result);
}

module.exports = {
	SdcpClient,
	commands,
	actions,
	aspectRatio,
	powerStatus,
	memoryLens,
	inputs
}
