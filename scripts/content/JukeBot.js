function JukeBot() {
	var self = this;
	var updateInterval;
	var handlers = [];

	var lastKnownMessage;

	var djChanged = false;
	var songChanged = false;
	var delayActive = false;
	var delayTicks = 0;

	var thumbsUpElement;
	var thumbsDownElement;

	this.voteStates = {
		none: 'none',
		upvoted: 'upvoted',
		downvoted: 'downvoted'
	};
	this.voteState = this.voteStates.none;
	
	this.events = {
		songChanged: 'songChanged',
		voteChanged: 'voteChanged',
		messageReceived: 'messageReceived',
		userChanged: 'userChanged'
	};

	function checkCurrentUser() {
		var currentUser = getCurrentUsername();
		if (self.currentUser) {
			if (currentUser && self.currentUser != currentUser) {
				self.currentUser = currentUser;
				return true;
			}
		} else {
			if (currentUser) {
				self.currentUser = currentUser;
				return true;
			}
		}

		return false;
	}

	function checkNewMessages() {
		var newMessages = getMessages();
		if (lastKnownMessage) {
			if (newMessages && newMessages.length) {
				var latestMessage = newMessages[newMessages.length - 1];

				if (!compareMessage(lastKnownMessage, latestMessage)) {
					self.latestMessages = [latestMessage];
					for (var i = newMessages.length - 2; i >= 0; i--) {
						if (!compareMessage(lastKnownMessage, newMessages[i])) {
							self.latestMessages.push(newMessages[i]);
						} else {
							break;
						}
					}

					lastKnownMessage = newMessages[newMessages.length - 1];
					return true;
				}
			}
		} else {
			if (newMessages && newMessages.length) {
				lastKnownMessage = newMessages[newMessages.length - 1];
			}
		}
		return false;
	}

	function checkRoomName() {
		var roomName = getRoomName();

		if (self.roomName) {
			if (roomName && self.roomName != roomName) {
				self.roomName = roomName;
				return true;
			}
		} else {
			if (roomName) {
				self.roomName = roomName;
				return true;
			}
		}

		return false;
	}

	function checkDjChanged() {
		var dj = getCurrentDj();

		if (self.currentDj) {
			if (dj && self.currentDj.spotifyName != dj.spotifyName) {
				self.currentDj = dj;
				return true;
			}
		} else {
			if (dj) {
				self.currentDj = dj;
				return true;
			}
		}

		return false;
	}

	function checkSongChanged() {
		var newDj = checkDjChanged();
		var newSong = checkTrackChanged();

		var queuedUsers = document.querySelectorAll('.dj-queue .dj-user');
		if (queuedUsers.length > 0) {
			if (queuedUsers.length > 1) {
				if (newDj) {
					djChanged = true;
					delayActive = true;
				} else if (delayActive) {
					delayTicks++;
				}

				if (newSong || delayTicks == 4) {
					songChanged = true;
				}

				if (djChanged && songChanged) {
					djChanged = false;
					songChanged = false;
					delayActive = false;
					delayTicks = 0;
					return true;
				}
			} else {
				if (newSong) {
					return true;
				}
			}
		}

		return false;
	}

	function checkTrackChanged() {
		var song = getCurrentSong();
		if (self.currentSong) {
			var elapsedTime = getElapsedTime();
			self.currentSong.elapsedTime = elapsedTime != null ? elapsedTime : 0;
			if (song && (self.currentSong.title != song.title || self.currentSong.artists.join() != song.artists.join())) {
				self.currentSong = song;
				return true;
			}
		} else {
			if (song) {
				self.currentSong = song;
				return true;
			}
		}

		return false;
	}

	function checkVoteChanged() {
		var state = getVoteState();
		if (self.voteState) {
			if (state && self.voteState != state) {
				self.voteState = state;
				return true;
			}
		} else {
			if (state) {
				self.voteState = state;
				return true;
			}
		}

		return false;
	}

	function compareMessage(message1, message2) {
		return message1.author == message2.author && message1.text == message2.text;
	}
	
	function executeHandlers(handlers) {
		if (handlers) {
			for (var i = 0; i < handlers.length; i++) {
				handlers[i].callback();
			}
		}
	}

	function getCurrentDj() {
		var djElement = document.querySelector('.dj-queue .dj-user > a');
		
		if (!djElement) {
			return null;
		}
		
		var split = djElement.href.split(':');
		var spotifyName = split[split.length - 1];
		
		var jqbxName = djElement.children[1].innerHTML;
		
		return {
			spotifyName: spotifyName,
			jqbxName: jqbxName
		};
	}

	function getCurrentSong() {
		var songElement = document.querySelector('.center-tabs .track .name a');
		var artistElements = document.querySelectorAll('.center-tabs .track .artists a');
		var timeElements = document.querySelectorAll('.center-tabs .time span');

		if (!songElement || !artistElements.length || timeElements.length < 2) {
			return null;
		}
		
		var artists = [];
		for (var i = 0; i < artistElements.length; i++) {
			artists.push(artistElements[i].innerText);
		}

		var elapsedTime = parseTimeToSeconds(timeElements[0].innerText);
		var duration = parseTimeToSeconds(timeElements[1].innerText);
		
		return {
			artists: artists,
			elapsedTime: elapsedTime,
			duration: duration,
			title: songElement.innerText,
		};
	}

	function getCurrentUsername() {
		var userElement = document.querySelector('.user div.id');

		if (!userElement) {
			return null;
		}

		return userElement.innerText;
	}

	function getElapsedTime() {
		var timeElements = document.querySelectorAll('.center-tabs .time span');
		if (timeElements.length) {
			return parseTimeToSeconds(timeElements[0].innerText);
		}
		return null;
	}

	function getMessages() {
		var messages = [];

		var currentAuthor = null;
		var messageElements = document.querySelectorAll('.chat li.message');
		var length = messageElements.length < 15 ? messageElements.length : 15;
		for (var i = messageElements.length - length; i < messageElements.length; i++) {
			var messageElement = messageElements[i];


			var isAlert = messageElement.classList.contains('alert');

			var contentElement = messageElement.querySelector('p.content');

			var message = {
				isAlert: isAlert,
				text: contentElement.innerText,
				html: contentElement.innerHTML
			}

			if (!isAlert) {
				var authorElement = messageElement.querySelector('span.name > span');
				if (authorElement) {
					currentAuthor = messageElement.querySelector('span.name > span').innerText;
					message.author = currentAuthor;
				}
			}

			messages.push(message);
		}

		return messages;
	}

	function getRoomName() {
		var titleElement = document.querySelector('.header .title > span');

		if (!titleElement) {
			return null;
		}

		return titleElement.innerText;
	}

	function getVoteState() {
		thumbsUpElement = document.querySelector('button.thumbs-up');
		thumbsDownElement = document.querySelector('button.thumbs-down');

		if (!thumbsUpElement || !thumbsDownElement) {
			return null;
		}

		if (thumbsUpElement.classList.contains('active')) {
			return self.voteStates.upvoted;
		} else if (thumbsDownElement.classList.contains('active')) {
			return self.voteStates.downvoted;
		} else {
			return self.voteStates.none;
		}
	}

	function parseTimeToSeconds(time) {
		var groups = time.split(':');
		if (groups.length == 2) {
			return parseInt(groups[0] * 60) + parseInt(groups[1]);
		} else if (groups.length == 3) {
			return parseInt(groups[0] * 60 * 60) + parseInt(groups[1] * 60) + parseInt(groups[2]);
		}
	}

	function sendVote(upvote) {
		thumbsUpElement = document.querySelector('button.thumbs-up');
		thumbsDownElement = document.querySelector('button.thumbs-down');

		if (thumbsUpElement && !thumbsUpElement.classList.contains('active') &&
				thumbsDownElement && !thumbsDownElement.classList.contains('active')) {
			if (upvote) {
				thumbsUpElement.click();
			} else {
				thumbsDownElement.click();
			}
			chrome.runtime.sendMessage({
				event: 'voted',
				data: {
					result: !!upvote
				}
			});
		}
	}
	
	this.upvote = function () {
		sendVote(true);
	};

	this.downvote = function () {
		sendVote(false);
	};
	
	this.addHandler = function (id, eventType, callback) {
		if (!this.events[eventType]) {
			return false;
		}

		if (!handlers[eventType]) {
			handlers[eventType] = [];
		}

		for (var i = 0; i < handlers[eventType].length; i++) {
			if (handlers[eventType][i].id === id) {
				return false;
			}
		}

		handlers[eventType].push({
			id: id,
			callback: callback
		});

		return true;
	};
	
	this.removeHandler = function (id, eventType) {
		var handlerArray = handlers[eventType];

		if (handlerArray) {
			for (var i = 0; i < handlerArray.length; i++) {
				if (handlerArray[i].id == id) {
					handlerArray.splice(i, 1);
					return true;
				}
			}
		}

		return false;
	};
	
	this.start = function () {
		updateInterval = setInterval(function () {
			if (checkSongChanged()) {
				executeHandlers(handlers[self.events.songChanged]);
			}

			if (checkVoteChanged()) {
				executeHandlers(handlers[self.events.voteChanged]);
			}

			if (checkNewMessages()) {
				executeHandlers(handlers[self.events.messageReceived]);
			}

			if (checkCurrentUser()) {
				executeHandlers(handlers[self.events.userChanged]);
			}
		}, 250);
	};
	
	this.stop = function () {
		clearInterval(updateInterval);
	};
};