# Instrucciones para crear usuarios en Firebase

## 1. Crear usuarios en Firebase Authentication

Ve a la consola de Firebase: https://console.firebase.google.com/

1. Selecciona tu proyecto "aramedic-3993b"
2. Ve a "Authentication" en el menú lateral
3. Ve a la pestaña "Users"
4. Haz clic en "Add user" y crea estos usuarios:

### Usuario Administrador:
- Email: admin@aramedic.com
- Password: admin123

### Usuario Administrador Médico:
- Email: adminmedico@aramedic.com
- Password: admin123

### Usuario Médico:
- Email: medico@aramedic.com
- Password: medico123

## 2. Configurar reglas de Firestore

Ve a "Firestore Database" > "Rules" y pega estas reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['administrador', 'administrador_medico'];
      allow read: if request.auth != null;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 3. Después de crear los usuarios, intenta hacer login

El sistema automáticamente creará los documentos de usuario en Firestore cuando hagas login por primera vez.

## Usuarios de prueba:

| Email | Password | Rol |
|-------|----------|-----|
| admin@aramedic.com | admin123 | Administrador |
| adminmedico@aramedic.com | admin123 | Administrador Médico |
| medico@aramedic.com | medico123 | Médico |