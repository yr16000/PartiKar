package com.partikar.email;

import com.partikar.location.Location;
import com.partikar.user.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoie un email au propriétaire lorsqu'une nouvelle demande de réservation est créée.
     */
    @Async
    public void envoyerNotificationNouvelleDemandeProprietaire(Location location) {
        try {
            User proprietaire = location.getVoiture().getProprietaire();
            User locataire = location.getLocataire();

            String subject = "Nouvelle demande de réservation pour votre " +
                           location.getVoiture().getMarque() + " " + location.getVoiture().getModele();

            String htmlContent = construireEmailNouvelleDemandeProprietaire(location, proprietaire, locataire);

            envoyerEmail(proprietaire.getEmail(), subject, htmlContent);
            logger.info("Email de nouvelle demande envoyé au propriétaire: {}", proprietaire.getEmail());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email au propriétaire: {}", e.getMessage(), e);
        }
    }

    /**
     * Envoie un email au locataire lorsque sa demande est acceptée.
     */
    @Async
    public void envoyerNotificationDemandeAccepteeLocataire(Location location) {
        try {
            User locataire = location.getLocataire();
            User proprietaire = location.getVoiture().getProprietaire();

            String subject = "Réservation acceptée - " +
                           location.getVoiture().getMarque() + " " + location.getVoiture().getModele();

            String htmlContent = construireEmailDemandeAccepteeLocataire(location, locataire, proprietaire);

            envoyerEmail(locataire.getEmail(), subject, htmlContent);
            logger.info("Email d'acceptation envoyé au locataire: {}", locataire.getEmail());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email au locataire: {}", e.getMessage(), e);
        }
    }

    /**
     * Envoie un email au locataire lorsque sa demande est refusée.
     */
    @Async
    public void envoyerNotificationDemandeRefuseeLocataire(Location location) {
        try {
            User locataire = location.getLocataire();

            String subject = "Réservation refusée - " +
                           location.getVoiture().getMarque() + " " + location.getVoiture().getModele();

            String htmlContent = construireEmailDemandeRefuseeLocataire(location, locataire);

            envoyerEmail(locataire.getEmail(), subject, htmlContent);
            logger.info("Email de refus envoyé au locataire: {}", locataire.getEmail());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email au locataire: {}", e.getMessage(), e);
        }
    }

    /**
     * Méthode générique pour envoyer un email HTML.
     */
    private void envoyerEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    /**
     * Construit le contenu HTML de l'email pour une nouvelle demande au propriétaire.
     */
    private String construireEmailNouvelleDemandeProprietaire(Location location, User proprietaire, User locataire) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String dateDebut = location.getDateDebut().format(formatter);
        String dateFin = location.getDateFin().format(formatter);

        String lienDemandes = frontendUrl + "/demandes-reservation";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }" +
                ".info-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }" +
                ".info-row { margin: 10px 0; }" +
                ".label { font-weight: bold; color: #6b7280; }" +
                ".value { color: #111827; }" +
                ".button { display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }" +
                ".button:hover { background-color: #4338CA; }" +
                ".footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Nouvelle demande de réservation</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Bonjour " + proprietaire.getPrenom() + ",</p>" +
                "<p>Vous avez reçu une nouvelle demande de réservation pour votre véhicule <strong>" +
                location.getVoiture().getMarque() + " " + location.getVoiture().getModele() + "</strong>.</p>" +
                "<div class='info-box'>" +
                "<div class='info-row'><span class='label'>Locataire :</span> <span class='value'>" +
                locataire.getPrenom() + " " + locataire.getNom() + "</span></div>" +
                "<div class='info-row'><span class='label'>Période :</span> <span class='value'>Du " +
                dateDebut + " au " + dateFin + "</span></div>" +
                "<div class='info-row'><span class='label'>Prix total :</span> <span class='value'>" +
                location.getPrixTotal() + " €</span></div>" +
                "</div>" +
                "<p style='text-align: center;'>" +
                "<a href='" + lienDemandes + "' class='button'>Voir la demande</a>" +
                "</p>" +
                "<p style='color: #6b7280; font-size: 14px;'>Connectez-vous à votre compte pour accepter ou refuser cette demande.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Cet email a été envoyé automatiquement par PartiKar.<br>Merci de ne pas répondre à ce message.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Construit le contenu HTML de l'email pour une demande acceptée au locataire.
     */
    private String construireEmailDemandeAccepteeLocataire(Location location, User locataire, User proprietaire) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String dateDebut = location.getDateDebut().format(formatter);
        String dateFin = location.getDateFin().format(formatter);

        String lienReservations = frontendUrl + "/mes-reservations";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #10B981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }" +
                ".info-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }" +
                ".info-row { margin: 10px 0; }" +
                ".label { font-weight: bold; color: #6b7280; }" +
                ".value { color: #111827; }" +
                ".button { display: inline-block; background-color: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }" +
                ".button:hover { background-color: #059669; }" +
                ".success-badge { background-color: #D1FAE5; color: #065F46; padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }" +
                ".footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Réservation acceptée !</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Bonjour " + locataire.getPrenom() + ",</p>" +
                "<p>Bonne nouvelle ! Votre demande de réservation a été <span class='success-badge'>ACCEPTÉE</span> par le propriétaire.</p>" +
                "<div class='info-box'>" +
                "<div class='info-row'><span class='label'>Véhicule :</span> <span class='value'>" +
                location.getVoiture().getMarque() + " " + location.getVoiture().getModele() + "</span></div>" +
                "<div class='info-row'><span class='label'>Propriétaire :</span> <span class='value'>" +
                proprietaire.getPrenom() + " " + proprietaire.getNom() + "</span></div>" +
                "<div class='info-row'><span class='label'>Période :</span> <span class='value'>Du " +
                dateDebut + " au " + dateFin + "</span></div>" +
                "<div class='info-row'><span class='label'>Prix total :</span> <span class='value'>" +
                location.getPrixTotal() + " €</span></div>" +
                "</div>" +
                "<p style='text-align: center;'>" +
                "<a href='" + lienReservations + "' class='button'>Voir ma réservation</a>" +
                "</p>" +
                "<p style='color: #6b7280; font-size: 14px;'>Le paiement a été effectué. Vous pouvez maintenant coordonner avec le propriétaire pour récupérer le véhicule.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Cet email a été envoyé automatiquement par PartiKar.<br>Merci de ne pas répondre à ce message.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Construit le contenu HTML de l'email pour une demande refusée au locataire.
     */
    private String construireEmailDemandeRefuseeLocataire(Location location, User locataire) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String dateDebut = location.getDateDebut().format(formatter);
        String dateFin = location.getDateFin().format(formatter);

        String lienRecherche = frontendUrl + "/search";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }" +
                ".info-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444; }" +
                ".info-row { margin: 10px 0; }" +
                ".label { font-weight: bold; color: #6b7280; }" +
                ".value { color: #111827; }" +
                ".button { display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }" +
                ".button:hover { background-color: #4338CA; }" +
                ".footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Réservation refusée</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Bonjour " + locataire.getPrenom() + ",</p>" +
                "<p>Nous sommes désolés de vous informer que votre demande de réservation a été refusée par le propriétaire.</p>" +
                "<div class='info-box'>" +
                "<div class='info-row'><span class='label'>Véhicule :</span> <span class='value'>" +
                location.getVoiture().getMarque() + " " + location.getVoiture().getModele() + "</span></div>" +
                "<div class='info-row'><span class='label'>Période :</span> <span class='value'>Du " +
                dateDebut + " au " + dateFin + "</span></div>" +
                "</div>" +
                "<p>Vos crédits ont été automatiquement recrédités sur votre compte.</p>" +
                "<p style='text-align: center;'>" +
                "<a href='" + lienRecherche + "' class='button'>Chercher un autre véhicule</a>" +
                "</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Cet email a été envoyé automatiquement par PartiKar.<br>Merci de ne pas répondre à ce message.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}

