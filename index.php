<!doctype html>
<html lang="es">

<head>
  <meta charset="utf-8">
  <title>Matematic</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <link rel="stylesheet" href="estilos.css?">
  <script src="https://unpkg.com/konva@7.0.3/konva.min.js"></script>
  <script src="script.js?<?php echo (isset($_GET['ruta'])) ? $_GET['ruta'] : "" ?>"></script>
</head>

<body>
  <div id="AreaTrabajo"></div>
</body>

</html>