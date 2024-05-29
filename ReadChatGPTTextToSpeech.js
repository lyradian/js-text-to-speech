function SpeakText(message) {
	if ('speechSynthesis' in window) {
		// get the speechSynthesis object
		const synth = window.speechSynthesis;
		const utterance = new SpeechSynthesisUtterance();
		let speechRate = 2.4;
		let speechRateModifier = (message.length > 240 && message.length < 30000) ? Math.min(speechRate * 10 / message.length, 10) : 1;
		// set the text to speak
		utterance.text = message;
		utterance.rate = speechRate;

		utterance.onboundary = (event) => {
			if (event.name === 'word') {
				const word = event.target.text.substr(event.charIndex, event.charLength);
				if (word.endsWith(',') || word.endsWith('.') || word.endsWith('?') || word.endsWith('!')) {
					utterance.rate = speechRate * speechRateModifier / 2; // Adjust the rate for pauses after commas and periods
					utterance.pauseDuration = 500; // Adjust the pause duration for commas and periods (in milliseconds)
				} else {
					utterance.rate = speechRate; // Reset the rate for normal words
					utterance.pauseDuration = 0; // Reset the pause duration
				}
			}
		};
		
		const voices = synth.getVoices();
    // const language = DetectLanguage(message);
    // console.log(language, voices, message);
		//const voice = voices.find(voice => voice.lang.startsWith(language));
    //voices.find(voice => voice.lang === DetectLanguage(message));
		//utterance.voice = voice; 
    
		utterance.voice = voices.find(voice => voice.voiceURI.includes('Zira'));
		synth.speak(utterance);
	} else {
		console.log('Web Speech API not supported');
	}
}

function DetectLanguage(text) {
	const chineseRegex = new RegExp("[\u4E00-\u9FA5]+"); // Chinese
	const koreanRegex = new RegExp("[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+"); // Korean
	const japaneseRegex = new RegExp("[\u3040-\u30FF\u31F0-\u31FF]+"); // Japanese
	const frenchRegex = new RegExp("[\u00C0-\u017F]+"); // French
	const italianRegex = new RegExp("[\u00C0-\u024F\u1E00-\u1EFF]+"); // Italian
	const latinRegex = new RegExp("[\u0070-\u024F\u0250-\u02AF]+"); // Latin

	// Testing the text against each regex
	if (japaneseRegex.test(text)) return "ja-JP"; // Japanese
	if (chineseRegex.test(text)) return "zh-CN"; // Chinese
	if (koreanRegex.test(text)) return "ko-KR"; // Korean
	if (frenchRegex.test(text)) return "fr-FR"; // French
	if (italianRegex.test(text)) return "it-IT"; // Italian
	if (latinRegex.test(text)) return "la"; // Latin

	return "en-US";
}

function CheckLastResponse(textSelector) {
	const textResponses = document.querySelectorAll(textSelector);
	for (let i = textResponses.length - 1; textResponses.length > 0; i--) {
		let extractedText = textResponses[i].innerHTML;
		extractedText = extractedText.replace(/<\/[^>]+>/gi, ".");
		extractedText = extractedText.replace(/<\/?[^>]+>/gi, '');
		return extractedText;
	}
}

function StartService(textSelector) {
	let lastText = "";
	let currentText = "";
	let currentParagraphs = [];
	let paragraphIndex = 0;
	if ('speechSynthesis' in window) {
		const synth = window.speechSynthesis;
		setInterval(() => {
			let newText = CheckLastResponse(textSelector);

			if (lastText != currentText && currentText == newText && newText) {
				currentParagraphs = newText.split(".");
				lastText = currentText;
				paragraphIndex = 0;
			} else if (newText != currentText) {
				currentText = newText;
			}
			if (paragraphIndex < currentParagraphs.length && !synth.speaking) {
				SpeakText(currentParagraphs[paragraphIndex]);
				paragraphIndex += 1;
			}
		}, 500);

		document.getElementById('prompt-textarea').addEventListener('keydown', function(event) {
			if (event.key  === 'Enter'  && !event.ctrlKey) {
				lastText = "";
				currentText = "";
				paragraphIndex = 0;
			}
		});
	}
}

StartService('.prose');