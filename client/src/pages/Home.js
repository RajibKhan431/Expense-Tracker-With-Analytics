import { useEffect, useState } from "react";
import { Container, Grid,Typography } from "@mui/material";
import Cookies from "js-cookie";

import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import TransactionChart from "../components/TransactionChart";
import CategoryChart from "../components/CategoryChart";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [editTransaction, setEditTransaction] = useState({});

  // ✅ SAFE DEFAULTS
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
  fetchTransactions();
  fetchCategorySummary();
}, []);


  async function fetchTransactions() {
    const token = Cookies.get("token");
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/transaction`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const { data } = await res.json();
    setTransactions(data || []);
  }

  async function fetchCategorySummary() {
  const token = Cookies.get("token");

  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/transaction/category-summary`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const { data } = await res.json();
  setCategorySummary(data || []);
}


  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TransactionForm
            fetchTransactions={fetchTransactions}
            fetchCategorySummary={fetchCategorySummary}
            editTransaction={editTransaction}
            setEditTransaction={setEditTransaction}
          />
        </Grid>

        <Grid item xs={12} md={6}>
  <Typography variant="h6" sx={{ mb: 1 }}>
  Here is your monthly expenses  
  </Typography>
  <TransactionChart data={transactions} />
</Grid>
<Grid item xs={12} md={6}>
  <Typography variant="h6" sx={{ mb: 1 }}>
    Category Based Expenses(Where you spend more)
  </Typography>
  <CategoryChart data={categorySummary} />
</Grid>

        <Grid item xs={12}>
          <TransactionList
            data={transactions}
            fetchTransactions={fetchTransactions}
            setEditTransaction={setEditTransaction}
            editTransaction={editTransaction}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
