package com.ProjectADN.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TicketType type;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false)
    private TicketMethod method;
    
    @Column(name = "reason", nullable = false)
    private String reason;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "appointment_date")
    private LocalDate appointmentDate;
    
    @Column(name = "sample1_name", nullable = false)
    private String sample1Name;
    
    @Column(name = "sample2_name", nullable = false)
    private String sample2Name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;
    
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TicketStatus status = TicketStatus.PENDING;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "result")
    private String result;
    
    @Column(name = "note")
    private String note;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum TicketType {
        CIVIL, ADMINISTRATIVE, OTHER
    }
    
    public enum TicketMethod {
        SELF_TEST, AT_FACILITY
    }
    
    public enum TicketStatus {
        PENDING, IN_PROGRESS, COMPLETED
    }
} 