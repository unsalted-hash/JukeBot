function VoteWatcher(jukeBot) {
    const handlerId = 'voteWatcher';

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.event) {
            case 'popup_loaded':
                updateVote();
                break;
            case 'vote_changed':
                if (request.data.voteState == jukeBot.voteStates.upvoted) {
                    jukeBot.upvote();
                } else if (request.data.voteState == jukeBot.voteStates.downvoted) {
                    jukeBot.downvote();
                }
                break;
        }
    });
    
    function updateVote() {
        if (jukeBot && jukeBot.voteState) {
            chrome.runtime.sendMessage({
                event: 'vote_changed',
                data: {
                    voteState: jukeBot.voteState
                }
            });
        } else {
            setTimeout(updateVote, 1000);
        }
    }

    this.start = function () {
        jukeBot.addHandler(handlerId, jukeBot.events.voteChanged, updateVote);
    };

    this.stop = function () {
        jukeBot.removeHandler(handlerId, jukeBot.events.voteChanged);
    };
}