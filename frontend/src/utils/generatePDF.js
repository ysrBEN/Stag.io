import jsPDF from 'jspdf';

/**
 * Generates a "Convention de Stage" PDF document.
 * @param {Object} data - convention data
 */
export const generateConvention = (data) => {
    const {
        universityName = 'Université des Sciences et de la Technologie Houari Boumediene (USTHB)',
        departmentHead = 'Le Directeur',
        studentName = 'Étudiant(e)',
        studentField = 'Informatique',
        studentYear = 'M2',
        companyName = 'Entreprise',
        companyWilaya = '',
        companyWebsite = '',
        offerTitle = 'Stage',
        offerDescription = '',
        offerType = 'PFE',
        offerDuration = '6 mois',
        startDate = '',
        endDate = '',
    } = data;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const section = (title) => {
        y += 6;
        doc.setFillColor(13, 148, 136); // teal-600
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 3, y + 5);
        doc.setTextColor(30, 30, 30);
        y += 12;
    };

    const body = (text, indent = 0) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        doc.text(lines, margin + indent, y);
        y += lines.length * 5.5 + 2;
    };

    const bold = (text, indent = 0) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(20, 20, 20);
        doc.text(text, margin + indent, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
    };

    // ── Header ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('République Algérienne Démocratique et Populaire', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('Ministère de l\'Enseignement Supérieur et de la Recherche Scientifique', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setTextColor(13, 148, 136);
    doc.text(universityName, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Divider
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(13, 148, 136);
    doc.text('CONVENTION DE STAGE', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Type : ${offerType}`, pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setTextColor(30, 30, 30);

    // ── Article 1 ──
    section('Article 1 — Les Parties');

    bold('L\'Université :');
    body(`Nom : ${universityName}`, 4);
    body(`Représentée par : ${departmentHead}`, 4);

    bold('L\'Entreprise :');
    body(`Nom : ${companyName}`, 4);
    if (companyWilaya) body(`Wilaya : ${companyWilaya}`, 4);
    if (companyWebsite) body(`Site web : ${companyWebsite}`, 4);

    bold('L\'Étudiant(e) :');
    body(`Nom complet : ${studentName}`, 4);
    body(`Filière : ${studentField}`, 4);
    body(`Niveau académique : ${studentYear}`, 4);

    // ── Article 2 ──
    section('Article 2 — Objet du Stage');
    bold(`Intitulé du poste : ${offerTitle}`);
    if (offerDescription) body(offerDescription);
    body(`Type de stage : ${offerType}`);
    body(`Durée du stage : ${offerDuration}`);

    // ── Article 3 ──
    section('Article 3 — Période du Stage');
    body(`Date de début : ${startDate || '_______________'}`, 4);
    body(`Date de fin    : ${endDate || '_______________'}`, 4);

    // ── Article 4 ──
    section('Article 4 — Obligations des Parties');
    body(
        'L\'étudiant(e) s\'engage à respecter le règlement intérieur de l\'entreprise, à accomplir les tâches qui lui seront confiées avec sérieux et professionnalisme, et à rédiger un rapport de stage à la fin de la période.\n\n' +
        'L\'entreprise s\'engage à accueillir l\'étudiant(e) dans de bonnes conditions, à lui désigner un maître de stage, et à fournir les moyens nécessaires à la réalisation du stage.',
        4
    );

    // ── Signatures ──
    y += 10;
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const today = new Date().toLocaleDateString('fr-DZ');
    doc.text(`Fait le : ${today}`, margin, y);
    y += 10;

    const sigY = y;
    const col1 = margin;
    const col2 = pageWidth / 2 - 20;
    const col3 = pageWidth - margin - 45;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('L\'Université', col1, sigY);
    doc.text('L\'Entreprise', col2, sigY);
    doc.text('L\'Étudiant(e)', col3, sigY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const sigSub = sigY + 5;
    doc.text('Cachet et Signature', col1, sigSub);
    doc.text('Cachet et Signature', col2, sigSub);
    doc.text('Cachet et Signature', col3, sigSub);

    // Signature lines
    const lineY = sigSub + 18;
    [[col1, col1 + 45], [col2, col2 + 45], [col3, col3 + 45]].forEach(([x1, x2]) => {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.4);
        doc.line(x1, lineY, x2, lineY);
    });

    const filename = `Convention_Stage_${studentName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
};
