package com.ProjectADN.dto;

import com.ProjectADN.entity.Ticket.TicketMethod;
import com.ProjectADN.entity.Ticket.TicketStatus;
import com.ProjectADN.entity.Ticket.TicketType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TicketRequest {
    private TicketType type;
    private TicketMethod method;
    private String reason;
    private String address;
    private String phone;
    private String email;
    private LocalDate appointmentDate;
    private String sample1Name;
    private String sample2Name;
    private Long customerId;
    private Double amount;
    private TicketStatus status;
} 