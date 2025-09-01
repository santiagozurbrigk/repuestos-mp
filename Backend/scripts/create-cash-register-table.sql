-- Crear tabla de caja
CREATE TABLE IF NOT EXISTS cash_register (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  cash_sales DECIMAL(10,2) DEFAULT 0,
  card_sales DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  miscellaneous_expenses DECIMAL(10,2) DEFAULT 0,
  fernando_withdrawal DECIMAL(10,2) DEFAULT 0,
  pedro_withdrawal DECIMAL(10,2) DEFAULT 0,
  accessories DECIMAL(10,2) DEFAULT 0,
  sheet_metal DECIMAL(10,2) DEFAULT 0,
  led DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cash_register_date ON cash_register(date);
CREATE INDEX IF NOT EXISTS idx_cash_register_created_at ON cash_register(created_at);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_cash_register_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cash_register_updated_at
  BEFORE UPDATE ON cash_register
  FOR EACH ROW
  EXECUTE FUNCTION update_cash_register_updated_at();
