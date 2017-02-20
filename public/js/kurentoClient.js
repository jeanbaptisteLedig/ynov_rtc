/*
 * (C) Copyright 2014-2015 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const ws = new WebSocket('wss://'+ location.host +'/kurento');
let video;
let webRtcPeer;

window.onload = function() {
	video = document.getElementById('video');

	document.getElementById('call').addEventListener('click', function() { presenter('webcam'); } );
	document.getElementById('share_screen').addEventListener('click', function() { presenter('screen'); } );
	document.getElementById('viewer').addEventListener('click', function() { viewer(); } );
	document.getElementById('terminate').addEventListener('click', function() { stop(); } );
};

window.onbeforeunload = function() {
	ws.close();
};

ws.onmessage = function(message) {
	let parsedMessage = JSON.parse(message.data);
	console.info('Received message: ' + message.data);

	switch (parsedMessage.id) {
	case 'presenterResponse':
		presenterResponse(parsedMessage);
		break;
	case 'viewerResponse':
		viewerResponse(parsedMessage);
		break;
	case 'stopCommunication':
		dispose();
		break;
	case 'iceCandidate':
		webRtcPeer.addIceCandidate(parsedMessage.candidate);
		break;
	default:
		console.error('Unrecognized message', parsedMessage);
	}
};

function presenterResponse(message) {
	if (message.response !== 'accepted') {
		let errorMsg = message.message ? message.message : 'Unknow error';
		console.warn('Call not accepted for the following reason: ' + errorMsg);
		dispose();
	} else {
		webRtcPeer.processAnswer(message.sdpAnswer);
	}
}

function viewerResponse(message) {
	if (message.response !== 'accepted') {
		let errorMsg = message.message ? message.message : 'Unknow error';
		console.warn('Call not accepted for the following reason: ' + errorMsg);
		dispose();
	} else {
		webRtcPeer.processAnswer(message.sdpAnswer);
	}
}

function presenter(source) {
	if (!webRtcPeer) {
		showSpinner(video);

		let options = {
			localVideo: video,
			onicecandidate : onIceCandidate,
			sendSource: source
		};

		webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
			if(error) return onError(error);

			this.generateOffer(onOfferPresenter);
		});
	}
}

function onOfferPresenter(error, offerSdp) {
    if (error) return onError(error);

	let message = {
		id : 'presenter',
		sdpOffer : offerSdp
	};
	sendMessage(message);
}

function viewer() {
	if (!webRtcPeer) {
		showSpinner(video);

		let options = {
			remoteVideo: video,
			onicecandidate : onIceCandidate
		};

		webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
			if(error) return onError(error);

			this.generateOffer(onOfferViewer);
		});
	}
}

function onOfferViewer(error, offerSdp) {
	if (error) return onError(error);

	let message = {
		id : 'viewer',
		sdpOffer : offerSdp
	};
	sendMessage(message);
}

function onIceCandidate(candidate) {
	   console.log('Local candidate' + JSON.stringify(candidate));

	   let message = {
	      id : 'onIceCandidate',
	      candidate : candidate
	   };
	   sendMessage(message);
}

function stop() {
	if (webRtcPeer) {
		let message = {
				id : 'stop'
		};
		sendMessage(message);
		dispose();
	}
}

function dispose() {
	if (webRtcPeer) {
		webRtcPeer.dispose();
		webRtcPeer = null;
	}
	hideSpinner(video);
}

function sendMessage(message) {
	let jsonMessage = JSON.stringify(message);
	console.log('Senging message: ' + jsonMessage);
	ws.send(jsonMessage);
}

function showSpinner() {
	for (let i = 0; i < arguments.length; i++) {
		arguments[i].poster = './public/img/transparent-1px.png';
		arguments[i].style.background = 'center transparent url("./public/img/spinner.gif") no-repeat';
	}
}

function hideSpinner() {
	for (let i = 0; i < arguments.length; i++) {
		arguments[i].src = '';
		arguments[i].poster = './public/img/webrtc.png';
		arguments[i].style.background = '';
	}
}

function onError(error) {
	console.log('%c'+error, 'background: #222; color: #bada55');
}