// Nettoyage global après tous les tests
export default async function teardown() {
  // Les ressources (app, BDD) sont fermées dans afterAll() de chaque suite
  // Ce fichier est conservé pour d'éventuels cleanups globaux futurs
}
