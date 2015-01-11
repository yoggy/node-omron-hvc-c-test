#!/usr/bin/nodejs

var noble = require('noble');

noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		noble.startScanning([], true);
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', function(peripheral) {
	var uuid = peripheral.uuid
    var localName = peripheral.advertisement.localName;

	if (localName != null && localName.match(/omron_hvc_/)) {
		console.log('uuid=' + uuid + ", localName=" + localName);
	}
});



