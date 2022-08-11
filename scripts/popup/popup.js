var pageElements;
var progressInterval;
var animator;

var autoDootEnabled;
var autoDootType = "upvote";
var notifierEnabled;

window.onload = function () {
    animator = new Animator();
    pageElements = findElements();
    initHandlers();

    chrome.storage.sync.get('autoDootType', function (response) {
        autoDootType = response.autoDootType;
        var els = document.querySelector(`select[name="voteType"] option[value="${autoDootType}"]`);
        if(els){
            els.selected = true;
        }
    });

    chrome.storage.sync.get('autoDootEnabled', function (response) {
        autoDootEnabled = response.autoDootEnabled;
        pageElements.autoDootCheckbox.checked = autoDootEnabled;
        animator.toggleClass(pageElements.autoDootTitle, 'started', autoDootEnabled);
    });

    chrome.storage.sync.get('notifierEnabled', function (response) {
        notifierEnabled = response.notifierEnabled;
        pageElements.notifierCheckbox.checked = notifierEnabled;
        animator.toggleClass(pageElements.notifierTitle, 'started', notifierEnabled);
    });

    chrome.storage.sync.get('notifierShowAll', function (response) {
        pageElements.notifierShowAllCheckbox.checked = response.notifierShowAll;
    });

    chrome.storage.sync.get('notifierShowAlerts', function (response) {
        pageElements.notifierShowAlertsCheckbox.checked = response.notifierShowAlerts;
    });

    optionsVisible = chrome.extension.getBackgroundPage().notifierOptionsVisible;
    if (chrome.extension.getBackgroundPage().notifierOptionsVisible) {
        pageElements.optionsContainer.style.display = 'block';
        pageElements.optionsContainer.style.height = pageElements.optionsContainer.style.maxHeight;
        pageElements.notifierOptions.style.opacity = 1;
        pageElements.notifierOptions.style.visibility = 'visible';
    }


    sendMessage('popup_loaded');
};

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
        autoDootCheckbox: document.getElementById('auto-doot-checkbox'),
        autoDootType: document.getElementById('voteType'),
        notifierTitle: document.getElementById('notifier-title'),
        notifierCheckbox: document.getElementById('notifier-checkbox'),
        notifierShowAllCheckbox: document.getElementById('notifier-show-all'),
        notifierShowAlertsCheckbox: document.getElementById('notifier-show-alerts'),
        notifierSettings: document.getElementById('notifier-settings'),
        notifierOptions: document.getElementById('notifier-options'),
        optionsContainer: document.getElementById('options-container')
    };
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

    pageElements.autoDootCheckbox.onclick = function () {
        this.checked = !this.checked;
        
        var self = this;
        chrome.storage.sync.set({'autoDootEnabled': !autoDootEnabled}, function () {
            autoDootEnabled = !autoDootEnabled;
            animator.toggleClass(pageElements.autoDootTitle, 'started', autoDootEnabled);
            self.checked = !self.checked;
            sendMessage('auto_doot_toggled', {enabled: autoDootEnabled, type: autoDootType});
        });
    };

    pageElements.autoDootType.onchange = function () {
        chrome.storage.sync.set({'autoDootType': pageElements.autoDootType.value}, function () {
            autoDootType = pageElements.autoDootType.value;
            sendMessage('auto_doot_type_changed', {enabled: autoDootEnabled, type: autoDootType});
        });
    };

    pageElements.notifierCheckbox.onclick = function () {
        this.checked = !this.checked;

        var self = this;
        chrome.storage.sync.set({'notifierEnabled': !notifierEnabled}, function () {
            notifierEnabled = !notifierEnabled;
            animator.toggleClass(pageElements.notifierTitle, 'started', notifierEnabled);
            self.checked = !self.checked;
            sendMessage('notifier_toggled', {enabled: notifierEnabled});
        });
    };

    pageElements.notifierShowAllCheckbox.onclick = function () {
        var newValue = this.checked;
        this.checked = !this.checked;
        
        var self = this;
        chrome.storage.sync.set({'notifierShowAll': newValue}, function () {
            self.checked = !self.checked;
        });
    };

    pageElements.notifierShowAlertsCheckbox.onclick = function () {
        var newValue = this.checked;
        this.checked = !this.checked;
        
        var self = this;
        chrome.storage.sync.set({'notifierShowAlerts': newValue}, function () {
            self.checked = !self.checked;
        });
    };

    pageElements.notifierSettings.onclick = toggleNotifierOptions;
}

function toggleNotifierOptions() {
    if (!chrome.extension.getBackgroundPage().notifierOptionsVisible) {
        animator.slideDown(pageElements.optionsContainer, function () {
            animator.fadeIn(pageElements.notifierOptions, null, 400);
        });
    } else {
        animator.fadeOut(pageElements.notifierOptions, function () {
            animator.slideUp(pageElements.optionsContainer, null, 150);
        }, 200);
    }

    chrome.extension.getBackgroundPage().notifierOptionsVisible = !chrome.extension.getBackgroundPage().notifierOptionsVisible;
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

function updateSong(songData) {
    if (songData && songData.song && songData.dj) {
        animator.fadeOut(pageElements.songContainer, function () {
            pageElements.songTitle.innerText = songData.song.title;
            pageElements.artists.innerText = songData.song.artists.join(', ');
            pageElements.dj.innerText = songData.dj.jqbxName;
            resetProgressBar(songData.song.elapsedTime, songData.song.duration);
            animator.fadeIn(pageElements.songContainer);
        });
    } else {
        animator.fadeOut(pageElements.songContainer);
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