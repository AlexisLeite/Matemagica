function clog(...args) {
  console.log(...args);
}

try {
{contenido}
}
catch(e) {
  let scripts = {scriptsStack};
  let linea = parseInt(e.stack.match(/[^\:]+\:([0-9]+)/)[1]);

  for(let sc of scripts) {
    if(linea >= sc[1] && linea <= sc[2]) {
      console.error(`Error en el script ${sc[0]} en la línea ${linea-sc[1]}`);
      console.error(e.message);
      console.trace(e);
    }
  }
}