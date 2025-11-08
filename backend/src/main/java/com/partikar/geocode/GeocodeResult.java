package com.partikar.geocode;

public class GeocodeResult {
    private String label;
    private String city;
    private String postcode;
    private String country;
    private double latitude;
    private double longitude;
    private String providerId;

    public GeocodeResult() {}

    public GeocodeResult(String label, String city, String postcode, String country, double latitude, double longitude, String providerId) {
        this.label = label;
        this.city = city;
        this.postcode = postcode;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.providerId = providerId;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPostcode() { return postcode; }
    public void setPostcode(String postcode) { this.postcode = postcode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
}

