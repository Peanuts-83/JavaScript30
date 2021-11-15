const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

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
    ctx.drawImage(video,0,0,width, height);
  }, 20);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();
  // register photo out of the canvas
  const data = canvas.toDataURL('image/jpeg');

  // save photo in IndexedDB

  //check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }
  let accessDB = indexedDB.open('test-db',1);

  accessDB.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('images')) {
      db.createObjectStore('images', {autoIncrement: true});
    }
  };

  accessDB.onsuccess = event => {
    let key;
    let db = event.target.result;
    let tx = db.transaction('images', 'readwrite');
    console.log('TX: ', tx);
    let store = tx.objectStore('images');
    let request = store.add(data);
    request.onsuccess = e => {
      key = e.target.result;

      let imgRequest = store.get(key)
      imgRequest.onsuccess = e => {
        const cachedImg = e.target.result;

        const link = document.createElement('a');
        link.href = cachedImg;
        link.setAttribute('download', 'handsome');
        link.innerHTML = `<img src="${cachedImg}" alt="nice guy!"/>`;
        strip.insertBefore(link, strip.firstChild);
      }
      console.log('DONE! ', e);
    }
    request.onerror = e => console.log('ERROR! ', e);

  }
  accessDB.onerror = event => {
    console.log('CAN NOT CONNECT! ', event);
  }
}

getVideo();
video.addEventListener('canplay', paintToCanvas);