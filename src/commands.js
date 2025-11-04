/*
Commands acquired from Sony video projector PROTOCOL MANUAL 1st Edition.
(Shady PDF from: https://www.digis.ru/upload/iblock/f5a/VPL-VW320,%20VW520_ProtocolManual.pdf )
*/


//PJTalk Command: "Set IR_LensZoomLarge" 
//Request=Set           => 0x00
//Item=IR_LensZoomLarge => 0x1777
//DataLength=2          => 0x02
//Data=0000             => 0x0000
// 0x00, 0x1772, 0x02, 0x0000


const actions = {
    GET: '01',
    SET: '00'
}

const commands = {
    SET_POWER: '0130',
    CALIBRATION_PRESET: '0002',
    ASPECT_RATIO: '0020',
    LENS_MEMORY: '0020',
    INPUT: '0001',
    GET_STATUS_ERROR: '0101',
    GET_STATUS_POWER: '0102',
    GET_STATUS_LAMP_TIMER: '0113'
}

const memoryLens = {
    SHIFT_UP: '1772',
    SHIFT_DOWN: '1773',
    FOCUS_FAR: '1774',
    FOCUS_NEAR: '1775',
    ZOOM_LARGE: '1777',
    ZOOM_SMALL: '1778',
    CURSOR_RIGHT: '1733',
    CURSOR_LEFT: '1734',
    CURSOR_UP: '1735',
    CURSOR_DOWN: '1736',
    ENTER: '175A',
    MENU: '1729'
}

const inputs = {
    HDMI1: '0002',
    HDMI2: '0003'
}

const aspectRatio = {
    NORMAL: '0001',
    V_STRETCH: '000B',
    ZOOM_1_85: '000C',
    ZOOM_2_35: '000D',
    STRETCH: '000E',
    SQUEEZE: '000F'
}

const powerStatus = {
    STANDBY: '0000',
    START_UP: '0001',
    START_UP_LAMP: '0002',
    POWER_ON: '0003',
    COOLING: '0004',
    COOLING2: '0005'
}

module.exports = {
    commands,
    actions,
    aspectRatio,
    powerStatus,
    memoryLens,
    inputs
}
