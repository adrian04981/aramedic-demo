# Configuración de Firebase Storage

## 1. Configurar Storage en Firebase Console

1. Ve a la [consola de Firebase](https://console.firebase.google.com)
2. Selecciona tu proyecto `aramedic-demo`
3. En el menú lateral, haz clic en **Storage**
4. Haz clic en **Comenzar** para inicializar Storage
5. Selecciona las reglas de seguridad (puedes usar las reglas por defecto por ahora)
6. Selecciona la ubicación de tu Storage (preferiblemente la misma región que Firestore)

## 2. Actualizar las reglas de Storage

1. En la consola de Firebase, ve a **Storage > Rules**
2. Reemplaza las reglas existentes con el contenido del archivo `storage.rules` de este proyecto
3. Haz clic en **Publicar**

## 3. Configurar CORS (si es necesario)

Si tienes problemas con CORS al subir archivos, ejecuta estos comandos:

```bash
# Instalar gsutil si no lo tienes
curl https://sdk.cloud.google.com | bash

# Configurar CORS
echo '[
  {
    "origin": ["http://localhost:4200", "https://tu-dominio.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]' > cors.json

gsutil cors set cors.json gs://tu-bucket-name.appspot.com
```

## 4. Funcionalidades implementadas

### Foto de Perfil
- Los usuarios pueden subir una foto de perfil
- Se muestra en la tabla de usuarios y en el perfil
- Formatos soportados: JPG, PNG, WebP, GIF
- Tamaño máximo: 5MB

### Firma Digital (solo médicos)
- Los médicos pueden subir su firma digital
- Se puede usar en documentos y recetas
- Mismos formatos y restricciones que la foto de perfil

### Características técnicas
- Subida por drag & drop o click
- Vista previa antes de subir
- Validación de tipo y tamaño de archivo
- Eliminación de archivos anteriores
- URLs seguras con reglas de acceso
- Nombres de archivo únicos con timestamp

## 5. Rutas de archivos en Storage

```
users/
  {userId}/
    profile/
      {timestamp}.{extension}  # Foto de perfil
    signature/
      {timestamp}.{extension}  # Firma digital
```

## 6. Notas de seguridad

- Solo usuarios autenticados pueden subir archivos
- Cada usuario solo puede acceder a su propia carpeta
- Las fotos de perfil son visibles para otros usuarios autenticados
- Las firmas solo son accesibles para usuarios autenticados
- Se valida el tipo y tamaño de archivo en el cliente
- Se recomienda validación adicional en el servidor para producción