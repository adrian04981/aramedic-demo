import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCw7Ls-ldlT1h1nUT6mYqzL7g1HmNAyL6U",
  authDomain: "aramedic-3993b.firebaseapp.com",
  projectId: "aramedic-3993b",
  storageBucket: "aramedic-3993b.firebasestorage.app",
  messagingSenderId: "458000707687",
  appId: "1:458000707687:web:eea8b1d29f6b1effe7a4c2",
  measurementId: "G-FXJ3QET577"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Demo users to create
const demoUsers = [
  {
    email: 'admin@aramedic.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Administrador',
    role: 'administrador',
    phone: '+1234567890'
  },
  {
    email: 'adminmedico@aramedic.com',
    password: 'admin123',
    firstName: 'Dr. Carlos',
    lastName: 'Rodríguez',
    role: 'administrador_medico',
    phone: '+1234567891',
    specialty: 'Medicina General',
    licenseNumber: 'MG-12345'
  },
  {
    email: 'medico@aramedic.com',
    password: 'medico123',
    firstName: 'Dra. María',
    lastName: 'González',
    role: 'medico',
    phone: '+1234567892',
    specialty: 'Cardiología',
    licenseNumber: 'CA-67890'
  }
];

async function createDemoUsers() {
  console.log('🚀 Creando usuarios de demostración...');
  
  for (const userData of demoUsers) {
    try {
      console.log(`\n📧 Creando usuario: ${userData.email}`);
      
      const credential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const userDoc = {
        uid: credential.user.uid,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        specialty: userData.specialty,
        licenseNumber: userData.licenseNumber,
        createdAt: new Date(),
        isActive: true
      };

      await setDoc(doc(firestore, 'users', credential.user.uid), userDoc);
      
      console.log(`✅ Usuario creado exitosamente: ${userData.firstName} ${userData.lastName}`);
      console.log(`   Rol: ${userData.role}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      
    } catch (error) {
      console.error(`❌ Error creando usuario ${userData.email}:`, error);
    }
  }
  
  console.log('\n🎉 ¡Proceso completado!');
  console.log('\n📋 Usuarios de demostración creados:');
  console.log('┌─────────────────────────────┬─────────────────────┬─────────────┐');
  console.log('│ Email                       │ Password            │ Rol         │');
  console.log('├─────────────────────────────┼─────────────────────┼─────────────┤');
  console.log('│ admin@aramedic.com          │ admin123            │ Admin       │');
  console.log('│ adminmedico@aramedic.com    │ admin123            │ Admin Medico│');
  console.log('│ medico@aramedic.com         │ medico123           │ Medico      │');
  console.log('└─────────────────────────────┴─────────────────────┴─────────────┘');
}

// Run the script
createDemoUsers().catch(console.error);