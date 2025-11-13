import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/header.jsx';
import Footer from '@/components/layout/footer.jsx';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MesReservations() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reservationsEnCours, setReservationsEnCours] = useState([]);
  const [reservationsPassees, setReservationsPassees] = useState([]);
  const [locationsEnCours, setLocationsEnCours] = useState([]);
  const [locationsPassees, setLocationsPassees] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('mes-reservations'); // 'mes-reservations' ou 'mes-locations'
  const [subTab, setSubTab] = useState('en-cours'); // 'en-cours' ou 'passees'

  // États pour les modales
  const [avisModal, setAvisModal] = useState({ open: false, locationId: null, existingAvis: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, locationId: null, reservation: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [avisForm, setAvisForm] = useState({
    noteUtilisateur: 5,
    noteVehicule: 5,
    commentaire: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer mes réservations (en tant que locataire)
      const resReservations = await fetch('/api/locations/mes-reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resReservations.ok) {
        const data = await resReservations.json();
        setReservationsEnCours(Array.isArray(data.enCours) ? data.enCours : []);
        setReservationsPassees(Array.isArray(data.passees) ? data.passees : []);
      }

      // Récupérer mes locations (en tant que propriétaire)
      const resLocations = await fetch('/api/locations/mes-locations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resLocations.ok) {
        const data = await resLocations.json();
        setLocationsEnCours(Array.isArray(data.enCours) ? data.enCours : []);
        setLocationsPassees(Array.isArray(data.passees) ? data.passees : []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminerReservation = async (locationId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/locations/${locationId}/terminer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erreur lors de la finalisation');
      }
      setConfirmModal({ open: false, type: null, locationId: null, reservation: null });
      fetchData();
    } catch (e) {
      alert('❌ Erreur : ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAvisModal = async (locationId) => {
    // Vérifier si un avis existe déjà
    try {
      const res = await fetch(`/api/avis/location/${locationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const existingAvis = await res.json();
        setAvisForm({
          noteUtilisateur: existingAvis.noteUtilisateur || 5,
          noteVehicule: existingAvis.noteVehicule || 5,
          commentaire: existingAvis.commentaire || ''
        });
        setAvisModal({ open: true, locationId, existingAvis });
      } else {
        // Pas d'avis existant
        setAvisForm({ noteUtilisateur: 5, noteVehicule: 5, commentaire: '' });
        setAvisModal({ open: true, locationId, existingAvis: null });
      }
    } catch (e) {
      // Pas d'avis existant
      setAvisForm({ noteUtilisateur: 5, noteVehicule: 5, commentaire: '' });
      setAvisModal({ open: true, locationId, existingAvis: null });
    }
  };

  const handleSubmitAvis = async () => {
    if (!avisForm.noteUtilisateur || avisForm.noteUtilisateur < 1 || avisForm.noteUtilisateur > 5) {
      alert('La note doit être entre 1 et 5');
      return;
    }

    setActionLoading(true);
    try {
      const isUpdate = avisModal.existingAvis !== null;
      const url = isUpdate ? `/api/avis/${avisModal.existingAvis.id}` : '/api/avis';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId: avisModal.locationId,
          noteUtilisateur: avisForm.noteUtilisateur,
          noteVehicule: avisForm.noteVehicule,
          commentaire: avisForm.commentaire
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erreur lors de la soumission de l\'avis');
      }

      setAvisModal({ open: false, locationId: null, existingAvis: null });
      fetchData();
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

  const renderStarSelector = (value, onChange) => {
    return (
      <div className='flex gap-2'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => onChange(star)}
            className='focus:outline-none'
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderReservationCard = (reservation, isPasse = false) => (
    <Card key={reservation.locationId} className='overflow-hidden'>
      <CardHeader className='bg-muted/30'>
        <CardTitle className='text-lg flex items-center justify-between flex-wrap gap-2'>
          <span>{reservation.voitureMarque} {reservation.voitureModele}</span>
          {isPasse && (
            <span className='text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700'>
              Terminée
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6 space-y-4'>
        <div className='grid sm:grid-cols-2 gap-4'>
          <div>
            <p className='text-xs text-muted-foreground mb-1'>Propriétaire</p>
            <p className='font-medium'>{reservation.proprietaireNom} {reservation.proprietairePrenom}</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground mb-1'>Période</p>
            <p className='font-medium'>
              Du {formatDate(reservation.dateDebut)} au {formatDate(reservation.dateFin)}
            </p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground mb-1'>Prix total</p>
            <p className='font-medium text-lg'>{reservation.prixTotal} €</p>
          </div>
        </div>

        <div className='flex gap-3 pt-2'>
          {!isPasse && (
            <Button
              onClick={() => setConfirmModal({ open: true, type: 'terminer', locationId: reservation.locationId, reservation })}
              className='flex-1'
              disabled={actionLoading}
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Marquer comme terminée
            </Button>
          )}
          <Button
            onClick={() => handleOpenAvisModal(reservation.locationId)}
            variant={isPasse ? 'default' : 'outline'}
            className='flex-1'
          >
            <Star className='w-4 h-4 mr-2' />
            {isPasse ? 'Voir/Modifier l\'avis' : 'Laisser un avis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderLocationCard = (location, isPasse = false) => (
    <Card key={location.locationId} className='overflow-hidden'>
      <CardHeader className='bg-muted/30'>
        <CardTitle className='text-lg flex items-center justify-between flex-wrap gap-2'>
          <span>{location.voitureMarque} {location.voitureModele}</span>
          {isPasse && (
            <span className='text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700'>
              Terminée
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6 space-y-4'>
        <div className='grid sm:grid-cols-2 gap-4'>
          <div>
            <p className='text-xs text-muted-foreground mb-1'>Locataire</p>
            <p className='font-medium'>{location.locataireNom} {location.locatairePrenom}</p>
            <div className='mt-1'>
              {renderStars(location.locataireMoyenneAvis, location.locataireNbAvis)}
            </div>
          </div>
          <div>
            <p className='text-xs text-muted-foreground mb-1'>Période</p>
            <p className='font-medium'>
              Du {formatDate(location.dateDebut)} au {formatDate(location.dateFin)}
            </p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground mb-1'>Prix total</p>
            <p className='font-medium text-lg'>{location.prixTotal} €</p>
          </div>
        </div>

        {isPasse && (
          <div className='pt-2'>
            <Button
              onClick={() => handleOpenAvisModal(location.locationId)}
              variant='outline'
              className='w-full'
            >
              <Star className='w-4 h-4 mr-2' />
              Noter le locataire
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <main className='min-h-screen flex flex-col bg-background text-foreground'>
      <Header />
      <section className='flex-1 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full'>
        <div className='mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Mes réservations et locations</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            Gérez vos réservations en tant que locataire et vos locations en tant que propriétaire.
          </p>
        </div>

        {/* Onglets principaux */}
        <div className='flex gap-2 mb-6 border-b'>
          <button
            onClick={() => setActiveTab('mes-reservations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'mes-reservations'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mes réservations
          </button>
          <button
            onClick={() => setActiveTab('mes-locations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'mes-locations'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mes locations
          </button>
        </div>

        {/* Sous-onglets */}
        <div className='flex gap-2 mb-6'>
          <button
            onClick={() => setSubTab('en-cours')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              subTab === 'en-cours'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setSubTab('passees')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              subTab === 'passees'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Passées
          </button>
        </div>

        {loading && <p className='text-sm animate-pulse'>Chargement...</p>}
        {error && !loading && <p className='text-sm text-destructive'>{error}</p>}

        {/* Contenu : Mes réservations */}
        {!loading && !error && activeTab === 'mes-reservations' && (
          <>
            {subTab === 'en-cours' && (
              <>
                {reservationsEnCours.length === 0 ? (
                  <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
                    <h2 className='text-lg font-semibold'>Aucune réservation en cours</h2>
                    <p className='text-sm text-muted-foreground'>
                      Vos réservations confirmées apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6'>
                    {reservationsEnCours.map(r => renderReservationCard(r, false))}
                  </div>
                )}
              </>
            )}
            {subTab === 'passees' && (
              <>
                {reservationsPassees.length === 0 ? (
                  <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
                    <h2 className='text-lg font-semibold'>Aucune réservation passée</h2>
                    <p className='text-sm text-muted-foreground'>
                      Vos réservations terminées apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6'>
                    {reservationsPassees.map(r => renderReservationCard(r, true))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Contenu : Mes locations */}
        {!loading && !error && activeTab === 'mes-locations' && (
          <>
            {subTab === 'en-cours' && (
              <>
                {locationsEnCours.length === 0 ? (
                  <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
                    <h2 className='text-lg font-semibold'>Aucune location en cours</h2>
                    <p className='text-sm text-muted-foreground'>
                      Les locations de vos voitures apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6'>
                    {locationsEnCours.map(l => renderLocationCard(l, false))}
                  </div>
                )}
              </>
            )}
            {subTab === 'passees' && (
              <>
                {locationsPassees.length === 0 ? (
                  <div className='border border-dashed border-border rounded-xl p-8 text-center space-y-4'>
                    <h2 className='text-lg font-semibold'>Aucune location passée</h2>
                    <p className='text-sm text-muted-foreground'>
                      Les locations terminées de vos voitures apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6'>
                    {locationsPassees.map(l => renderLocationCard(l, true))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* Dialog pour les avis */}
      <Dialog open={avisModal.open} onOpenChange={(open) => setAvisModal({ open, locationId: null, existingAvis: null })}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {avisModal.existingAvis ? 'Modifier mon avis' : 'Laisser un avis'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'mes-reservations'
                ? 'Notez le propriétaire et le véhicule'
                : 'Notez le locataire'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label>
                {activeTab === 'mes-reservations' ? 'Note du propriétaire' : 'Note du locataire'} *
              </Label>
              <div className='mt-2'>
                {renderStarSelector(avisForm.noteUtilisateur, (value) =>
                  setAvisForm({ ...avisForm, noteUtilisateur: value })
                )}
              </div>
            </div>

            {activeTab === 'mes-reservations' && (
              <div>
                <Label>Note du véhicule (optionnel)</Label>
                <div className='mt-2'>
                  {renderStarSelector(avisForm.noteVehicule || 0, (value) =>
                    setAvisForm({ ...avisForm, noteVehicule: value })
                  )}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor='commentaire'>Commentaire (optionnel)</Label>
              <Textarea
                id='commentaire'
                value={avisForm.commentaire}
                onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })}
                placeholder='Partagez votre expérience...'
                rows={4}
                className='mt-2'
              />
            </div>

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => setAvisModal({ open: false, locationId: null, existingAvis: null })}
                className='flex-1'
                disabled={actionLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitAvis}
                className='flex-1'
                disabled={actionLoading}
              >
                {actionLoading ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale de confirmation professionnelle */}
      {confirmModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='bg-white rounded-xl shadow-2xl p-6 w-[95%] max-w-md space-y-4 animate-in zoom-in-95 duration-200'>
            {confirmModal.type === 'terminer' && (
              <>
                <div className='text-center space-y-2'>
                  <div className='mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                    <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                  <h2 className='text-xl font-semibold'>Marquer comme terminée</h2>
                  <p className='text-sm text-muted-foreground'>
                    Vous êtes sur le point de marquer cette réservation comme terminée pour{' '}
                    <strong>{confirmModal.reservation?.voitureMarque} {confirmModal.reservation?.voitureModele}</strong>.
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Cette action signifie que la location est terminée et vous pourrez laisser un avis.
                  </p>
                </div>
                <div className='flex gap-3'>
                  <Button
                    onClick={() => setConfirmModal({ open: false, type: null, locationId: null, reservation: null })}
                    variant='outline'
                    className='flex-1'
                    disabled={actionLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleTerminerReservation(confirmModal.locationId)}
                    className='flex-1 bg-green-600 hover:bg-green-700'
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Confirmation...' : 'Confirmer'}
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

