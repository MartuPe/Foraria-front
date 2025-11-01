// src/components/ExpensesQuickView.tsx
import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CheckoutButton from "../components/CheckoutButton";

type Expense = { id: number; title: string; amount: number; dueDate: string };

export default function ExpensesQuickView() {
  const expenses: Expense[] = [
    { id: 1, title: "Expensa Octubre 2025", amount: 4500, dueDate: "2025-10-30" },
    { id: 2, title: "Expensa Noviembre 2025", amount: 4700, dueDate: "2025-11-30" }
  ];

  return (
    <Box sx={{ display: "grid", gap: 2, maxWidth: 720, margin: "0 auto", padding: 2 }}>
      <Typography variant="h5">Expensas</Typography>

      {expenses.map(e => (
        <Card key={e.id} variant="outlined">
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{e.title}</Typography>
              <Typography variant="body2">Vencimiento: {e.dueDate}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Importe:</strong> ${e.amount}</Typography>
            </div>

            <div>
              <CheckoutButton expenseId={e.id} residenceId={e.id === 1 ? 2 : 2} />
            </div>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
