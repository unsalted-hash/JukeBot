function Fader() {
    function fade(element, callback, time, increase) {
        if (element) {
            if (time == null) {
                time = 600;
            }

            if (time == 0) {
                element.style.opacity = increase ? 1 : 0;
                if (callback && typeof callback == 'function') {
                    callback();
                }
                return;
            }

            element.style.opacity = window.getComputedStyle(element).getPropertyValue('opacity');

            var increment = 30 / time;
            if (increment <= 0) {
                element.style.opacity = increase ? 1 : 0;
                if (callback && typeof callback == 'function') {
                    callback();
                }
                return;
            }

            if (!increase) {
                increment *= -1;
            }

            var fadeInterval = setInterval(function () {
                element.style.opacity = parseFloat(element.style.opacity) + increment;
                var done = false;
                if (increase) {
                    if (element.style.opacity >= 1) {
                        element.style.opacity = 1;
                        done = true;
                    }
                } else {
                    if (element.style.opacity <= 0) {
                        element.style.opacity = 0;
                        done = true;
                    }
                }

                if (done) {
                    if (callback && typeof callback == 'function') {
                        callback();
                    }
                    clearInterval(fadeInterval);
                }
            }, 30);
        }
    }

    this.fadeIn = function (element, callback, time) {
        fade(element, callback, time, true);
    };
    
    this.fadeOut = function (element, callback, time) {
        fade(element, callback, time, false);
    };
}