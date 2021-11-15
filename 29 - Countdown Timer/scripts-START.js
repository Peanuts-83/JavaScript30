const buttons = document.querySelectorAll('.timer__button');
const form = document.customForm;
const timeLeft = document.querySelector('.display__time-left');
const endTime = document.querySelector('.display__end-time');
let countdown;

function timer(seconds) {
  clearInterval(countdown);
  const now = Date.now();
  const end = now + seconds * 1000;
  displayTimeLeft(seconds);
  displayEndTime(end);

  countdown = setInterval(() => {
    const secondsLeft = Math.round((end - Date.now())/ 1000);
    if (secondsLeft < 0) {
      clearInterval(countdown);
      return;
    };
    displayTimeLeft(secondsLeft);
  }, 1000);
}

function displayTimeLeft(seconds) {
  let minutesLeft = Math.floor(seconds / 60);
  let secondsLeft = seconds % 60;
  secondsLeft = secondsLeft < 10 ? '0' + secondsLeft : secondsLeft;
  timeLeft.textContent = `${minutesLeft}:${secondsLeft}`;
}

function displayEndTime(milliseconds) {
  const date = new Date(milliseconds);
  endTime.textContent = `Be back at ${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
}

function btnClick() {
  const seconds = parseInt(this.dataset.time);
  timer(seconds);
}

function formSubmit(e) {
  e.preventDefault();
  const seconds = this.minutes.value * 60;
  timer(seconds);
  this.reset();
}


buttons.forEach(button => button.addEventListener('click', btnClick));
form.addEventListener('submit', formSubmit);
