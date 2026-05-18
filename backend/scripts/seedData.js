const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Offer = require('../models/Offer');
const Application = require('../models/Application');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const saltRounds = 10;
        const password = await bcrypt.hash('1234', saltRounds);

        // --- 👨‍🎓 STUDENTS ---
        const studentsData = [
            {
                name: 'Youcef Benzara', email: 'youcef@test.dz', role: 'student', status: 'approved',
                wilaya: 'Alger', university: 'USTHB', fieldOfStudy: 'Computer Science', academicYear: 'L3',
                skills: ['React', 'Node.js', 'MongoDB']
            },
            {
                name: 'Amira Khelifi', email: 'amira@test.dz', role: 'student', status: 'approved',
                wilaya: 'Oran', university: 'ESI', fieldOfStudy: 'Software Engineering', academicYear: 'M1',
                skills: ['Python', 'Django', 'SQL']
            },
            {
                name: 'Bilal Mansouri', email: 'bilal@test.dz', role: 'student', status: 'approved',
                wilaya: 'Constantine', university: 'ENSI Constantine', fieldOfStudy: 'Networks', academicYear: 'L3',
                skills: ['Java', 'Spring Boot', 'MySQL']
            },
            {
                name: 'Sara Boudiaf', email: 'sara@test.dz', role: 'student', status: 'approved',
                wilaya: 'Alger', university: 'USTHB', fieldOfStudy: 'Artificial Intelligence', academicYear: 'M2',
                skills: ['Python', 'TensorFlow', 'FastAPI']
            },
            {
                name: 'Riad Zerrouki', email: 'riad@test.dz', role: 'student', status: 'approved',
                wilaya: 'Tlemcen', university: 'Université Tlemcen', fieldOfStudy: 'Computer Science', academicYear: 'L2',
                skills: ['Laravel', 'PHP', 'MySQL']
            }
        ];

        const createdStudents = [];
        for (const s of studentsData) {
            let user = await User.findOne({ email: s.email });
            if (!user) {
                user = await User.create({ ...s, password });
                const [fName, ...lNameParts] = s.name.split(' ');
                await Student.create({
                    user: user._id,
                    firstName: fName,
                    lastName: lNameParts.join(' '),
                    skills: s.skills,
                    university: s.university,
                    fieldOfStudy: s.fieldOfStudy,
                    academicYear: s.academicYear
                });
                console.log(`Student created: ${s.name}`);
            }
            createdStudents.push({ ...s, _id: (await Student.findOne({ user: user._id }))._id });
        }

        // --- 🏢 COMPANIES ---
        const companiesData = [
            {
                name: 'Djezzy', email: 'djezzy@test.dz', wilaya: 'Alger', industry: 'Télécommunications',
                websiteUrl: 'https://www.djezzy.dz'
            },
            {
                name: 'Condor Electronics', email: 'condor@test.dz', wilaya: 'Bordj Bou Arréridj', industry: 'Électronique',
                websiteUrl: 'https://www.condor.dz'
            },
            {
                name: 'Sonatrach Digital', email: 'sonatrach@test.dz', wilaya: 'Alger', industry: 'Énergie & IT',
                websiteUrl: 'https://www.sonatrach.dz'
            },
            {
                name: 'Cevital Tech', email: 'cevital@test.dz', wilaya: 'Béjaïa', industry: 'Agroalimentaire & IT',
                websiteUrl: 'https://www.cevital.com'
            },
            {
                name: 'NCA Rouiba', email: 'nca@test.dz', wilaya: 'Alger', industry: 'Industrie & IT',
                websiteUrl: 'https://www.nca-rouiba.dz'
            }
        ];

        const createdCompanies = [];
        for (const c of companiesData) {
            let user = await User.findOne({ email: c.email });
            if (!user) {
                user = await User.create({
                    email: c.email,
                    password,
                    role: 'company',
                    status: 'approved',
                    name: c.name,
                    companyName: c.name,
                    wilaya: c.wilaya,
                    industry: c.industry,
                    websiteUrl: c.websiteUrl
                });
                const company = await Company.create({
                    user: user._id,
                    name: c.name,
                    location: c.wilaya,
                    website: c.websiteUrl,
                    industry: c.industry,
                    description: `Leading company in ${c.industry}`
                });
                console.log(`Company created: ${c.name}`);
            }
            createdCompanies.push({ ...c, _id: (await Company.findOne({ user: user._id }))._id });
        }

        // --- 📋 OFFERS ---
        const offersData = [
            { companyName: 'Djezzy', title: "Développeur React.js", type: "PFE", duration: "4 mois", location: "Alger", workMode: "on-site", technologies: ["React", "Node.js", "MongoDB"], description: "Rejoignez notre équipe digitale pour développer des interfaces moderne pour nos applications clients." },
            { companyName: 'Djezzy', title: "Ingénieur Backend Node.js", type: "Summer", duration: "2 mois", location: "Alger", workMode: "hybrid", technologies: ["Node.js", "Express", "MongoDB"], description: "Développement d'APIs RESTful pour nos services mobiles et web." },
            { companyName: 'Condor Electronics', title: "Développeur Mobile Flutter", type: "PFE", duration: "6 mois", location: "Bordj Bou Arréridj", workMode: "on-site", technologies: ["Flutter", "Dart", "Firebase"], description: "Création d'une application mobile pour la gestion des produits électroniques." },
            { companyName: 'Condor Electronics', title: "Data Analyst Python", type: "Summer", duration: "3 mois", location: "Bordj Bou Arréridj", workMode: "remote", technologies: ["Python", "SQL", "Pandas"], description: "Analyse des données de vente et création de tableaux de bord interactifs." },
            { companyName: 'Sonatrach Digital', title: "Développeur Full Stack", type: "PFE", duration: "6 mois", location: "Alger", workMode: "on-site", technologies: ["React", "Node.js", "PostgreSQL", "Docker"], description: "Développement d'une plateforme de gestion interne pour les équipes terrain." },
            { companyName: 'Sonatrach Digital', title: "Ingénieur DevOps", type: "PFE", duration: "4 mois", location: "Alger", workMode: "hybrid", technologies: ["Docker", "Git", "Linux", "Python"], description: "Mise en place de pipelines CI/CD pour nos applications critiques." },
            { companyName: 'Cevital Tech', title: "Développeur Laravel", type: "Summer", duration: "2 mois", location: "Béjaïa", workMode: "on-site", technologies: ["Laravel", "PHP", "MySQL"], description: "Développement de modules ERP pour la gestion de production agroalimentaire." },
            { companyName: 'Cevital Tech', title: "Développeur Vue.js", type: "Part-time", duration: "3 mois", location: "Béjaïa", workMode: "remote", technologies: ["Vue.js", "JavaScript", "REST API"], description: "Création d'interfaces utilisateur pour notre portail fournisseurs en ligne." },
            { companyName: 'NCA Rouiba', title: "Développeur Spring Boot", type: "PFE", duration: "4 mois", location: "Alger", workMode: "on-site", technologies: ["Java", "Spring Boot", "MySQL"], description: "Développement d'un système de gestion de la chaîne logistique." },
            { companyName: 'NCA Rouiba', title: "Ingénieur IA & Machine Learning", type: "PFE", duration: "6 mois", location: "Alger", workMode: "hybrid", technologies: ["Python", "TensorFlow", "FastAPI", "SQL"], description: "Développement de modèles prédictifs pour l'optimisation de la production industrielle." }
        ];

        const createdOffers = [];
        for (const o of offersData) {
            const company = createdCompanies.find(c => c.name === o.companyName);
            let offer = await Offer.findOne({ title: o.title, company: company._id });
            if (!offer) {
                offer = await Offer.create({
                    ...o,
                    company: company._id
                });
                console.log(`Offer created: ${o.title}`);
            }
            createdOffers.push(offer);
        }

        // --- 📁 APPLICATIONS ---
        const appsData = [
            { studentName: 'Youcef Benzara', offerTitle: 'Développeur React.js', status: 'validated' },
            { studentName: 'Amira Khelifi', offerTitle: 'Développeur Full Stack', status: 'validated' },
            { studentName: 'Sara Boudiaf', offerTitle: 'Ingénieur IA & Machine Learning', status: 'accepted' },
            { studentName: 'Bilal Mansouri', offerTitle: 'Développeur Mobile Flutter', status: 'pending' },
            { studentName: 'Riad Zerrouki', offerTitle: 'Développeur Laravel', status: 'pending' }
        ];

        for (const a of appsData) {
            const student = createdStudents.find(s => s.name === a.studentName);
            const offer = createdOffers.find(o => o.title === a.offerTitle);

            let app = await Application.findOne({ student: student._id, offer: offer._id });
            if (!app) {
                await Application.create({
                    student: student._id,
                    offer: offer._id,
                    status: a.status,
                    message: "I am very interested in this position.",
                    phone: "0555000000",
                    cv: "https://example.com/cv.pdf",
                    acceptedAt: a.status === 'accepted' || a.status === 'validated' ? new Date() : null,
                    validatedAt: a.status === 'validated' ? new Date() : null
                });
                console.log(`Application created: ${a.studentName} -> ${a.offerTitle}`);
            }
        }

        console.log(`
==========================================
✅ SEED COMPLETED SUCCESSFULLY!
==========================================
👨🎓 STUDENT ACCOUNTS:
   youcef@test.dz     / 1234  (Alger - React, Node.js, MongoDB)
   amira@test.dz      / 1234  (Oran - Python, Django, SQL)
   bilal@test.dz      / 1234  (Constantine - Java, Spring Boot, MySQL)
   sara@test.dz       / 1234  (Alger - Python, TensorFlow, FastAPI)
   riad@test.dz       / 1234  (Tlemcen - Laravel, PHP, MySQL)

🏢 COMPANY ACCOUNTS:
   djezzy@test.dz     / 1234
   condor@test.dz     / 1234
   sonatrach@test.dz  / 1234
   cevital@test.dz    / 1234
   nca@test.dz        / 1234

📋 APPLICATIONS:
   ✅ Validated: Youcef @ Djezzy
   ✅ Validated: Amira @ Sonatrach Digital
   ✅ Accepted:  Sara @ NCA Rouiba
   ⏳ Pending:   Bilal @ Condor
   ⏳ Pending:   Riad @ Cevital
==========================================
        `);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('SEED ERROR:', err);
        process.exit(1);
    }
};

seedData();
