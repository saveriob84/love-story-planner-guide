
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Guest } from "@/types/guest";

interface Table {
  id: string;
  name: string;
  capacity: number;
  guests: Guest[];
}

export const downloadTableArrangement = (tables: Table[]) => {
  const doc = new jsPDF();
  
  // Add header/title
  doc.setFont("serif", "bold");
  doc.setFontSize(20);
  doc.text("Disposizione dei Tavoli", 105, 20, { align: "center" });
  
  doc.setFont("serif", "normal");
  doc.setFontSize(12);
  doc.text("Piano dei posti a sedere per il matrimonio", 105, 30, { align: "center" });
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 105, 38, { align: "center" });
  
  // Add Summary
  doc.setFont("serif", "bold");
  doc.setFontSize(14);
  doc.text("Riepilogo", 14, 50);
  
  doc.setFont("serif", "normal");
  doc.setFontSize(11);
  
  const totalGuests = tables.reduce((sum, table) => sum + table.guests.length, 0);
  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
  
  doc.text(`Numero totale di tavoli: ${tables.length}`, 14, 60);
  doc.text(`Totale ospiti assegnati: ${totalGuests}`, 14, 68);
  doc.text(`Totale posti disponibili: ${totalCapacity}`, 14, 76);
  
  // Add table of arrangements
  autoTable(doc, {
    startY: 85,
    head: [["Tavolo", "Capacità", "Ospiti", "Note"]],
    body: tables.map(table => [
      table.name,
      `${table.guests.length}/${table.capacity}`,
      table.guests.map(guest => guest.name).join(", "),
      table.guests.length === table.capacity ? "Completo" : `${table.capacity - table.guests.length} posti liberi`
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [212, 175, 55] as [number, number, number], // wedding-gold color
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [247, 205, 213, 0.1] as [number, number, number, number], // wedding-blush with transparency
    },
  });
  
  // Add details table for each table
  let currentY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFont("serif", "bold");
  doc.setFontSize(14);
  doc.text("Dettaglio Tavoli", 14, currentY);
  currentY += 10;
  
  tables.forEach((table, index) => {
    // Check if we need to add a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont("serif", "bold");
    doc.setFontSize(12);
    doc.text(`${table.name} (${table.guests.length}/${table.capacity} ospiti)`, 14, currentY);
    currentY += 8;
    
    if (table.guests.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["Nome Ospite", "Gruppo", "Dieta"]],
        body: table.guests.map(guest => [
          guest.name,
          guest.groupMembers.length > 0 ? `+${guest.groupMembers.length}` : "-",
          guest.dietaryRestrictions || "-"
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [247, 205, 213] as [number, number, number], // wedding-blush color
          textColor: [0, 0, 0] as [number, number, number],
          fontStyle: "bold",
        },
        margin: { left: 14 },
        tableWidth: 180,
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFont("serif", "italic");
      doc.setFontSize(10);
      doc.text("Nessun ospite assegnato a questo tavolo", 14, currentY);
      currentY += 15;
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Pagina ${i} di ${pageCount}`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: "center" }
    );
  }
  
  // Save the PDF
  doc.save("disposizione-tavoli.pdf");
};
