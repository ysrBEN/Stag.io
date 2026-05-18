import jsPDF from 'jspdf';

const formatDateSafe = (dateVal) => {
    if (!dateVal) return '................................';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '................................';
    return d.toLocaleDateString('fr-DZ');
};

export const generateConvention = (data) => {
    const doc = new jsPDF();
    const { student = {}, company = {}, offer = {}, validatedAt } = data;

    // --- TITLE ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("CONVENTION DE STAGE", 105, 20, { align: 'center' });
    doc.setFontSize(18);
    doc.text("ENTRE", 105, 30, { align: 'center' });

    // --- LEFT BOX (UNIVERSITÉ) ---
    // x: 15, y: 35, w: 82, h: 52
    doc.setLineWidth(0.5);
    doc.rect(15, 35, 82, 52);
    
    const uniName = student.university || "UNIVERSITE DE CONSTANTINE 2";
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(uniName.toUpperCase(), 56, 42, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text("Abdelhamid Mehri", 56, 47, { align: 'center' });
    doc.setFontSize(8);
    doc.text("Sise Nouvelle ville Ali Mendjeli, Constantine - Algérie", 56, 52, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("Représentée par :", 56, 58, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const repUni = "Monsieur le Vice Recteur chargé des relations extérieures, ci après désignée université";
    doc.text(doc.splitTextToSize(repUni, 78), 17, 64);
    
    doc.setFontSize(8);
    doc.text("Tél/Fax : + 00 213 (0)31 82 45 79", 17, 83);

    // --- CENTER "ET" ---
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("ET", 105, 62, { align: 'center' });

    // --- RIGHT BOX (ENTREPRISE) ---
    // x: 113, y: 35, w: 82, h: 52
    doc.setLineWidth(0.5);
    doc.rect(113, 35, 82, 52);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("L'entreprise (nom et adresse)", 154, 42, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const compNameText = `${company.name || 'Entreprise'} — ${company.wilaya || 'Algérie'}`;
    doc.text(doc.splitTextToSize(compNameText, 78), 154, 48, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text("Représentée par :", 154, 58, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text("Monsieur .....................................................", 115, 66);
    doc.text("...................................................................", 115, 74);
    doc.text("Tél : ............................ Fax : .........................", 115, 83);

    // --- MAIN BOX (DONNÉES ÉTUDIANT) ---
    // x: 15, y: 95, w: 180, h: 115
    doc.setLineWidth(1.0); // Thick border
    doc.rect(15, 95, 180, 115);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("DONNÉES RELATIVES À L'ÉTUDIANT", 105, 105, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(62, 107, 148, 107); // Underline title

    // Fields inside main box
    const startX = 18;
    let currY = 118;
    const lineHeight = 8.5;

    // Nom et prénom
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold'); doc.text("Nom et prénom : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text(student.name || "....................................................", startX + 35, currY);
    currY += lineHeight;

    // Faculté
    doc.setFont('helvetica', 'bold'); doc.text("Faculté : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text("....................................................................................", startX + 22, currY);
    currY += lineHeight;

    // Département
    doc.setFont('helvetica', 'bold'); doc.text("Département : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text(student.fieldOfStudy || "........................................................................", startX + 30, currY);
    currY += lineHeight;

    // Carte d'étudiant & N° Sécurité Sociale
    doc.setFont('helvetica', 'bold'); doc.text("Carte d'étudiant n° : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text("............................", startX + 42, currY);
    
    doc.setFont('helvetica', 'bold'); doc.text("N° Sécurité Sociale : ", 110, currY);
    doc.setFont('helvetica', 'normal'); doc.text("............................", 152, currY);
    currY += lineHeight;

    // Tél
    doc.setFont('helvetica', 'bold'); doc.text("Tél : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text("........................................................................................", startX + 12, currY);
    currY += lineHeight;

    // Diplôme préparé
    doc.setFont('helvetica', 'bold'); doc.text("Diplôme préparé : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text(student.academicYear ? `Master / Licence (${student.academicYear})` : "Master / Licence ....................................", startX + 38, currY);
    currY += lineHeight;

    // Thème du stage
    doc.setFont('helvetica', 'bold'); doc.text("Thème du stage : ", startX, currY);
    doc.setFont('helvetica', 'normal'); 
    const themeText = offer.title || "....................................................................................";
    doc.text(doc.splitTextToSize(themeText, 130), startX + 36, currY);
    currY += lineHeight + 3; // extra space in case of wrap

    // Responsable pédagogique
    doc.setFont('helvetica', 'bold'); doc.text("Responsable pédagogique : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text("........................................................................", startX + 56, currY);
    currY += lineHeight;

    // Durée du stage
    doc.setFont('helvetica', 'bold'); doc.text("Durée du stage : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text(offer.duration || "............................", startX + 34, currY);
    currY += lineHeight + 2;

    // Date début & fin
    doc.setFont('helvetica', 'bold'); doc.text("Date de début du stage : ", startX, currY);
    doc.setFont('helvetica', 'normal'); doc.text(formatDateSafe(offer.startDate), startX + 48, currY);

    doc.setFont('helvetica', 'bold'); doc.text("Date de fin du stage : ", 110, currY);
    doc.setFont('helvetica', 'normal'); doc.text(formatDateSafe(offer.endDate), 152, currY);

    // --- FOOTER ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("Etablie en 02 exemplaires originaux : 1 exemplaire pour l'université et 01 exemplaire pour l'entreprise", 105, 218, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dateStr = validatedAt ? new Date(validatedAt).toLocaleDateString('fr-DZ') : '....................................';
    doc.text(`Fait à Constantine le : ${dateStr}`, 145, 228, { align: 'center' });

    // Visa du chef de département
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("Visa du chef de département :", 20, 242);
    doc.setLineWidth(0.5);
    doc.line(20, 243, 72, 243);

    // Bottom Signatures
    doc.text("Pour l'entreprise", 30, 265);
    doc.line(30, 266, 62, 266);

    doc.text("Pour l'université", 145, 265);
    doc.line(145, 266, 177, 266);

    // Save
    doc.save(`Convention_Stage_${(student.name || 'Etudiant').replace(/ /g, '_')}.pdf`);
};
