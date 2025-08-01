package com.example.Gruhani.Configuration;

import com.example.Gruhani.models.userdetailsServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class securityconfig {
    @Autowired
private userdetailsServices userDetailsService;

@Bean
public UserDetailsService userDetailsService()
{
    return new userdetailsServices();
}


    @Autowired
    public void bindAuthManager(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(new BCryptPasswordEncoder());
    }

    @Bean
    public SecurityFilterChain secure(HttpSecurity hs) throws Exception {
        return hs.csrf(o->o.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .logout(logout -> logout
                    .logoutUrl("/logout")
                    .logoutSuccessUrl("/logins")
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID"))
                .authorizeHttpRequests(o->o
                    .requestMatchers("/logins","/register","/home","/api/**","/register-seller","/seller-login","/view-pending","/get-all-products","/add-product","/got-message","/upload").permitAll()
                    .anyRequest().authenticated())

                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("https://grihini-1.onrender.com")); // ✅ use this
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // ✅ keep this

// Optional: Allow exposing headers if needed (e.g., Authorization)
// configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

@Bean
public BCryptPasswordEncoder bCryptPasswordEncoder()
{
    return new BCryptPasswordEncoder();
}
}
