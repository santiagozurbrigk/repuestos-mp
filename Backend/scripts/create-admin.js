const User = require('../models/User');
const { Pool } = require('pg');

// Conectar directamente a la base de datos repuestos_mp
const pool = new Pool({
  user: 'postgres', // Hardcoded for troubleshooting
  host: 'localhost', // Hardcoded for troubleshooting
  database: 'repuestos_mp', // Hardcoded for troubleshooting
  password: 'San48291258', // Hardcoded for troubleshooting
  port: 5432, // Hardcoded for troubleshooting
});

async function createAdminUser() {
  try {
    console.log('🔐 Iniciando creación de usuario administrador...');

    // Verificar si ya existe algún usuario
    const existingUsers = await User.getAll();
    if (existingUsers.length > 0) {
      console.log('⚠️  Ya existe un usuario administrador en el sistema.');
      console.log('Usuarios existentes:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
      });
      return;
    }

    // Datos del administrador por defecto
    const adminData = {
      username: 'admin',
      email: 'admin@repuestosmp.com',
      password: 'admin123',
      role: 'admin'
    };

    console.log('📝 Creando usuario administrador con los siguientes datos:');
    console.log(`  Usuario: ${adminData.username}`);
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Contraseña: ${adminData.password}`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');

    // Crear el usuario
    const user = await User.create(adminData);

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log(`  ID: ${user.id}`);
    console.log(`  Usuario: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Rol: ${user.role}`);
    console.log(`  Fecha de creación: ${user.created_at}`);

    console.log('\n🎉 ¡El sistema está listo para usar!');
    console.log('Puedes iniciar sesión con las credenciales mostradas arriba.');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    if (error.message.includes('users')) {
      console.log('💡 Asegúrate de que la tabla "users" haya sido creada ejecutando:');
      console.log('   psql -U postgres -d repuestos_mp -f scripts/create-users-table.sql');
    }
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
createAdminUser();
