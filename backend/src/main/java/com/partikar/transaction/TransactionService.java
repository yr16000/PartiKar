package com.partikar.transaction;

import com.partikar.location.Location;
import com.partikar.user.User;
import com.partikar.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Crée une transaction EN_ATTENTE pour suspendre des crédits lors d'une demande de réservation.
     * Vérifie que l'utilisateur a suffisamment de crédits.
     */
    @Transactional
    public Transaction creerTransactionEnAttente(User locataire, Location location, BigDecimal montant) {
        // Vérifier que le locataire a assez de crédits (incluant les crédits déjà suspendus)
        BigDecimal creditsDisponibles = calculerCreditsDisponibles(locataire);

        if (creditsDisponibles.compareTo(montant) < 0) {
            throw new RuntimeException("Crédits insuffisants. Disponible: " + creditsDisponibles + " €, Requis: " + montant + " €");
        }

        Transaction transaction = new Transaction(locataire, location, montant.negate(), "RESERVATION_SUSPENSION", "EN_ATTENTE");
        Transaction saved = transactionRepository.save(transaction);

        logger.info("Transaction EN_ATTENTE créée: {} € suspendus pour l'utilisateur {}", montant, locataire.getId());
        return saved;
    }

    /**
     * Confirme une transaction EN_ATTENTE et débite réellement les crédits.
     */
    @Transactional
    public void confirmerTransaction(Long locationId) {
        List<Transaction> transactions = transactionRepository.findByLocationId(locationId);

        for (Transaction transaction : transactions) {
            if ("EN_ATTENTE".equals(transaction.getStatut())) {
                // Débiter les crédits du locataire
                User locataire = transaction.getUtilisateur();
                BigDecimal montant = transaction.getMontant().abs();

                BigDecimal nouveauSolde = locataire.getCredits().subtract(montant);
                if (nouveauSolde.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Crédits insuffisants lors de la confirmation");
                }

                locataire.setCredits(nouveauSolde);
                userRepository.save(locataire);

                // Changer le statut de la transaction
                transaction.setStatut("CONFIRMEE");
                transaction.setType("RESERVATION_DEBIT");
                transactionRepository.save(transaction);

                logger.info("Transaction confirmée: {} € débités de l'utilisateur {}", montant, locataire.getId());

                // Créer une transaction crédit pour le propriétaire
                User proprietaire = transaction.getLocation().getVoiture().getProprietaire();
                BigDecimal nouveauSoldeProprio = proprietaire.getCredits().add(montant);
                proprietaire.setCredits(nouveauSoldeProprio);
                userRepository.save(proprietaire);

                Transaction transactionProprio = new Transaction(
                    proprietaire,
                    transaction.getLocation(),
                    montant,
                    "PAIEMENT_LOCATION",
                    "CONFIRMEE"
                );
                transactionRepository.save(transactionProprio);

                logger.info("Transaction crédit créée: {} € crédités au propriétaire {}", montant, proprietaire.getId());
            }
        }
    }

    /**
     * Annule une transaction EN_ATTENTE (libère les crédits suspendus).
     */
    @Transactional
    public void annulerTransaction(Long locationId) {
        List<Transaction> transactions = transactionRepository.findByLocationId(locationId);

        for (Transaction transaction : transactions) {
            if ("EN_ATTENTE".equals(transaction.getStatut())) {
                transaction.setStatut("ANNULEE");
                transactionRepository.save(transaction);

                logger.info("Transaction annulée: crédits libérés pour l'utilisateur {}", transaction.getUtilisateur().getId());
            }
        }
    }

    /**
     * Calcule les crédits disponibles d'un utilisateur (crédits totaux - crédits suspendus).
     */
    public BigDecimal calculerCreditsDisponibles(User user) {
        BigDecimal creditsTotal = user.getCredits();

        // Calculer les crédits suspendus (transactions EN_ATTENTE)
        List<Transaction> transactionsEnAttente = transactionRepository.findByUtilisateurId(user.getId()).stream()
            .filter(t -> "EN_ATTENTE".equals(t.getStatut()))
            .toList();

        BigDecimal creditsSuspendus = transactionsEnAttente.stream()
            .map(Transaction::getMontant)
            .map(BigDecimal::abs)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal disponible = creditsTotal.subtract(creditsSuspendus);

        logger.debug("Crédits utilisateur {}: total={}, suspendus={}, disponibles={}",
            user.getId(), creditsTotal, creditsSuspendus, disponible);

        return disponible;
    }

    /**
     * Récupère toutes les transactions d'un utilisateur.
     */
    public List<Transaction> getTransactionsUtilisateur(Long userId) {
        return transactionRepository.findByUtilisateurId(userId);
    }
}

