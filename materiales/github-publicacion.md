# Publicar CajaClara en GitHub

## Estado actual

El código está listo dentro de `C:\proyectos\testdol`. La integración de GitHub no mostró repositorios autenticados y el login web indicó que la cuenta no acepta inicio de sesión por contraseña.

## Cuando la cuenta esté autenticada

1. Crea un repositorio público llamado `cajaclara`.
2. No marques la opción de agregar archivos si vas a subir el contenido local.
3. Desde `C:\proyectos\testdol`, ejecuta:

```powershell
git init
git add .
git commit -m "feat: primera versión de CajaClara"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cajaclara.git
git push -u origin main
```

4. En Settings → Pages, elige `Deploy from a branch`, rama `main` y carpeta `/root` si quieres publicar el contenido del repositorio.
5. Para una landing más limpia, puedes mover después el contenido de `landing/` a un sitio separado o conservar el enlace de prueba local para desarrollo.

## Reglas de seguridad

- Nunca subas contraseñas, tokens, respaldos JSON reales ni datos de clientes.
- Mantén `producto/` como la demo pública.
- El enlace de pago se deja como marcador `TU_ENLACE_KOFI` hasta tener la tienda real.
