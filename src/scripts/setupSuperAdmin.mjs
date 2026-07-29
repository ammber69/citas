// Script para vincular un usuario existente de Firebase Auth con su documento en Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMfMfTBdNUw-n2iTJGVrx_cD4DDpCutoI",
  authDomain: "citas-53ca1.firebaseapp.com",
  projectId: "citas-53ca1",
  storageBucket: "citas-53ca1.firebasestorage.app",
  messagingSenderId: "808675542830",
  appId: "1:808675542830:web:ed27502c5fc407d2f39cbf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function linkSuperAdmin() {
  try {
    console.log('🔐 Iniciando sesión con superadmin@gasme.com...');
    const cred = await signInWithEmailAndPassword(auth, 'superadmin@gasme.com', 'Gasme2015');
    const uid = cred.user.uid;
    console.log(`✅ Login exitoso. UID: ${uid}`);

    // Verificar si ya tiene documento
    const existing = await getDoc(doc(db, 'usuarios', uid));
    if (existing.exists()) {
      console.log('ℹ️ El documento ya existe en Firestore:', existing.data());
      process.exit(0);
    }

    // Crear documento en Firestore
    await setDoc(doc(db, 'usuarios', uid), {
      uid: uid,
      email: 'superadmin@gasme.com',
      nombre: 'Super Administrador',
      rol: 'superadmin',
      ciudad: 'cordoba',
      ciudadNombre: 'Córdoba',
      created_at: new Date().toISOString()
    });

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ SUPERADMIN CONFIGURADO');
    console.log('═══════════════════════════════════════════');
    console.log(`  📧 Email:      superadmin@gasme.com`);
    console.log(`  🔑 Password:   Gasme2015`);
    console.log(`  🆔 UID:        ${uid}`);
    console.log(`  👤 Rol:        superadmin`);
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('🌐 Entra a /login en tu app y usa estas credenciales.');
    console.log('   Desde ahí puedes ir a /superadmin para crear usuarios de agencia.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.code, error.message);
    process.exit(1);
  }
}

linkSuperAdmin();
