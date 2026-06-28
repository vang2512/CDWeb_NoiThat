package com.example.demo.dto;

import lombok.Data;

@Data
public class SentimentStatisticDTO {

    private long positive;
    private long neutral;
    private long negative;

    private double positivePercent;
    private double neutralPercent;
    private double negativePercent;

    public SentimentStatisticDTO() {
    }

    public SentimentStatisticDTO(long positive, long neutral, long negative,
                                 double positivePercent,
                                 double neutralPercent,
                                 double negativePercent) {
        this.positive = positive;
        this.neutral = neutral;
        this.negative = negative;
        this.positivePercent = positivePercent;
        this.neutralPercent = neutralPercent;
        this.negativePercent = negativePercent;
    }

    // getter setter
}