package com.partikar.auth;

import com.partikar.auth.dto.AuthResponse;
import com.partikar.auth.dto.LoginRequest;
import com.partikar.auth.dto.RegisterRequest;
import com.partikar.security.JwtService;
import com.partikar.user.User;
import com.partikar.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository, 
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserDetailsService userDetailsService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        //verifier si l'email existe déjà
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalStateException("Cet email est déjà utilisé");
        }

        //Vérifier l'age (min 17 ans)
        LocalDate dateDeNaissance = request.dateDeNaissance();
        if (Period.between(dateDeNaissance, LocalDate.now()).getYears() < 17) {
            throw new IllegalStateException("L'utilisateur doit avoir au moins 17 ans");
        }

        String password= request.password();
        if (password.length() < 8) {
            throw new IllegalStateException("Le mot de passe doit faire au moins 8 caractères");
        }

        User user = new User();

        user.setNom(request.nom());
        user.setPrenom(request.prenom());
        user.setEmail(request.email());
        user.setDateDeNaissance(request.dateDeNaissance());

        //HACHER le mot de passe
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        //Donner les crédits de départ
        user.setCredits(new BigDecimal("100.00"));
        //Sauvegarder l'utilisateur
        userRepository.save(user);

        //Générer un token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        //Renvoyer le DTO de réponse
        return new AuthResponse(token);
    }

    /**
     * Logique métier pour la connexion d'un utilisateur.
     */
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        String token = jwtService.generateToken(userDetails);
        return new AuthResponse(token);
    }
}