package com.partikar.user;

import com.partikar.user.profile.UserProfile;

public class UserMapper {
    public static UserProfile toProfile(User u) {
        return new UserProfile(
                u.getId(),
                u.getNom(),
                u.getPrenom(),
                u.getEmail(),
                u.getDateDeNaissance(),
                u.getTelephone(),
                u.getAdresse(),
                u.getNumeroPermis(),
                u.getExpirationPermis(),
                u.getCredits(),
                u.getCreeLe(),
                u.getMajLe()
        );
    }
}
