import { redirect } from 'next/navigation';

// Rediriger vers la page de connexion par défaut
export default function HomePage() {
  redirect('/login');
}
