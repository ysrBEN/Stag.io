import jsPDF from 'jspdf';

export const generateConvention = (data) => {
    const doc = new jsPDF();
    const { student, company, offer, validatedAt } = data;

    // Header
    doc.setFontSize(11);
    doc.text("République Algérienne Démocratique et Populaire", 105, 15, { align: 'center' });
    doc.text("Ministère de l'Enseignement Supérieur et de la Recherche Scientifique", 105, 22, { align: 'center' });
    doc.text(student.university || "Université", 105, 29, { align: 'center' });

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("CONVENTION DE STAGE", 105, 50, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);

    // Article 1
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Article 1 — Les Parties", 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Étudiant(e): ${student.name}`, 25, 75);
    doc.text(`Filière: ${student.fieldOfStudy || 'N/A'} — Année: ${student.academicYear || 'N/A'}`, 25, 82);
    doc.text(`Entreprise: ${company.name}`, 25, 92);
    doc.text(`Wilaya: ${company.wilaya || 'N/A'}`, 25, 99);

    // Article 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("Article 2 — Objet du Stage", 20, 115);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Poste: ${offer.title}`, 25, 125);
    doc.text(`Type: ${offer.type || 'N/A'} — Durée: ${offer.duration || 'N/A'}`, 25, 132);

    // Article 3
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("Article 3 — Période", 20, 148);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Date de validation: ${validatedAt ? new Date(validatedAt).toLocaleDateString('fr-DZ') : 'N/A'}`, 25, 158);

    // Article 4
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("Article 4 — Obligations", 20, 174);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const obligations = "L'étudiant s'engage à respecter le règlement intérieur de l'entreprise et à réaliser les missions confiées. L'entreprise s'engage à encadrer l'étudiant et à lui fournir les moyens nécessaires.";
    const lines = doc.splitTextToSize(obligations, 165);
    doc.text(lines, 25, 184);

    // Signatures
    doc.setFontSize(11);
    doc.text("Fait le: " + new Date().toLocaleDateString('fr-DZ'), 20, 230);
    doc.setFont('helvetica', 'bold');
    doc.text("L'Université", 30, 250);
    doc.text("L'Entreprise", 95, 250);
    doc.text("L'Étudiant(e)", 160, 250);
    doc.setFont('helvetica', 'normal');
    doc.text("Cachet et Signature", 20, 258);
    doc.text("Cachet et Signature", 85, 258);
    doc.text("Cachet et Signature", 150, 258);

    // Save
    doc.save(`Convention_Stage_${student.name.replace(/ /g, '_')}.pdf`);
};
