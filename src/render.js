const videoElement = document.querySelector('video');
const videoSelectBtn = document.getElementById('hello')

videoSelectBtn.onclick = getVideoSources;

const { desktopCapturer, remote } = require('electron')
const { Menu } = remote;

async function getVideoSources() {
		const inputSources = await desktopCapturer.getSources({
			types: ['window',  'screen']
		});

		const videoOptionsMenu = await Menu.buildFromTemplate(
			inputSources.map(source => {
				return {
					label: source.name,
					click: () => selectSource(source)
				}
			})
		)

		videoOptionsMenu.popup();
};

let mediaRecorder;
const recordedChunks = [];


const startBtn = document.getElementById('startBtn');
startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};

async function selectSource(source) {
	videoSelectBtn.innerText = source.name;

	const constraints = {
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: source.id
			}
		}
	}
	const stream = await navigator.mediaDevices.getUserMedia(constraints);

	videoElement.srcObject = stream
	videoElement.play()

	const options = { mimeType: 'video/webm; codecs=vp9' };
	mediaRecorder = new MediaRecorder(stream, options);

	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.onstop = handleStop;
}


function handleDataAvailable(e) {
	recordedChunks.push(e.data);
}

async function handleStop(e) {
	const blob = new Blob(recordedChunks, {
		type: 'video/webm; codecs=vp9'
	});
	const buffer = new Buffer.from(await blob.arrayBuffer());

	const { filePath } = await dialog.showSaveDialog({
		buttonLabel: 'Save Video',
		defaultPath: `vid-${Date.now()}.webm`
	})

	writeFilePath(filePath, buffer, () => console.log('vieo saved successful'));

}
