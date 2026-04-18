const PDFDocument = require("pdfkit");
const ExpenseModel = require("../Models/expenses.models");

const generateReport = async (req, res) => {
  try {
    const records = await ExpenseModel.find({ userID: req.user.id }).sort({
      Date: -1,
    });

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No records found",
      });
    }

    const totals = records.reduce(
      (acc, r) => {
        if (r.type === "Income") acc.income += r.amount || 0;
        else acc.expense += r.amount || 0;
        return acc;
      },
      { income: 0, expense: 0 },
    );

    const balance = totals.income - totals.expense;

    const groupedByDate = records.reduce((acc, record) => {
      const dateKey = new Date(record.Date).toLocaleDateString();

      if (!acc[dateKey]) {
        acc[dateKey] = { income: 0, expense: 0, entries: [] };
      }

      if (record.type === "Income") acc[dateKey].income += record.amount;
      else acc[dateKey].expense += record.amount;

      acc[dateKey].entries.push(record);
      return acc;
    }, {});

    const groupedByMonth = records.reduce((acc, record) => {
      const monthKey = new Date(record.Date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expense: 0, count: 0 };
      }

      if (record.type === "Income") acc[monthKey].income += record.amount;
      else acc[monthKey].expense += record.amount;

      acc[monthKey].count += 1;
      return acc;
    }, {});

    const totalDays = Object.keys(groupedByDate).length;

    const firstDate = new Date(records[0].Date).toDateString();
    const lastDate = new Date(records[records.length - 1].Date).toDateString();

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Expense-Report-${Date.now()}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(22).font("Helvetica-Bold").text("Expense Report", {
      align: "center",
    });
    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("#555").text("All Time Summary", {
      align: "center",
    });
    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("#888")
      .text(`${firstDate} — ${lastDate}`, { align: "center" });

    doc.moveDown();

    // Helper
    const drawRow = (label, value) => {
      doc
        .font("Helvetica-Bold")
        .fillColor("#555")
        .text(label, { continued: true });
      doc.font("Helvetica").fillColor("black").text(value);
    };

    doc.fontSize(13).font("Helvetica-Bold").text("Summary");
    doc.moveDown(0.5);

    drawRow("Total Entries: ", records.length);
    doc.moveDown(0.5);

    drawRow("Active Days: ", `${totalDays}`);
    doc.moveDown(0.5);

    drawRow("Total Income: ", `RS.${totals.income.toFixed(2)}`);
    doc.moveDown(0.5);

    drawRow("Total Expense: ", `RS.${totals.expense.toFixed(2)}`);
    doc.moveDown(0.5);

    drawRow("Balance: ", `RS.${balance.toFixed(2)}`);
    doc.moveDown(0.5);

    doc.moveDown();

    doc.fontSize(13).font("Helvetica-Bold").text("Monthly Breakdown");
    doc.moveDown(1);

    const mCol = { month: 50, entries: 200, income: 300, expense: 400 };

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Month", mCol.month);
    doc.text("Entries", mCol.entries, doc.y - 15);
    doc.text("Income", mCol.income, doc.y - 15);
    doc.text("Expense", mCol.expense, doc.y - 15);

    doc.moveDown();

    Object.entries(groupedByMonth).forEach(([month, data], i) => {
      if (doc.y > 700) doc.addPage();

      const rowY = doc.y;

      if (i % 2 === 0) {
        doc
          .rect(50, rowY - 2, 500, 15)
          .fill("#f5f5f5")
          .fillColor("black");
      }

      doc.font("Helvetica").fontSize(10);
      doc.text(month, mCol.month, rowY);
      doc.text(data.count, mCol.entries, rowY);
      doc.text(`RS.${data.income.toFixed(2)}`, mCol.income, rowY);
      doc.text(`RS.${data.expense.toFixed(2)}`, mCol.expense, rowY);

      doc.moveDown();
    });

    doc.moveDown();
    doc.moveDown(0.5);

    doc.fontSize(13).font("Helvetica-Bold").text("All Transactions");
    doc.moveDown(0.5);
    doc.moveDown();
    doc.moveDown(0.5);

    const col = {
      date: 50,
      type: 120,
      category: 190,
      amount: 300,
      account: 380,
    };

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Date", col.date);
    doc.text("Type", col.type, doc.y - 15);
    doc.text("Category", col.category, doc.y - 15);
    doc.text("Amount", col.amount, doc.y - 15);
    doc.text("Account", col.account, doc.y - 15);

    doc.moveDown();
    doc.moveDown();
    doc.moveDown(0.5);

    records.forEach((r, i) => {
      if (doc.y > 700) doc.addPage();

      const rowY = doc.y;

      if (i % 2 === 0) {
        doc
          .rect(50, rowY - 2, 500, 15)
          .fill("#f9f9f9")
          .fillColor("black");
      }

      doc.font("Helvetica").fontSize(10);

      doc.text(new Date(r.Date).toLocaleDateString(), col.date, rowY);
      doc.text(r.type, col.type, rowY);
      doc.text(r.category || "-", col.category, rowY);
      doc.text(`RS.${r.amount}`, col.amount, rowY);
      doc.text(r.account || "-", col.account, rowY);

      doc.moveDown();

      doc.moveDown(0.5);
    });

    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Generated on ${new Date().toLocaleString()}`, {
        align: "center",
      });

    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("Black").text(`Expense Tracker App`, {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
    });
  }
};

module.exports = generateReport;
