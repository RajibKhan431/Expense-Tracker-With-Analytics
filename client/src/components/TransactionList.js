import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button,Select,MenuItem,Stack,} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Typography } from "@mui/material";
import EditSharpIcon from "@mui/icons-material/EditSharp";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import dayjs from "dayjs";
import Cookies from "js-cookie";

export default function TransactionList({
  data,
  fetchTransactions,
  setEditTransaction,
  editTransaction,
}) {
  const token = Cookies.get("token");
  const user = useSelector((state) => state.auth.user);
  const [exportType, setExportType] = useState("csv");


  function getCategoryIcon(id) {
  if (!user) return "";
  const category = user.categories.find(
    (category) => category._id === id
  );
  return category ? category.icon : "";
}

function getCategoryLabel(id) {
  if (!user) return "";
  const category = user.categories.find(
    (category) => category._id === id
  );
  return category ? category.label : "";
}
function exportToCSV() {
  if (!data || data.length === 0) {
    alert("No transactions to export");
    return;
  }

  // ✅ flatten grouped data
  const flatTransactions = data.flatMap(
    (month) => month.transactions || []
  );

  if (flatTransactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  const headers = ["Amount", "Description", "Category", "Date"];

  const rows = flatTransactions.map((row) => {
    const category = user?.categories.find(
      (cat) => cat._id === row.category_id
    );

    return [
      `"${row.amount}"`,
      `"${row.description || ""}"`,
      `"${category ? `${category.icon} ${category.label}` : "N/A"}"`,
      `"${new Date(row.date).toLocaleDateString()}"`,
    ];
  });

  // ✅ UTF-8 BOM added (\uFEFF)
  const csvContent =
    "\uFEFF" +
    headers.map((h) => `"${h}"`).join(",") +
    "\n" +
    rows.map((row) => row.join(",")).join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();
}
function exportToExcel() {
  if (!data || data.length === 0) {
    alert("No transactions to export");
    return;
  }

  // ✅ flatten monthly grouped transactions
  const flatTransactions = data.flatMap(
    (month) => month.transactions || []
  );

  if (flatTransactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  // ✅ prepare rows for Excel
  const excelData = flatTransactions.map((row) => {
    const category = user?.categories.find(
      (cat) => cat._id === row.category_id
    );

    return {
      Amount: row.amount,
      Description: row.description || "",
      Category: category
        ? `${category.icon} ${category.label}`
        : "N/A",
      Date: new Date(row.date).toLocaleDateString(),
    };
  });

  // ✅ create worksheet & workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Transactions"
  );

  // ✅ auto column width
  worksheet["!cols"] = [
    { wch: 10 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
  ];

  // ✅ download Excel file
  XLSX.writeFile(workbook, "transactions.xlsx");
}
function exportToPDF() {
  if (!data || data.length === 0) {
    alert("No transactions to export");
    return;
  }

  const flatTransactions = data.flatMap(
    (month) => month.transactions || []
  );

  if (flatTransactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Expense Transactions Report", 14, 15);

  const tableColumn = [
    "Amount",
    "Description",
    "Category",
    "Date",
  ];

  const tableRows = flatTransactions.map((row) => {
    const category = user?.categories.find(
      (cat) => cat._id === row.category_id
    );

    return [
      row.amount,
      row.description || "",
      category
        ? `${category.icon} ${category.label}`
        : "N/A",
      new Date(row.date).toLocaleDateString(),
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
  });

  doc.save("transactions.pdf");
}


function handleExport() {
  if (exportType === "csv") {
    exportToCSV();
  } else if (exportType === "excel") {
    exportToExcel();
  } else if (exportType === "pdf") {
    exportToPDF();
  }
}
  async function remove(_id) {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/transaction/${_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.ok) {
      fetchTransactions();
    }
  }

  function formatDate(date) {
    return dayjs(date).format("DD.MM.YYYY");
  }

  return (
    <>
      <Typography variant="h6">List of Transactions</Typography>
      <Stack
  direction="row"
  spacing={2}
  alignItems="center"
  sx={{ mb: 3 }}
>
  <Select
    size="small"
    value={exportType}
    onChange={(e) => setExportType(e.target.value)}
    sx={{
      minWidth: 140,
      backgroundColor: "#f9fafb",
      borderRadius: 2,
      fontWeight: 500,
    }}
    startAdornment={<FileDownloadIcon sx={{ mr: 1 }} />}
  >
    <MenuItem value="csv">CSV</MenuItem>
    <MenuItem value="excel">Excel (.xlsx)</MenuItem>
    <MenuItem value="pdf">PDF</MenuItem>
  </Select>

  <Button
    variant="contained"
    startIcon={<DownloadIcon />}
    onClick={handleExport}
    sx={{
      borderRadius: 2,
      textTransform: "none",
      fontWeight: 600,
      px: 3,
      background: "linear-gradient(135deg, #1976d2, #42a5f5)",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      "&:hover": {
        background: "linear-gradient(135deg, #1565c0, #1e88e5)",
      },
    }}
  >
    Export
  </Button>
</Stack>


      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Amount</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">Category Icon</TableCell>
              <TableCell align="center">Category Label</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((month) =>
              month.transactions.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center" component="th" scope="row">
                    {row.amount} €
                  </TableCell>
                  <TableCell align="center">{row.description}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 20 }}>
                   {getCategoryIcon(row.category_id)}
                  </TableCell>
                  <TableCell align="center">
                   {getCategoryLabel(row.category_id)}
                  </TableCell>

                  <TableCell align="center">{formatDate(row.date)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="warning"
                      component="label"
                      onClick={() => setEditTransaction(row)}
                      disabled={editTransaction.amount !== undefined}
                    >
                      <EditSharpIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      component="label"
                      onClick={() => remove(row._id)}
                      disabled={editTransaction.amount !== undefined}
                    >
                      <DeleteSharpIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}