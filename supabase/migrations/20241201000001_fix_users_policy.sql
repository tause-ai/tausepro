-- Corregir políticas RLS para la tabla users
-- Creado: 2024-12-01

-- Eliminar política incorrecta
DROP POLICY IF EXISTS "Users can view their own tenant users" ON users;

-- Crear políticas correctas para users
-- Permitir que los usuarios se inserten a sí mismos
CREATE POLICY "Users can insert themselves" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que los usuarios vean y actualicen sus propios datos
CREATE POLICY "Users can view and update themselves" ON users
    FOR ALL USING (auth.uid() = id);

-- Permitir que super admins vean todos los usuarios
CREATE POLICY "Super admins can view all users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin'); 