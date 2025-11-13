import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/header.jsx';
import Footer from '@/components/layout/footer.jsx';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function DemandesReservation() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [demandesRecues, setDemandesRecues] = useState([]);
  const [mesDemandesEnvoyees, setMesDemandesEnvoyees] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recues'); // 'recues' ou 'envoyees'
  const [subTab, setSubTab] = useState('en-cours'); // 'en-cours' ou 'passees'

  // États pour les modales de confirmation
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, locationId: null, demande: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les demandes reçues (en attente)
        const resRecues = await fetch('/api/locations/proprietaire/en-attente', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resRecues.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        }
        if (resRecues.ok) {
          const dataRecues = await resRecues.json();
          setDemandesRecues(Array.isArray(dataRecues) ? dataRecues : []);
        }

        // Récupérer mes demandes envoyées
        const resEnvoyees = await fetch('/api/locations/mes-demandes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resEnvoyees.ok) {
          const dataEnvoyees = await resEnvoyees.json();
          setMesDemandesEnvoyees(Array.isArray(dataEnvoyees) ? dataEnvoyees : []);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDemandes();
  }, [token, navigate]);

  const handleAccepter = async (locationId) => {
    setActionLoading(true);
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
      setDemandesRecues(demandesRecues.filter(d => d.locationId !== locationId));
      setConfirmModal({ open: false, type: null, locationId: null, demande: null });
    } catch (e) {
      alert('❌ Erreur : ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuser = async (locationId) => {
    setActionLoading(true);
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
      setDemandesRecues(demandesRecues.filter(d => d.locationId !== locationId));
      setConfirmModal({ open: false, type: null, locationId: null, demande: null });
    } catch (e) {
      alert('❌ Erreur : ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnnulerDemande = async (locationId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/locations/${locationId}/annuler-locataire`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erreur lors de l\'annulation');
      }
      // Recharger les demandes
      setMesDemandesEnvoyees(mesDemandesEnvoyees.filter(d => d.locationId !== locationId));
      setConfirmModal({ open: false, type: null, locationId: null, demande: null });
    } catch (e) {
      alert('❌ Erreur : ' + e.message);
    } finally {
      setActionLoading(false);
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

  const getStatutBadge = (statut) => {
    const statutLower = statut?.toLowerCase();
    if (statutLower === 'en_attente') {
      return <span className='text-sm font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700'>En attente</span>;
    } else if (statutLower === 'confirmee') {
      return <span className='text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-700'>Acceptée</span>;
    } else if (statutLower === 'annulee') {
      return <span className='text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-700'>Refusée par le propriétaire</span>;
    } else if (statutLower === 'annulee_par_locataire') {
      return <span className='text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700'>Annulée par vous</span>;
    }
    return <span className='text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700'>{statut}</span>;
  };

  const renderStars = (moyenne, nbAvis) => {
    if (!moyenne || nbAvis === 0) {
      return <span className='text-sm text-muted-foreground'>Pas encore d'avis</span>;
    }
    return (
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1'>
          <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
          <span className='font-medium'>{moyenne.toFixed(1)}</span>
        </div>
        <span className='text-sm text-muted-foreground'>({nbAvis} avis)</span>
      </div>
    );
  };

  // Filtrer les demandes envoyées par statut
  const demandesEnCours = mesDemandesEnvoyees.filter(d => d.statut === 'EN_ATTENTE');
  const demandesPassees = mesDemandesEnvoyees.filter(d => d.statut === 'CONFIRMEE' || d.statut === 'ANNULEE' || d.statut === 'ANNULEE_PAR_LOCATAIRE' || d.statut === 'TERMINEE');

  return (
    <main className='min-h-screen flex flex-col bg-background text-foreground'>
      <Header />
      <section className='flex-1 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full'>
        <div className='mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Mes demandes de réservation</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            Gérez vos demandes reçues et suivez vos demandes envoyées.
          </p>
        </div>

        {/* Onglets */}
        <div className='flex gap-2 mb-6 border-b'>
          <button
            onClick={() => setActiveTab('recues')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'recues'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Demandes reçues ({demandesRecues.length})
          </button>
          <button
            onClick={() => setActiveTab('envoyees')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'envoyees'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mes demandes envoyées ({mesDemandesEnvoyees.length})
          </button>
        </div>

        {loading && <p className='text-sm animate-pulse'>Chargement des demandes...</p>}
        {error && !loading && <p className='text-sm text-destructive'>{error}</p>}

        {/* Onglet Demandes Reçues */}
        {!loading && !error && activeTab === 'recues' && (
          <>
            {demandesRecues.length === 0 ? (
              <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
                <h2 className='text-lg font-semibold'>Aucune demande en attente</h2>
                <p className='text-sm text-muted-foreground'>
                  Les nouvelles demandes de réservation apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className='grid gap-6'>
                {demandesRecues.map(demande => (
                  <Card key={demande.locationId} className='overflow-hidden'>
                    <CardHeader className='bg-muted/30'>
                      <CardTitle className='text-lg flex items-center justify-between flex-wrap gap-2'>
                        <span>
                          {demande.voitureMarque} {demande.voitureModele}
                        </span>
                        {getStatutBadge(demande.statut)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-6 space-y-4'>
                      <div className='grid sm:grid-cols-2 gap-4'>
                        <div>
                          <p className='text-xs text-muted-foreground mb-1'>Locataire</p>
                          <p className='font-medium'>{demande.locataireNom} {demande.locatairePrenom}</p>
                          <div className='mt-1'>
                            {renderStars(demande.locataireMoyenneAvis, demande.locataireNbAvis)}
                          </div>
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
                          onClick={() => setConfirmModal({ open: true, type: 'accepter', locationId: demande.locationId, demande })}
                          className='flex-1'
                        >
                          Accepter
                        </Button>
                        <Button
                          onClick={() => setConfirmModal({ open: true, type: 'refuser', locationId: demande.locationId, demande })}
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
            )}
          </>
        )}

        {/* Onglet Mes Demandes Envoyées */}
        {!loading && !error && activeTab === 'envoyees' && (
          <>
            {/* Sous-onglets pour les demandes envoyées */}
            <div className='flex gap-2 mb-6'>
              <button
                onClick={() => setSubTab('en-cours')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  subTab === 'en-cours'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                En cours ({demandesEnCours.length})
              </button>
              <button
                onClick={() => setSubTab('passees')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  subTab === 'passees'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Passées ({demandesPassees.length})
              </button>
            </div>

            {/* Demandes en cours (EN_ATTENTE) */}
            {subTab === 'en-cours' && (
              <>
                {demandesEnCours.length === 0 ? (
                  <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
                    <h2 className='text-lg font-semibold'>Aucune demande en cours</h2>
                    <p className='text-sm text-muted-foreground'>
                      Vos demandes en attente de réponse apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6'>
                    {demandesEnCours.map(demande => (
                      <Card key={demande.locationId} className='overflow-hidden'>
                        <CardHeader className='bg-muted/30'>
                          <CardTitle className='text-lg flex items-center justify-between flex-wrap gap-2'>
                            <span>
                              {demande.voitureMarque} {demande.voitureModele}
                            </span>
                            {getStatutBadge(demande.statut)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='pt-6 space-y-4'>
                          <div className='grid sm:grid-cols-2 gap-4'>
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
                            <div>
                              <p className='text-xs text-muted-foreground mb-1'>Statut</p>
                              <p className='font-medium'>En attente de validation</p>
                            </div>
                          </div>

                          <div className='pt-2'>
                            <Button
                              onClick={() => setConfirmModal({ open: true, type: 'annuler', locationId: demande.locationId, demande })}
                              variant='destructive'
                              className='w-full'
                            >
                              Annuler ma demande
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Demandes passées (CONFIRMEE, ANNULEE, TERMINEE) */}
            {subTab === 'passees' && (
              <>
                {demandesPassees.length === 0 ? (
                  <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
                    <h2 className='text-lg font-semibold'>Aucune demande passée</h2>
                    <p className='text-sm text-muted-foreground'>
                      Vos demandes acceptées, refusées ou terminées apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6'>
                    {demandesPassees.map(demande => (
                      <Card key={demande.locationId} className='overflow-hidden'>
                        <CardHeader className='bg-muted/30'>
                          <CardTitle className='text-lg flex items-center justify-between flex-wrap gap-2'>
                            <span>
                              {demande.voitureMarque} {demande.voitureModele}
                            </span>
                            {getStatutBadge(demande.statut)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='pt-6 space-y-4'>
                          <div className='grid sm:grid-cols-2 gap-4'>
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
                            <div>
                              <p className='text-xs text-muted-foreground mb-1'>Statut</p>
                              <p className='font-medium'>
                                {demande.statut === 'CONFIRMEE' && 'Acceptée par le propriétaire'}
                                {demande.statut === 'ANNULEE' && 'Refusée par le propriétaire'}
                                {demande.statut === 'ANNULEE_PAR_LOCATAIRE' && 'Annulée par vous'}
                                {demande.statut === 'TERMINEE' && 'Terminée'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* Modale de confirmation professionnelle */}
      {confirmModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='bg-white rounded-xl shadow-2xl p-6 w-[95%] max-w-md space-y-4 animate-in zoom-in-95 duration-200'>
            {confirmModal.type === 'accepter' && (
              <>
                <div className='text-center space-y-2'>
                  <div className='mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                    <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                  <h2 className='text-xl font-semibold'>Accepter la réservation</h2>
                  <p className='text-sm text-muted-foreground'>
                    Vous êtes sur le point d'accepter la demande de réservation de{' '}
                    <strong>{confirmModal.demande?.locatairePrenom} {confirmModal.demande?.locataireNom}</strong> pour{' '}
                    <strong>{confirmModal.demande?.voitureMarque} {confirmModal.demande?.voitureModele}</strong>.
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Les dates seront réservées et les autres demandes pour cette période seront automatiquement refusées.
                  </p>
                </div>
                <div className='flex gap-3'>
                  <Button
                    onClick={() => setConfirmModal({ open: false, type: null, locationId: null, demande: null })}
                    variant='outline'
                    className='flex-1'
                    disabled={actionLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleAccepter(confirmModal.locationId)}
                    className='flex-1 bg-green-600 hover:bg-green-700'
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Acceptation...' : 'Confirmer'}
                  </Button>
                </div>
              </>
            )}

            {confirmModal.type === 'refuser' && (
              <>
                <div className='text-center space-y-2'>
                  <div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
                    <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </div>
                  <h2 className='text-xl font-semibold'>Refuser la réservation</h2>
                  <p className='text-sm text-muted-foreground'>
                    Vous êtes sur le point de refuser la demande de{' '}
                    <strong>{confirmModal.demande?.locatairePrenom} {confirmModal.demande?.locataireNom}</strong>.
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Cette action est définitive et le locataire en sera informé.
                  </p>
                </div>
                <div className='flex gap-3'>
                  <Button
                    onClick={() => setConfirmModal({ open: false, type: null, locationId: null, demande: null })}
                    variant='outline'
                    className='flex-1'
                    disabled={actionLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleRefuser(confirmModal.locationId)}
                    variant='destructive'
                    className='flex-1'
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Refus...' : 'Confirmer le refus'}
                  </Button>
                </div>
              </>
            )}

            {confirmModal.type === 'annuler' && (
              <>
                <div className='text-center space-y-2'>
                  <div className='mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center'>
                    <svg className='w-6 h-6 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                    </svg>
                  </div>
                  <h2 className='text-xl font-semibold'>Annuler ma demande</h2>
                  <p className='text-sm text-muted-foreground'>
                    Vous êtes sur le point d'annuler votre demande de réservation pour{' '}
                    <strong>{confirmModal.demande?.voitureMarque} {confirmModal.demande?.voitureModele}</strong>.
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Cette action est définitive et vous devrez créer une nouvelle demande si vous changez d'avis.
                  </p>
                </div>
                <div className='flex gap-3'>
                  <Button
                    onClick={() => setConfirmModal({ open: false, type: null, locationId: null, demande: null })}
                    variant='outline'
                    className='flex-1'
                    disabled={actionLoading}
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={() => handleAnnulerDemande(confirmModal.locationId)}
                    variant='destructive'
                    className='flex-1'
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}