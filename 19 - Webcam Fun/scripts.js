const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const controls = document.querySelectorAll('.controls input[type=range]');
const colorControls = document.querySelectorAll('.diverge input[type=range]');
// Init min/max color vars
let rmin, rmax, gmin, gmax, bmin, bmax = 125;
// Init IDB var state
let IndexedDB = false;

function getVideo() {
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(localMediaStream => {
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => console.log('ERROR! ', err));
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  [canvas.width, canvas.height] = [width, height];

  return setInterval(() => {
    // draw a photo from video each 20ms
    ctx.drawImage(video,0,0,width, height);
    // get image's pixels Object // Object.data = array -> r:0-255, g:0-255, b:0-255, alpha:0-255 etc...
    let pixels = ctx.getImageData(0,0,width,height);
    pixels = colorize(pixels);
    pixels = greenScreen(pixels);
    // put pixels back to image

    ctx.putImageData(pixels,0,0);
  }, 20);
}

function colorize(pixels) {
  let colors = {};
  colorControls.forEach(color => colors[color.name] = color.value);
  for (let i=0; i<pixels.data.length; i += 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];

    pixels.data[i+0] += (colors.red/2) - 127;
    pixels.data[i+1] += (colors.green/2) - 127;
    pixels.data[i+2] += (colors.blue/2) - 127;
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};
  controls.forEach(control => levels[control.name] = control.value);
  for (let i=0; i<pixels.data.length; i += 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];
    if (
      red <= levels.rmin -15
      && green <= levels.gmin -15
      && blue <= levels.bmin -15
    ) {
      pixels.data[i + 3] = 0;
    }
  }
  return pixels;
  // debugger;
}

function testIndexedDB() {
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    IndexedDB = false;
    return;
  }
  IndexedDB = true;
}

// init IndexedDB to store photos
function initDB() {
  testIndexedDB();
  if (!IndexedDB) return;
  const init = idb.open('test-db',1, upgradeDb => {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('images', {autoIncrement: true});
      case 1:
        let store = upgradeDb.transaction.objectStore('images');
    }
  });
  return init;
}

function takePhoto() {
  // play photo sound
  snap.currentTime = 0;
  snap.play();
  // register photo out of the canvas // canvas.toDataURL(type, encoderOptions[0-1]);
  const data = canvas.toDataURL('image/png');
  // if no idb
  if (!IndexedDB) return getData(data);
  // save photo in IndexedDB
  // console.log('DB-', dbPromise);
  dbPromise.then(db => {
    const store = db.transaction('images','readwrite').objectStore('images');
      store.add(data)   // stores photo & returns photo's key in DB
        .then(key => {
          getPhoto(key);  // get photo from DB to display it
        })
        .catch(err => console.log('ERROR ADD:', err))
  })
}

// get photo from IndexedDB
function getPhoto(key) {
  // console.log('KEY:', key);
  dbPromise.then(db => {
    const store = db.transaction('images','readwrite').objectStore('images');
    store.get(key)
      .then(photo => {
        if(!photo) {
          console.log('no data found!');
          return;
        }
        const link = document.createElement('a');
        link.href = photo;
        link.setAttribute('download', 'handsome');
        link.innerHTML = `<img src="${photo}" alt="nice guy!"/>`;
        strip.insertBefore(link, strip.firstChild);
        // console.log('GET BY IDB DONE!');
      })
      .catch(err => console.log('ERRROR GET:', err))
  })
}

// no indexedDB! take photo directly from data (canvas.toDataURL)
function getData(data) {
  const photo = data;
  const link = document.createElement('a');
  link.href = photo;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${photo}" alt="nice guy!"/>`;
  strip.insertBefore(link, strip.firstChild);
  // console.log('DIRECT GET DONE!');
}

// Load photos stored in IndexedDB
function loadPhotos() {
  if (!IndexedDB) return;
  // console.log(dbPromise);
  dbPromise.then(db => {
    const store = db.transaction('images','readonly').objectStore('images');
    const photos = store.getAllKeys().then(keys => keys.forEach(key => getPhoto(key)));
  })
}

const dbPromise = initDB();
getVideo();
video.addEventListener('canplay', paintToCanvas);
document.addEventListener('DOMContentLoaded', loadPhotos);
