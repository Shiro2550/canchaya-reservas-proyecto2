-- Se ejecuta una sola vez al crear el contenedor de MySQL.
-- La base `canchaya` y el usuario `canchaya` los crea la imagen oficial (MYSQL_DATABASE / MYSQL_USER).
CREATE DATABASE IF NOT EXISTS canchaya_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS canchaya_test   CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON canchaya_shadow.* TO 'canchaya'@'%';
GRANT ALL PRIVILEGES ON canchaya_test.*   TO 'canchaya'@'%';
FLUSH PRIVILEGES;
