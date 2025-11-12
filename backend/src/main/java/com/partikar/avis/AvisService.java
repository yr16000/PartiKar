package com.partikar.avis;

import com.partikar.location.Location;
import com.partikar.location.LocationRepository;
import com.partikar.user.User;
import com.partikar.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AvisService {

    private static final Logger logger = LoggerFactory.getLogger(AvisService.class);

    private final AvisRepository avisRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    public AvisService(AvisRepository avisRepository, LocationRepository locationRepository, UserRepository userRepository) {
        this.avisRepository = avisRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AvisResponse creerAvis(CreerAvisRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User auteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        boolean estLocataire = location.getLocataire().getId().equals(auteur.getId());
        boolean estProprietaire = location.getVoiture().getProprietaire().getId().equals(auteur.getId());

        if (!estLocataire && !estProprietaire) {
            throw new RuntimeException("Vous n'êtes pas autorisé à laisser un avis pour cette location");
        }

        if (!"TERMINEE".equals(location.getStatut()) && !"CONFIRMEE".equals(location.getStatut())) {
            throw new RuntimeException("Vous ne pouvez laisser un avis que pour une réservation confirmée ou terminée");
        }

        if (request.getNoteUtilisateur() == null || request.getNoteUtilisateur() < 1 || request.getNoteUtilisateur() > 5) {
            throw new RuntimeException("La note utilisateur doit être entre 1 et 5");
        }

        List<Avis> avisExistants = avisRepository.findByLocationId(location.getId());
        Optional<Avis> avisExistant = avisExistants.stream()
                .filter(a -> a.getAuteur().getId().equals(auteur.getId()))
                .findFirst();

        if (avisExistant.isPresent()) {
            throw new RuntimeException("Vous avez déjà laissé un avis pour cette location. Utilisez la modification d'avis.");
        }

        User cible = estLocataire ? location.getVoiture().getProprietaire() : location.getLocataire();

        Avis avis = new Avis();
        avis.setLocation(location);
        avis.setAuteur(auteur);
        avis.setCible(cible);
        avis.setNoteUtilisateur(request.getNoteUtilisateur());
        avis.setNoteVehicule(request.getNoteVehicule());
        avis.setCommentaire(request.getCommentaire());

        Avis saved = avisRepository.save(avis);
        logger.info("Avis créé: ID={} pour la location {}", saved.getId(), location.getId());

        return AvisResponse.fromAvis(saved);
    }

    @Transactional
    public AvisResponse modifierAvis(Long avisId, CreerAvisRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User auteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Avis avis = avisRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));

        if (!avis.getAuteur().getId().equals(auteur.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cet avis");
        }

        if (request.getNoteUtilisateur() == null || request.getNoteUtilisateur() < 1 || request.getNoteUtilisateur() > 5) {
            throw new RuntimeException("La note utilisateur doit être entre 1 et 5");
        }

        avis.setNoteUtilisateur(request.getNoteUtilisateur());
        avis.setNoteVehicule(request.getNoteVehicule());
        avis.setCommentaire(request.getCommentaire());
        avis.setMajLe(LocalDateTime.now());

        Avis saved = avisRepository.save(avis);
        logger.info("Avis modifié: ID={}", saved.getId());

        return AvisResponse.fromAvis(saved);
    }

    @Transactional(readOnly = true)
    public AvisResponse getMonAvisPourLocation(Long locationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User auteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<Avis> avis = avisRepository.findByLocationId(locationId);
        Optional<Avis> monAvis = avis.stream()
                .filter(a -> a.getAuteur().getId().equals(auteur.getId()))
                .findFirst();

        if (monAvis.isEmpty()) {
            throw new RuntimeException("Aucun avis trouvé pour cette location");
        }

        return AvisResponse.fromAvis(monAvis.get());
    }

    @Transactional(readOnly = true)
    public List<AvisResponse> getAvisUtilisateur(Long userId) {
        List<Avis> avis = avisRepository.findByCibleId(userId);
        return avis.stream()
                .map(AvisResponse::fromAvis)
                .collect(Collectors.toList());
    }

    @Transactional
    public void supprimerAvis(Long avisId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User auteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Avis avis = avisRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));

        if (!avis.getAuteur().getId().equals(auteur.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cet avis");
        }

        avisRepository.delete(avis);
        logger.info("Avis supprimé: ID={}", avisId);
    }
}

