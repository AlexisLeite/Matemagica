<?php
function load() {
  return json_decode(file_get_contents(__DIR__ . '/razonamientos.json'),true);
}
?>