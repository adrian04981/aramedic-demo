# Índices requeridos para Firestore

## Problema actual
Firebase muestra este error:
```
The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/aramedic-3993b/firestore/indexes?create_composite=ClRwcm9qZWN0cy9hcmFtZWRpYy0zOTkzYi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdGlwb3NfY2lydWdpYS9pbmRleGVzL18QARoKCgZhY3Rpdm8QARoKCgZub21icmUQARoMCghfX25hbWVfXxAB
```

## Solución

### Opción 1: Crear índice automáticamente
1. Haz clic en el enlace del error en la consola del navegador
2. Firebase te llevará directamente a crear el índice
3. Haz clic en "Crear índice"

### Opción 2: Crear índice manualmente
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto `aramedic-3993b`
3. Ve a Firestore Database > Índices
4. Haz clic en "Crear índice"
5. Configura el índice:
   - **Colección:** `tipos_cirugia`
   - **Campos:**
     - `activo` (Ascendente)
     - `nombre` (Ascendente)
   - **Estado de consulta:** Ascendente

### Opción 3: Usar consultas sin índice (implementado)
Se agregó el método `obtenerTiposCirugiaSimple()` que no requiere ordenamiento y por tanto no necesita índice compuesto.

## Índices recomendados para el futuro

### Para `tipos_cirugia`:
- `activo` + `nombre` (ya mencionado arriba)
- `activo` + `categoria` + `nombre`
- `activo` + `fechaCreacion`

### Para `checklist_cirugias`:
- `idTipoCirugia` + `activo`
- `categoria` + `activo`

### Para `citas`:
- `fecha` + `estado`
- `idPaciente` + `fecha`
- `idMedico` + `fecha`

### Para `pacientes`:
- `activo` + `fechaRegistro`
- `tipoDocumento` + `numeroDocumento`

## Archivo de configuración de índices
Puedes crear un archivo `firestore.indexes.json` en la raíz del proyecto:

```json
{
  "indexes": [
    {
      "collectionGroup": "tipos_cirugia",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "activo",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "nombre",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "checklist_cirugias",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "idTipoCirugia",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "activo",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Luego puedes deployar los índices con:
```bash
firebase deploy --only firestore:indexes
```