package com.kiwoom.sdk.models;

public class Holding {
    private String stockCode;
    private String stockName;
    private int quantity;
    private double averagePrice;
    private double currentPrice;
    private double totalValue;
    private double profitLoss;
    private double profitLossRatio;

    public String getStockCode() { return stockCode; }
    public void setStockCode(String stockCode) { this.stockCode = stockCode; }

    public String getStockName() { return stockName; }
    public void setStockName(String stockName) { this.stockName = stockName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getAveragePrice() { return averagePrice; }
    public void setAveragePrice(double averagePrice) { this.averagePrice = averagePrice; }

    public double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

    public double getTotalValue() { return totalValue; }
    public void setTotalValue(double totalValue) { this.totalValue = totalValue; }

    public double getProfitLoss() { return profitLoss; }
    public void setProfitLoss(double profitLoss) { this.profitLoss = profitLoss; }

    public double getProfitLossRatio() { return profitLossRatio; }
    public void setProfitLossRatio(double profitLossRatio) { this.profitLossRatio = profitLossRatio; }
}
