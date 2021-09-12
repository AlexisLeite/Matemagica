<?php
class Templater {
  function load($template, $justCode=false) {
    if($justCode) {
      if(!array_key_exists($template,$this->templates))
        $this->templates[$template] = file_get_contents(__DIR__ . "/../../../../templates/$template.tpl");
      return $this->templates[$template];
    } else {
      $templates = explode(',',$template);
      $ret = "";
      foreach($templates as $key => $tpl) {
        preg_match('/(?:.*\/)?(\w+)$/',$tpl,$match);
        $tpl = $match[1];
        if(!array_key_exists($tpl,$this->templates))
          $ret .= "templater.set('$tpl',`{$this->load($templates[$key],true)}`);\n\r\t";
        $templates[$key] = $tpl;
      }
      $template = implode(',',$templates);
      $ret .= "this.templates = templater.getSync('$template');";
      return $ret;
    }
  }

  function parse($text) {
    $text = preg_replace_callback("/\\$@Templates [\'\"]([a-zA-Z0-9\-\_\.\/, ]+)[\'\"];/", function($el) {
      $ret = $this->load($el[1]);
      return $ret;
    }, $text);

    return $text;
  }

  function __construct() {
    $this->templates = [];
  }
}