const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Usar la configuración de la base de datos principal
const { pool } = require('../config/database');

class User {
  static async findByUsername(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
      const result = await pool.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { username, email, password, role = 'admin' } = userData;
      
      // Verificar si el usuario ya existe
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
      }

      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new Error('El email ya está registrado');
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, role, created_at
      `;
      
      const result = await pool.query(query, [username, email, passwordHash, role]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async authenticate(username, password) {
    try {
      const user = await this.findByUsername(username);
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static async getAll() {
    try {
      const query = 'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async updateStatus(userId, isActive) {
    try {
      const query = 'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, username, is_active';
      const result = await pool.query(query, [isActive, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}

module.exports = User;
