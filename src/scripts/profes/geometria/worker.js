importScripts(
  './../../ext/math.js',
  './../../misc.js',
  './poligonMaker.js'
);

function fireEvents(evt) {
  postMessage({
    action: 'log',
    text: evt
  });
}

function fireLogs(...args) {
  postMessage({
    action: 'Clog',
    args: [...args]
  });
}

function firePercent(evt) {
  postMessage({
    action: 'percent',
    percent: evt
  });
}

self.addEventListener('message', ev => {
  switch(ev.data.action) {
    case 'make': 
      postMessage({
        action: 'done',
        json: JSON.stringify(new PoligonsMaker({
            eventsHandler: fireEvents,
            logsHandler: fireLogs,
            percentHandler: firePercent,
            ...ev.data
          }),math.replacer)});
      break;
  }
  
})