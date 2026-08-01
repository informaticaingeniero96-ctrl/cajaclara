# Cómo contribuir

CajaClara es una herramienta pequeña y deliberadamente simple. Las mejoras deben conservar tres principios:

1. La app debe seguir funcionando sin servidor ni dependencias externas.
2. Los datos del usuario deben permanecer en su navegador salvo que el usuario los exporte.
3. La interfaz debe ser clara para alguien que no se considera experto en finanzas.

## Flujo local

1. Abre `producto/index.html` o sirve la carpeta con un servidor local.
2. Prueba registrar una venta, un gasto, exportar CSV, exportar JSON e importar JSON.
3. Ejecuta `node --check producto/app.js` antes de abrir un pull request.

## Pull requests

Explica qué problema resuelve el cambio, cómo lo probaste y si modifica el formato de respaldo JSON. Evita incluir datos reales de clientes o capturas con información personal.
