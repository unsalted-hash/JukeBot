var pageElements;
var progressInterval;
var fader;

var autoDootEnabled;
var notifierEnabled;

window.onload = function () {
    fader = new Fader();
    pageElements = findElements();
    initHandlers();

    chrome.storage.sync.get('autoDootEnabled', function (response) {
        initAutoDoot(response.autoDootEnabled);
    });

    chrome.storage.sync.get('notifierEnabled', function (response) {
        initNotifier(response.notifierEnabled);
    });

    sendMessage('popup_loaded');
};

function initAutoDoot(enabled) {
    autoDootenabled = enabled;
    if (enabled) {
        pageElements.autoDootButton.innerText = 'Stop';
        pageElements.autoDootTitle.classList.add('started');
    }
}

function initNotifier(enabled) {
    notifierEnabled = enabled;
    if (enabled) {
        pageElements.notifierButton.innerText = 'Stop';
        pageElements.notifierTitle.classList.add('started');
    }
}

function initHandlers() {
    pageElements.upvote.onclick = function () {
        if (!this.classList.contains('inactive') && !this.classList.contains('active')) {
            this.classList.add('active');
            pageElements.downvote.classList.add('inactive');
            sendMessage('vote_changed', {voteState: 'upvoted'})
        }
    };

    pageElements.downvote.onclick = function () {
        if (!this.classList.contains('inactive') && !this.classList.contains('active')) {
            this.classList.add('active');
            pageElements.upvote.classList.add('inactive');
            sendMessage('vote_changed', {voteState: 'upvoted'});
        }
    };

    pageElements.autoDootButton.onclick = function () {
        autoDootEnabled = !autoDootEnabled;
        chrome.storage.sync.set({'autoDootEnabled': autoDootEnabled});

        sendMessage('auto_doot_toggled', {enabled: autoDootEnabled});

        if (autoDootEnabled) {
            pageElements.autoDootButton.innerText = 'Stop'
            pageElements.autoDootTitle.classList.add('started');
        } else {
            pageElements.autoDootButton.innerText = 'Start';
            pageElements.autoDootTitle.classList.remove('started');
        }
    };

    pageElements.notifierButton.onclick = function () {
        notifierEnabled = !notifierEnabled;
        chrome.storage.sync.set({'notifierEnabled': notifierEnabled});

        sendMessage('notifier_toggled', {enabled: notifierEnabled});

        if (notifierEnabled) {
            pageElements.notifierButton.innerText = 'Stop'
            pageElements.notifierTitle.classList.add('started');
        } else {
            pageElements.notifierButton.innerText = 'Start';
            pageElements.notifierTitle.classList.remove('started');
        }
    };
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.event) {
        case 'song_changed':
            updateSong(request.data);
            break;
        case 'vote_changed':
            updateVoteButtons(request.data.voteState);
            break;
    }
});

function findElements() {
    return {
        songContainer: document.getElementById('song-display'),
        songTitle: document.getElementById('song-title'),
        artists: document.getElementById('artists'),
        dj: document.getElementById('dj'),
        upvote: document.getElementById('upvote'),
        downvote: document.getElementById('downvote'),
        progressBar: document.getElementById('progress-bar'),
        progressFill: document.getElementById('progress-fill'),
        autoDootTitle: document.getElementById('auto-doot-title'),
        autoDootButton: document.getElementById('auto-doot-button'),
        notifierTitle: document.getElementById('notifier-title'),
        notifierButton: document.getElementById('notifier-button')
    };
}

function resetProgressBar(elapsed, duration) {
    clearInterval(progressInterval);

    var computedWidth = window.getComputedStyle(pageElements.progressBar).getPropertyValue('width');
    var maxWidth = parseFloat(computedWidth);
    var increment = maxWidth / duration;

    pageElements.progressFill.style.width = parseFloat(elapsed * increment) + 'px';

    progressInterval = setInterval(function () {
        var currentWidth = parseFloat(pageElements.progressFill.style.width);
        if (currentWidth < maxWidth) {
            var newWidth = parseFloat(pageElements.progressFill.style.width) + increment;
            if (newWidth <= maxWidth) {
                pageElements.progressFill.style.width = newWidth + 'px';
            } else {
                pageElements.progressFill.style.width = maxWidth;
                clearInterval(progressInterval);
            }
        }
    }, 1000);
}

function sendMessage(event, data, callback) {
    chrome.tabs.query({url: '*://app.jqbx.fm/*', currentWindow: true}, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
                event: event,
                data: data
            }, callback);
        }
    });
}

function updateSong(songData) {
    if (songData && songData.song && songData.dj) {
        fader.fadeOut(pageElements.songContainer, function () {
            pageElements.songTitle.innerText = songData.song.title;
            pageElements.artists.innerText = songData.song.artists.join(', ');
            pageElements.dj.innerText = songData.dj.jqbxName;
            resetProgressBar(songData.song.elapsedTime, songData.song.duration);
            fader.fadeIn(pageElements.songContainer);
        });
    } else {
        fader.fadeOut(pageElements.songContainer);
    }
}

function updateVoteButtons(voteState) {
    switch (voteState) {
        case 'upvoted':
            pageElements.upvote.classList.add('active');
            pageElements.upvote.classList.remove('inactive');
            pageElements.downvote.classList.remove('active');
            pageElements.downvote.classList.add('inactive');
            break;
        case 'downvoted':
            pageElements.upvote.classList.remove('active');
            pageElements.upvote.classList.add('inactive');
            pageElements.downvote.classList.add('active');
            pageElements.downvote.classList.remove('inactive');
            break;
        case 'none':
            pageElements.upvote.classList.remove('active');
            pageElements.upvote.classList.remove('inactive');
            pageElements.downvote.classList.remove('active');
            pageElements.downvote.classList.remove('inactive');
            break;
    }
}