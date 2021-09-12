<?php
header('content-type','text-javascript');

class Loader {
  private $scripts = [];
  private $ultimaLinea = 1;
  private $conf;
  private $contenido;
  private $compensacionLineas = 5;

  private function load($nombre, $ruta = __DIR__ . '/../.') {
    $nombre = "$ruta/$nombre.js";
    if(!file_exists($nombre)) {
      $nombre = str_replace('\\', '/', $nombre);
      return "throw new Error('No se puede cargar script. Archivo inexistente $nombre')";
    }
  
    return file_get_contents($nombre);
  }

  private function getScriptsStack() {
    return "JSON.parse('" . json_encode($this->scripts) . "')";
  }

  private function print() {
    $contenido = str_replace('clog','console.log', $this->contenido);
    $contenido = str_replace('{contenido}', $contenido, $this->load('scripterBase'));
    $contenido = str_replace('{scriptsStack}', $this->getScriptsStack(), $contenido);

    echo $contenido;
  }

  private function preload(&$contenido) {
    foreach($this->parsers as $parser) {
      $contenido = $parser->parse($contenido);
    }

    preg_match_all("/require [\'\"]([a-zA-Z0-9\-\_\.\/]+)[\'\"];/", $contenido, $matches);
    foreach($matches[1] as $k => $m) {
      if($m) {
        $contenido = str_replace($matches[0][$k], '', $contenido);
        $this->get($m);
      }
    }
  }

  private function get($nombre) {
    foreach($this->scripts as $s)
      if($s[0] == $nombre) 
        return;
        
    $contenido = "\n\n// Scripts de $nombre\n\n" . $this->load($nombre);

    $this->preload($contenido);
  
    preg_match_all("/(?:\\r)?\\n(?:\\r)?/", $contenido, $matches);
    $lineas = sizeof($matches[0]);
  
    $this->scripts[] = [$nombre, $this->ultimaLinea + $this->compensacionLineas, $this->ultimaLinea + $lineas + $this->compensacionLineas];
    $this->ultimaLinea += $lineas + 1;

    $this->contenido .= $contenido . "\n";
  }

  private function decodeUrl() {
    if(!preg_match("/(?:http:\/\/.*?)?\/\??([^\/]+?)?(?:\..*)?$/",$_SERVER['HTTP_REFERER'],$matches)) 
      return;

    $pagina = isset($matches[1]) && $matches[1] != '' ? $matches[1] : 'home';

    if(isset($this->conf['scripts'][$pagina]))
      foreach($this->conf['scripts'][$pagina] as $sc) {
        $this->get($sc);
      }
  }

  public function boot() {
    $this->conf = json_decode(file_get_contents(__DIR__ . "/../conf.json"),true);

    $this->parsers = array_values(array_map(function($el) {
      preg_match("/(.+)\.php$/",$el,$res);
      return [$res[1],$el];
    }, array_filter(scandir(__DIR__ . '/parsers'),function($val) {
      return !in_array($val,['.','..']);
    })));

    for($i = 0; $i < sizeof($this->parsers); $i++) {
      require_once(__DIR__ . "/parsers/{$this->parsers[$i][1]}");
      $this->parsers[$i][0] = ucfirst($this->parsers[$i][0]);
      $this->parsers[$i] = new $this->parsers[$i][0]();
    }

    foreach($this->conf['bootScripts'] as $bs) {
      $this->get($bs);
    }

    $this->decodeUrl();
    $this->print();
  }
}

$loader = new Loader();
$loader->boot();
?>