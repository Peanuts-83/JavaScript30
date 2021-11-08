// get elements
const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const ranges = player.querySelectorAll('.player__slider');
const skipBtns = player.querySelectorAll('.player__button');
const expand = player.querySelector('.expand');

// build functions
function togglePlay() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function toggleBtn() {
  toggle.textContent = video.paused ? '►' : '❚ ❚';
}

function skip() {
  video.currentTime += parseInt(this.dataset.skip);
}

function handleRangeUpdate() {
  const rangeType = this.name === 'volume' ? 'volume' : 'playbackRate';
  video[rangeType] = this.value;
}

function handleProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
}

function scrub(e) {
  const gotoTime = video.duration * (e.offsetX / progress.offsetWidth);
  video.currentTime = gotoTime;
}

function toggleFullScreen() {
  console.log(player.fullscreenElement)
  if (!player.fullscreenElement) {
    if (player.requestFullscreen) {
      player.requestFullscreen();
    } else if (player.webkitRequestFullscreen) { /* Safari */
      player.webkitRequestFullscreen();
    } else if (player.msRequestFullscreen) { /* IE11 */
      player.msRequestFullscreen();
    }
  } else {
    player.exitFullscreen();
  }
}

// addEventListeners
video.addEventListener('click', togglePlay);
video.addEventListener('play', toggleBtn);
video.addEventListener('pause', toggleBtn);
video.addEventListener('timeupdate', handleProgress);

toggle.addEventListener('click', togglePlay);
skipBtns.forEach(sb => sb.addEventListener('click', skip));
ranges.forEach(r => r.addEventListener('change', handleRangeUpdate));
expand.addEventListener('click', toggleFullScreen);

let mousedown = false;
progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', e => mousedown && scrub(e));
progress.addEventListener('mouseup', () => mousedown = false);
progress.addEventListener('mousedown', () => mousedown = true);
