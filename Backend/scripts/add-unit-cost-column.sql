-- Agregar columna unit_cost a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN products.unit_cost IS 'Costo unitario del producto (opcional)';
