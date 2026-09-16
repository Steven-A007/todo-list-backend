CREATE TABLE tasks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  status ENUM('Pendiente', 'Completada') NOT NULL DEFAULT 'Pendiente',
  category_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);