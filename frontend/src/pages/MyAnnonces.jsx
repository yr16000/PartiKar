import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/header.jsx';
import Footer from '@/components/layout/footer.jsx';
import CarCard from '@/components/cards/CarCard.jsx';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function MyAnnonces() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [annonces, setAnnonces] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      // pas connecté -> rediriger vers login
      navigate('/login');
      return;
    }
    const fetchMine = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/annonces/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
            throw new Error(txt || 'Erreur lors du chargement des annonces');
        }
        const data = await res.json();
        // Normaliser les données pour s'assurer que voitureId est présent
        const normalized = Array.isArray(data) ? data.map(a => ({
          ...a,
          id: a.voitureId || a.id
        })) : [];
        setAnnonces(normalized);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, [token, navigate]);

  // Séparer les annonces actives et inactives
  // Actives : disponible ou completement_reservee
  // Passées : inactive ou expiree
  const annoncesActives = annonces.filter(a => {
    const statut = a.statut?.toLowerCase();
    return statut === 'disponible' || statut === 'completement_reservee' || !statut;
  });
  const annoncesInactives = annonces.filter(a => {
    const statut = a.statut?.toLowerCase();
    return statut === 'inactive' || statut === 'expiree';
  });

  return (
    <main className='min-h-screen flex flex-col bg-background text-foreground'>
      <Header />
      <section className='flex-1 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full'>
        <div className='flex items-center justify-between mb-8 flex-wrap gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Mes annonces</h1>
            <p className='text-muted-foreground text-sm mt-1'>Vos véhicules publiés sur la plateforme.</p>
          </div>
          <Button asChild variant='brand'>
            <Link to='/publish'>Publier une nouvelle voiture</Link>
          </Button>
        </div>

        {loading && <p className='text-sm animate-pulse'>Chargement de vos annonces...</p>}
        {error && !loading && <p className='text-sm text-destructive'>{error}</p>}

        {!loading && !error && annonces.length === 0 && (
          <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
            <h2 className='text-lg font-semibold'>Aucune annonce pour l'instant</h2>
            <p className='text-sm text-muted-foreground'>Publiez votre première voiture pour commencer à recevoir des demandes.</p>
            <Button asChild variant='outline'>
              <Link to='/publish'>Publier une voiture</Link>
            </Button>
          </div>
        )}

        {!loading && !error && annonces.length > 0 && (
          <>
            {/* ANNONCES ACTIVES */}
            {annoncesActives.length > 0 && (
              <div className='mb-12'>
                <div className='mb-6'>
                  <h2 className='text-xl font-semibold'>Mes annonces actuelles</h2>
                  <p className='text-sm text-muted-foreground'>Vos véhicules actuellement disponibles à la location</p>
                </div>
                <div className='grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {annoncesActives.map(a => (
                    <Link key={a.id || a.voitureId} to={`/annonces/${a.id || a.voitureId}`} className='block'>
                      <CarCard car={a} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ANNONCES INACTIVES */}
            {annoncesInactives.length > 0 && (
              <div>
                <div className='mb-6'>
                  <h2 className='text-xl font-semibold'>Mes annonces passées</h2>
                  <p className='text-sm text-muted-foreground'>Vos véhicules qui ne sont plus disponibles à la location</p>
                </div>
                <div className='grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-60'>
                  {annoncesInactives.map(a => (
                    <Link key={a.id || a.voitureId} to={`/annonces/${a.id || a.voitureId}`} className='block'>
                      <CarCard car={a} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}

