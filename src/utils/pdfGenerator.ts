
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Guest } from "@/types/guest";

// Funzione per generare il PDF elegante della lista invitati
export const generateGuestPDF = (
  guests: Guest[], 
  stats: {
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalAttending: number;
  }
) => {
  // Creazione del documento PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  
  // Caricamento del font serif (Playfair Display verra simulato usando Times Roman)
  doc.setFont("times", "normal");
  
  // Impostazioni colori
  const primaryColor: [number, number, number] = [24, 48, 91]; // wedding-navy in RGB
  const accentColor: [number, number, number] = [247, 205, 213]; // wedding-blush in RGB
  const textColor: [number, number, number] = [50, 50, 50]; // grigio scuro
  
  // Titolo della pagina
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Lista Invitati – Organizza il tuo Matrimonio", doc.internal.pageSize.width / 2, 20, { align: "center" });
  
  // Sottotitolo
  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Gestisci facilmente tutti i dettagli dei tuoi invitati: partecipazioni, preferenze e conferme.", 
    doc.internal.pageSize.width / 2, 28, { align: "center" });
  
  // Statistiche
  doc.setFillColor(247, 247, 242); // colore avorio chiaro
  doc.roundedRect(14, 35, doc.internal.pageSize.width - 28, 20, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  const statsX = 20;
  const statsY = 45;
  const statsGap = 60;
  
  doc.text(`Totale Invitati: ${stats.totalGuests}`, statsX, statsY);
  doc.text(`Confermati: ${stats.confirmedGuests}`, statsX + statsGap, statsY);
  doc.text(`In Attesa: ${stats.pendingGuests}`, statsX + statsGap * 2, statsY);
  doc.text(`Non Partecipano: ${stats.declinedGuests}`, statsX + statsGap * 3, statsY);
  doc.text(`Totale Partecipanti: ${stats.totalAttending}`, statsX + statsGap * 4, statsY);
  
  // Preparazione dei dati per la tabella
  const tableData = guests.map(guest => {
    // Gestione membri del gruppo
    const groupMembers = guest.groupMembers.map(m => `${m.name}${m.isChild ? ' (bambino)' : ''}`).join('\n');
    
    // Gestione stato RSVP
    let rsvpStatus = '';
    switch(guest.rsvp) {
      case 'confirmed': rsvpStatus = 'Confermato'; break;
      case 'pending': rsvpStatus = 'In attesa'; break;
      case 'declined': rsvpStatus = 'Non partecipa'; break;
    }
    
    // Creazione della riga
    return [
      guest.name,
      `${guest.email || ''}\n${guest.phone || ''}`,
      guest.relationship.replace(/-/g, ' '),
      groupMembers || '-',
      rsvpStatus,
      `${guest.dietaryRestrictions ? 'Dieta: ' + guest.dietaryRestrictions + '\n' : ''}${guest.notes || ''}`
    ];
  });
  
  // Creazione della tabella
  autoTable(doc, {
    head: [['Nome e Cognome', 'Contatti', 'Relazione', 'Membri Gruppo', 'RSVP', 'Note / Esigenze']],
    body: tableData,
    startY: 60,
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 5,
      lineColor: [220, 220, 220] as [number, number, number],
    },
    headStyles: {
      fillColor: [247, 205, 213] as [number, number, number], // wedding-blush in RGB without transparency
      textColor: primaryColor,
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250] as [number, number, number],
    },
    columnStyles: {
      0: { fontStyle: 'bold' }, // Nome guest in grassetto
      3: { cellWidth: 'auto' }, // Membri gruppo
      5: { cellWidth: 'auto' }, // Note
    },
    margin: { top: 60 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const text = `Pagina ${i} di ${pageCount}`;
    doc.text(text, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }
  
  // Aggiunta di decorazione romantica sottile (linea decorativa in alto)
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 32, doc.internal.pageSize.width - 14, 32);
  
  // Salvataggio del file
  doc.save('Lista_Invitati_Matrimonio.pdf');
};
