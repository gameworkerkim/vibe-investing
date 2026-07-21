package com.kiwoom.sdk.models;

import java.util.Objects;

public class AccountInfo {
    private String accountNumber;
    private String accountName;
    private double balance;
    private double deposit;
    private double totalValue;
    private double profitLoss;
    private double profitLossRatio;
    private String currency;

    public AccountInfo() {}

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }

    public double getDeposit() { return deposit; }
    public void setDeposit(double deposit) { this.deposit = deposit; }

    public double getTotalValue() { return totalValue; }
    public void setTotalValue(double totalValue) { this.totalValue = totalValue; }

    public double getProfitLoss() { return profitLoss; }
    public void setProfitLoss(double profitLoss) { this.profitLoss = profitLoss; }

    public double getProfitLossRatio() { return profitLossRatio; }
    public void setProfitLossRatio(double profitLossRatio) { this.profitLossRatio = profitLossRatio; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    @Override
    public String toString() {
        return String.format("AccountInfo{no=%s, name=%s, deposit=%.0f, currency=%s}",
                accountNumber, accountName, deposit, currency);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AccountInfo)) return false;
        AccountInfo that = (AccountInfo) o;
        return Objects.equals(accountNumber, that.accountNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accountNumber);
    }
}
