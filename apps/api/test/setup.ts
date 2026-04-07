// Configuration globale avant tous les tests
export default async function setup() {
  // Utiliser la base de données de développement (suffixée _test en prod)
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:passer@localhost:5432/saas_erp';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://erp_user:erp_rabbit@localhost:5672/erp';
  process.env.JWT_SECRET = 'test_jwt_secret_min_32_chars_for_tests';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_32_chars_for_tests';
  process.env.NODE_ENV = 'test';
}
