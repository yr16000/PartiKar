import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/header.jsx';
import Footer from '@/components/layout/footer.jsx';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DemandesReservation() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [demandes, setDemandes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/locations/proprietaire/en-attente', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Erreur lors du chargement des demandes');
        }
        const data = await res.json();
        setDemandes(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDemandes();
  }, [token, navigate]);

  const handleAccepter = async (locationId) => {
    if (!confirm('Accepter cette demande de réservation ?')) return;
    try {
      const res = await fetch(`/api/locations/${locationId}/valider`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erreur lors de la validation');
      }
      // Recharger les demandes
      setDemandes(demandes.filter(d => d.locationId !== locationId));
      alert('Réservation acceptée !');
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  };

  const handleRefuser = async (locationId) => {
    if (!confirm('Refuser cette demande de réservation ?')) return;
    try {
      const res = await fetch(`/api/locations/${locationId}/annuler`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erreur lors du refus');
      }
      // Recharger les demandes
      setDemandes(demandes.filter(d => d.locationId !== locationId));
      alert('Réservation refusée.');
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className='min-h-screen flex flex-col bg-background text-foreground'>
      <Header />
      <section className='flex-1 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full'>
        <div className='mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Mes demandes de réservation</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            Les locataires qui souhaitent réserver l'une de vos voitures.
          </p>
        </div>

        {loading && <p className='text-sm animate-pulse'>Chargement des demandes...</p>}
        {error && !loading && <p className='text-sm text-destructive'>{error}</p>}

        {!loading && !error && demandes.length === 0 && (
          <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
            <h2 className='text-lg font-semibold'>Aucune demande en attente</h2>
            <p className='text-sm text-muted-foreground'>
              Les nouvelles demandes de réservation apparaîtront ici.
            </p>
          </div>
        )}

        <div className='grid gap-6'>
          {demandes.map(demande => (
            <Card key={demande.locationId} className='overflow-hidden'>
              <CardHeader className='bg-muted/30'>
                <CardTitle className='text-lg flex items-center justify-between flex-wrap gap-2'>
                  <span>
                    {demande.voitureMarque} {demande.voitureModele}
                  </span>
                  <span className='text-sm font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700'>
                    En attente
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-6 space-y-4'>
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Locataire</p>
                    <p className='font-medium'>{demande.locataireNom} {demande.locatairePrenom}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Période</p>
                    <p className='font-medium'>
                      Du {formatDate(demande.dateDebut)} au {formatDate(demande.dateFin)}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Prix total</p>
                    <p className='font-medium text-lg'>{demande.prixTotal} €</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Date de demande</p>
                    <p className='font-medium'>{formatDate(demande.creeLe)}</p>
                  </div>
                </div>

                <div className='flex gap-3 pt-2'>
                  <Button
                    onClick={() => handleAccepter(demande.locationId)}
                    className='flex-1'
                  >
                    Accepter
                  </Button>
                  <Button
                    onClick={() => handleRefuser(demande.locationId)}
                    variant='destructive'
                    className='flex-1'
                  >
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

