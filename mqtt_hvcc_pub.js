#!/usr/bin/nodejs
//
// mqtt publish sample for OMRON HVC-C1B
//
// HVC-C1B serial protocol
//   http://plus-sensing.omron.co.jp/product/files/HVC-C1B_%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%88%E3%82%99%E4%BB%95%E6%A7%98%E6%9B%B8_A.pdf
//
// how to use
//   $ sudo apt-get install bluetooth bluez-utils libbluetooth-dev
//   $ npm install noble
//   $ npm install lodash
//   $ npm install mqtt
//   $ npm install confy
//   $ sudo EDITOR=vim ~/node_modules/confy/bin/confy set mqtt_hvcc_pub
//
//       {
//         "host": "mqtt.example.com",
//         "port": 1883,
//         "username": "username",
//         "password": "password",
//         "topic": "publish_topic"
//       }
//       
//   $ sudo nodejs mqtt_hvcc_pub
//

var noble = require('noble');
var _ = require('lodash');
var mqtt = require ('mqtt');

var confy = require('confy')
var config;
confy.get('mqtt_hvcc_pub', {require:{
	host     : 'mqtt.example.com',
	port     : 1883,
	username : 'username',
	password : 'password',
	topic    : 'topic'
}}, function(err, result) {
	config = result;
});

var client = mqtt.createClient(config.port, config.host, {
		username: config.username,
		password: config.password
	});

function publish_result(result) {
	console.log("publish_result() : topic=" + config.topic);

	if (result == null || result.face.length == 0) {
		client.publish(config.topic, JSON.stringify({'detect' : 0}));
		return;
	}

	var face = result.face[0];

	var h = {detect:result.length}

	h.x              = face.x;
	h.y              = face.y;
	h.size           = face.size;
	h.confidence     = face.confidence;

	h.dir_yaw        = face.dir.yaw;
	h.dir_pitch      = face.dir.pitch;
	h.dir_roll       = face.dir.roll;
	h.dir_confidence = face.dir.confidence;

	h.age_age        = face.age.age;
	h.age_confidence = face.age.confidence;

	h.gen_gender     = face.gen.gender;
	h.gen_confidence = face.gen.confidence;

	h.gaze_gazeLR    = face.gaze.gazeLR;
	h.gaze_gazeUD    = face.gaze.gazeUD;

	h.blink_ratioL   = face.blink.ratioL
	h.blink_ratioR   = face.blink.ratioR

	h.exp_expression = face.exp.expression;
	h.exp_score      = face.exp.score;
	h.exp_degree     = face.exp.degree;
	
	client.publish(config.topic, JSON.stringify(h));
}

var service_uuid = '35100001-d13a-4f39-8ab3-bf64d4fbb4b4'.replace(/\-/g, '');
var tx_char_uuid    = '35100002-d13a-4f39-8ab3-bf64d4fbb4b4'.replace(/\-/g, '');
var rx_char_uuid    = '35100003-d13a-4f39-8ab3-bf64d4fbb4b4'.replace(/\-/g, '');

var tx, rx;
var rx_buf = new Buffer(0);
var on_response = null;

function clear_rx_buf() {
	rx_buf = new Buffer(0);
}

function on_read(data, isNotification) {
	rx_buf = Buffer.concat([rx_buf, data])

	// check response header
	if (rx_buf[0] != 0xfe) {
		console.log("invalid response data...");
		clear_rx_buf();
		return;
	}

	// check payload length
	var data_len = rx_buf.readUInt32LE(2);
	var response_len = 1 + 1 + 4 + data_len;
	if (rx_buf.length < response_len) {
		// nothing to do...
		return
	}
	else if (rx_buf.length > response_len) {
		console.log("invalid response data...");
		clear_rx_buf();
		return
	}

	var response_code = rx_buf.readUInt8(1);

	if (on_response) {
		on_response(response_code, rx_buf.slice(6, rx_buf.length));
	}
	clear_rx_buf();
}

function hvcc_send_cmd(buf) {
	clear_rx_buf();
	console.log('hvcc_send_cmd() : buf=' + buf.toString('hex'));
	tx.write(buf)
}

function hvcc_version(callback) {
	on_response = function(response_code, data) {
		var str             = data.slice(0, 12).toString();
		var major_version   = data.slice(12, 13).readUInt8(0);
		var minor_version   = data.slice(13, 14).readUInt8(0);
		var release_version = data.slice(15, 16).readUInt8(0);
		var rev             = data.slice(16, 20).toString('hex')

		if (callback) {
			callback(response_code, str, major_version, minor_version, release_version, rev);
		}
	};

	hvcc_send_cmd(new Buffer('fe000000', 'hex'));
}

function hccv_set_camera_orientation(angle, callback) {
	on_response = function(response_code, data) {
		if (callback) {
			callback(response_code);
		}
	};

	var n = 0;
	if (angle == 0) {
		n = 0
	}
	else if (angle == 90) {
		n = 1;
	}
	else if (angle == 180) {
		n = 2;
	}
	else if (angle == 270) {
		n = 3;
	}

	var buf = new Buffer(5);
	buf[0] = 0xfe;
	buf[1] = 0x01;
	buf.writeUInt16LE(1, 2); // data length
	buf.writeUInt8(n, 4);    // orientation (0-3)

	hvcc_send_cmd(buf);
}

function parse_body_data(size, data) {
	var result = [];

	for (var i = 0; i < size; ++i) {
		var d = data.slice(i * 8, i * 8 + 8);
		var r = {};
		r.x          = d.readUInt16LE(0);
		r.y          = d.readUInt16LE(2);
		r.size       = d.readUInt16LE(4);
		r.confidence = d.readUInt16LE(6);

		result.push(r);
	}
	return result;
}

function parse_hand_data(size, data) {
	var result = [];

	for (var i = 0; i < size; ++i) {
		var d = data.slice(i * 8, i * 8 + 8);
		var r = {};
		r.x          = d.readUInt16LE(0);
		r.y          = d.readUInt16LE(2);
		r.size       = d.readUInt16LE(4);
		r.confidence = d.readUInt16LE(6);

		result.push(r);
	}
	return result;
}

function parse_face_data(size, data) {
	var result = [];

	for (var i = 0; i < size; ++i) {
		var d = data.slice(i * 31, i * 31 + 31);

		var r = {};
		r.x              = d.readInt16LE(0); 
		r.y              = d.readInt16LE(2);
		r.size           = d.readInt16LE(4);
		r.confidence     = d.readUInt16LE(6); 

		r.dir = {};
		r.dir.yaw        = d.readInt16LE(8);
		r.dir.pitch      = d.readInt16LE(10);
		r.dir.roll       = d.readInt16LE(12);
		r.dir.confidence = d.readUInt16LE(14);

		r.age = {};
		r.age.age        = d.readInt8(16);
		r.age.confidence = d.readUInt16LE(17);

		r.gen = {};
		var gen = d.readInt8(19);
		switch(gen) {
		case 0:
			r.gen.gender = 'female';
			break;
		case 1:
			r.gen.gender = 'male';
			break;
		default:
			r.gen.gender = 'unknown';
		}
		r.gen.confidence = d.readUInt16LE(20);

		r.gaze = {};
		r.gaze.gazeLR    = d.readInt8(22);
		r.gaze.gazeUD    = d.readInt8(23);

		r.blink = {};
		r.blink.ratioL   = d.readInt16LE(24);
		r.blink.ratioR   = d.readInt16LE(26);

		r.exp = {};
		var exp = d.readInt8(28);
		switch(exp) {
		case 1:
			r.exp.expression = "neutral";
			break;
		case 2:
			r.exp.expression = "happiness";
			break;
		case 3:
			r.exp.expression = "surprise";
			break;
		case 4:
			r.exp.expression = "anger";
			break;
		case 5:
			r.exp.expression = "sadness";
			break;
		default:
			r.exp.expression = "unknown";
			break;
		}
	
		r.exp.score      = d.readInt8(29);
		r.exp.degree     = d.readInt8(30);
	
		result.push(r);
	}

	return result;
}

function parse_execute_result(data) {
	//
	//  detection result payload format
	//      header(4byte)
	//      body_data(8byte) * body_num
	//      hand_data(8byte) * hand_num
	//      face_data(2～31byte) * face_num
	//

	// header
	var body_num = data.readUInt8(0);
	var hand_num = data.readUInt8(1);
	var face_num = data.readUInt8(2);

	var idx = 4;
	body_data = data.slice(idx, idx + 8 * body_num);

	idx += body_data.length
	hand_data = data.slice(idx, idx + 8 * hand_num);

	idx += hand_data.length
	face_data = data.slice(idx, idx + 31 * face_num);

	result = {};
	result.body = parse_body_data(body_num, body_data);
	result.hand = parse_hand_data(hand_num, hand_data);
	result.face = parse_face_data(face_num, face_data);

	return result;
}

function hccv_execute(callback) {
	console.log('hccv_execute()');

	on_response = function(response_code, data) {
		console.log("hccv_execute() : response_code = " + response_code);

		result = parse_execute_result(data);

		if (callback) {
			callback(response_code, result);
		}
	};

	var buf = new Buffer(7);
	buf[0] = 0xfe;
	buf[1] = 0x03;
	buf.writeUInt16LE(3, 2); // data length
	buf.writeUInt8(0xfc, 4); // (disable body & hands detection...)
	buf.writeUInt8(0x01, 5); 
	buf.writeUInt8(0x00, 6); 

	hvcc_send_cmd(buf);
}

function main_loop() {
	setTimeout(function() {
		hccv_execute(function(resonse_code, result) {
			console.log(JSON.stringify(result,null,4));
			publish_result(result);
			main_loop();
		});
	}, 1000);
}

function start_hvcc() {
	hvcc_version(function(response_code, str, major_version, minor_version, release_version, rev) {
		console.log("hvcc_version() : str=" + str + ", major_version=" + major_version + ", minor_version=" + minor_version + ", release_version=" + release_version + ", rev=" + rev);

		hccv_set_camera_orientation(0, function(response_code) {
			main_loop();
		});
	});
}

noble.on('discover', function(peripheral) {
	var uuid = peripheral.uuid
    var localName = peripheral.advertisement.localName;

	if (localName != null && localName.match(/omron_hvc_/)) {
		noble.stopScanning();

		console.log('HVC-C is found! uuid=' + uuid + ", localName=" + localName);

		peripheral.connect(function(err) {
			console.log('connect... : uuid=' + uuid);

			peripheral.discoverServices([], function(err, services) {
				service = _.find(services, function(s) {return s.uuid === service_uuid});
				service.discoverCharacteristics([], function(err,chars) {
					rx = _.find(chars, function(c) {return c.uuid === rx_char_uuid});
					tx = _.find(chars, function(c) {return c.uuid === tx_char_uuid});

					rx.notify(true);
					rx.on('read', on_read);

					setTimeout(start_hvcc, 100);
				});
			});
		});
	}
});

noble.startScanning([], false);

