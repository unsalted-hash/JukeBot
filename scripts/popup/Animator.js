function Animator() {
    var fadeInterval;
    var slideInterval;

    function fade(element, callback, time, toVisible) {
        if (element) {
            if (fadeInterval != null) {
                clearInterval(fadeInterval);
            }

            if (time == null) {
                time = 600;
            }

            if (time == 0) {
                element.style.opacity = toVisible ? 1 : 0;
                if (callback && typeof callback == 'function') {
                    callback();
                }
                return;
            }

            element.style.opacity = window.getComputedStyle(element).getPropertyValue('opacity');

            var increment = 30 / time;
            if (increment <= 0) {
                element.style.opacity = toVisible ? 1 : 0;
                if (callback && typeof callback == 'function') {
                    callback();
                }
                return;
            }

            if (toVisible) {
                element.style.opacity = 0;
                element.style.visibility = 'visible';
            } else {
                increment *= -1;
            }

            fadeInterval = setInterval(function () {
                element.style.opacity = parseFloat(element.style.opacity) + increment;
                var done = false;
                if (toVisible) {
                    if (element.style.opacity >= 1) {
                        element.style.opacity = 1;
                        done = true;
                    }
                } else {
                    if (element.style.opacity <= 0) {
                        element.style.visibility = 'hidden';
                        element.style.opacity = 0;
                        done = true;
                    }
                }

                if (done) {
                    clearInterval(fadeInterval);
                    if (callback && typeof callback == 'function') {
                        callback();
                    }
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
    

    this.slideDown = function (element, callback, time) {
        if (element) {
            if (slideInterval != null) {
                clearInterval(slideInterval);
            }

            if (time == null) {
                time = 100;
            }

            var maxHeight = parseFloat(window.getComputedStyle(element).getPropertyValue('max-height'));

            var increment = (30 / time) * maxHeight;

            element.style.display = 'block';
            element.style.height = 0 + 'px';

            slideInterval = setInterval(function () {
                element.style.height = parseFloat(element.style.height) + increment + 'px';
                if (parseFloat(element.style.height) >= maxHeight) {
                    element.style.height = maxHeight + 'px';
                    clearInterval(slideInterval);
                    if (callback && typeof callback == 'function') {
                        callback();
                    }
                }
            }, 30);
        }
    }

    this.slideUp = function (element, callback, time) {
        if (element) {
            if (slideInterval != null) {
                clearInterval(slideInterval);
            }

            if (time == null) {
                time = 100;
            }
            
            var currentHeight = parseFloat(window.getComputedStyle(element).getPropertyValue('height'));

            var increment = (30 / time) * currentHeight;

            slideInterval = setInterval(function () {
                var newHeight = parseFloat(element.style.height) - increment;
                if (newHeight > 0) {
                    element.style.height = newHeight + 'px';
                } else {
                    element.style.height = 0 + 'px';
                    element.style.display = 'none';
                    clearInterval(slideInterval);
                    if (callback && typeof callback == 'function') {
                        callback();
                    }
                }
            }, 30);
        }
    }

    this.toggleClass = function (element, className, enabled) {
        if (element) {
            var hasClass = element.classList.contains(className);
    
            if (enabled == null) {
                element.classList[hasClass ? 'remove' : 'add'](className);
            } else {
                element.classList[enabled ? 'add' : 'remove'](className);
            }
        }
    }
}