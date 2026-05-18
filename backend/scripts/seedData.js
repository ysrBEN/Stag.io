const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Offer = require("../models/Offer");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 MongoDB Connected for seeding realistic Algerian data...");

    // 1️⃣ Clear existing data (except admin)
    console.log("🧹 Clearing existing Users (non-admin), Students, Companies, and Offers...");
    await User.deleteMany({ role: { $ne: "admin" } });
    await Student.deleteMany({});
    await Company.deleteMany({});
    await Offer.deleteMany({});
    console.log("✅ Old data cleared.");

    const companyPasswordPlain = "Company@123";
    const studentPasswordPlain = "Student@123";

    const hashedCompanyPassword = await bcrypt.hash(companyPasswordPlain, 10);
    const hashedStudentPassword = await bcrypt.hash(studentPasswordPlain, 10);

    const summaryTable = [];

    // 2️⃣ SEED COMPANIES
    console.log("🏢 Seeding 5 Algerian Companies...");
    const companiesData = [
      {
        name: "Sonatrach Digital",
        email: "contact@sonatrach.dz",
        wilaya: "Alger",
        industry: "Pétrole & Énergie",
        website: "sonatrach.dz",
        description: "Filiale technologique de la compagnie pétrolière nationale Sonatrach, dédiée à la transformation digitale et l'innovation dans le secteur énergétique algérien.",
        offers: [
          {
            title: "Développement d'un Dashboard de Suivi de Production de Pétrole (PFE)",
            description: "Conception et développement d'une application web de supervision en temps réel des puits de pétrole à l'aide de React et Node.js.",
            duration: "6 mois",
            type: "PFE",
            startDate: new Date("2025-09-01"),
            endDate: new Date("2026-03-01"),
            workMode: "on-site",
            technologies: ["React", "Node.js", "MongoDB", "SQL", "Git"]
          },
          {
            title: "Mise en place d'une infrastructure Cloud pour l'analyse sismique",
            description: "Déploiement d'une solution cloud automatisée avec Docker et Kubernetes pour traiter les données sismiques de Sonatrach.",
            duration: "3 mois",
            type: "Stage d'été",
            startDate: new Date("2025-06-15"),
            endDate: new Date("2025-09-15"),
            workMode: "hybrid",
            technologies: ["Docker", "Python", "Kubernetes", "Linux"]
          },
          {
            title: "Automatisation des processus internes avec Python (PFA)",
            description: "Création de scripts d'automatisation et d'ETL pour le département finance de Sonatrach Digital.",
            duration: "2 mois",
            type: "PFA",
            startDate: new Date("2025-10-01"),
            endDate: new Date("2025-12-01"),
            workMode: "remote",
            technologies: ["Python", "SQL", "Git"]
          }
        ]
      },
      {
        name: "Djezzy",
        email: "contact@djezzy.dz",
        wilaya: "Alger",
        industry: "Télécommunications",
        website: "djezzy.dz",
        description: "Leader des télécommunications en Algérie, engagé dans la modernisation du réseau mobile et le développement de services digitaux innovants.",
        offers: [
          {
            title: "Développement de l'application mobile Djezzy App (PFE)",
            description: "Refonte de l'interface utilisateur et intégration de nouvelles fonctionnalités de paiement sur l'application mobile Djezzy en Flutter.",
            duration: "6 mois",
            type: "PFE",
            startDate: new Date("2025-09-01"),
            endDate: new Date("2026-03-01"),
            workMode: "hybrid",
            technologies: ["Flutter", "Dart", "Firebase", "Git"]
          },
          {
            title: "Optimisation de la base de données clients avec MongoDB",
            description: "Analyse et restructuration des bases de données NoSQL pour accélérer les requêtes du service client Djezzy.",
            duration: "3 mois",
            type: "Stage d'été",
            startDate: new Date("2025-07-01"),
            endDate: new Date("2025-10-01"),
            workMode: "on-site",
            technologies: ["MongoDB", "Node.js", "Express", "TypeScript"]
          },
          {
            title: "Création d'un portail web pour les revendeurs Djezzy (PFA)",
            description: "Développement d'une plateforme web moderne et sécurisée pour gérer les stocks des revendeurs agréés.",
            duration: "2 mois",
            type: "PFA",
            startDate: new Date("2025-11-01"),
            endDate: new Date("2026-01-01"),
            workMode: "remote",
            technologies: ["React", "TypeScript", "TailwindCSS"]
          }
        ]
      },
      {
        name: "Ooredoo Algérie",
        email: "contact@ooredoo.dz",
        wilaya: "Alger",
        industry: "Télécommunications",
        website: "ooredoo.dz",
        description: "Opérateur de télécommunications dynamique offrant des solutions mobiles haut débit et des services à valeur ajoutée aux particuliers et entreprises.",
        offers: [
          {
            title: "Ingénieur Machine Learning pour la prédiction du Churn (PFE)",
            description: "Conception d'un modèle d'intelligence artificielle pour prédire le désabonnement des clients Ooredoo et proposer des offres adaptées.",
            duration: "6 mois",
            type: "PFE",
            startDate: new Date("2025-10-01"),
            endDate: new Date("2026-04-01"),
            workMode: "hybrid",
            technologies: ["Python", "Scikit-Learn", "Pandas", "SQL"]
          },
          {
            title: "Développement d'un Chatbot IA pour le support client",
            description: "Mise en place d'un assistant virtuel intelligent basé sur les LLMs pour assister les clients Ooredoo 24/7.",
            duration: "3 mois",
            type: "Stage d'été",
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-09-01"),
            workMode: "remote",
            technologies: ["Python", "FastAPI", "LangChain", "Docker"]
          },
          {
            title: "Refonte du système de facturation interne en Java Spring Boot",
            description: "Participation au développement des microservices de facturation avec une architecture haute disponibilité.",
            duration: "3 mois",
            type: "PFA",
            startDate: new Date("2025-09-15"),
            endDate: new Date("2025-12-15"),
            workMode: "on-site",
            technologies: ["Java", "Spring Boot", "SQL", "Git"]
          }
        ]
      },
      {
        name: "Condor Electronics",
        email: "contact@condor.dz",
        wilaya: "Bordj Bou Arréridj",
        industry: "Électronique & Tech",
        website: "condor.dz",
        description: "Géant algérien de l'électronique, de l'électroménager et du multimédia, pionnier dans l'intégration des technologies IoT et Smart Home.",
        offers: [
          {
            title: "Développement d'une interface IoT pour Smart TV Condor (PFE)",
            description: "Création d'une application embarquée sous Android TV pour contrôler les appareils électroménagers intelligents de Condor.",
            duration: "6 mois",
            type: "PFE",
            startDate: new Date("2025-09-01"),
            endDate: new Date("2026-03-01"),
            workMode: "on-site",
            technologies: ["Java", "Android", "IoT", "C++"]
          },
          {
            title: "Mise en place d'un ERP interne en Django et Vue.js",
            description: "Développement des modules de gestion de stock et logistique pour les usines de Condor Electronics.",
            duration: "3 mois",
            type: "Stage d'été",
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-09-01"),
            workMode: "hybrid",
            technologies: ["Python", "Django", "Vue.js", "SQL"]
          },
          {
            title: "Conception d'un site e-commerce B2B pour Condor",
            description: "Réalisation d'une plateforme de commande en ligne pour les distributeurs officiels de Condor.",
            duration: "2 mois",
            type: "PFA",
            startDate: new Date("2025-10-15"),
            endDate: new Date("2025-12-15"),
            workMode: "remote",
            technologies: ["React", "Node.js", "MongoDB"]
          }
        ]
      },
      {
        name: "Cevital Group",
        email: "contact@cevital.com",
        wilaya: "Béjaïa",
        industry: "Agroalimentaire & Industrie",
        website: "cevital.com",
        description: "Premier groupe privé algérien opérant dans l'agroalimentaire, la grande distribution et l'industrie lourde avec une forte orientation vers l'export.",
        offers: [
          {
            title: "Automatisation de la chaîne logistique avec Node.js et React (PFE)",
            description: "Développement d'un système de traçabilité des produits agroalimentaires depuis le port de Béjaïa jusqu'aux distributeurs.",
            duration: "6 mois",
            type: "PFE",
            startDate: new Date("2025-09-01"),
            endDate: new Date("2026-03-01"),
            workMode: "on-site",
            technologies: ["React", "Node.js", "Express", "MongoDB", "Docker"]
          },
          {
            title: "Analyse de données de production industrielle avec Python",
            description: "Création de tableaux de bord interactifs pour monitorer le rendement des raffineries de sucre Cevital.",
            duration: "3 mois",
            type: "Stage d'été",
            startDate: new Date("2025-07-01"),
            endDate: new Date("2025-10-01"),
            workMode: "hybrid",
            technologies: ["Python", "Pandas", "SQL", "PowerBI"]
          },
          {
            title: "Développement d'une application de gestion des RH (PFA)",
            description: "Mise en place d'un portail interne pour la gestion des congés et des formations des employés du groupe.",
            duration: "2 mois",
            type: "PFA",
            startDate: new Date("2025-11-01"),
            endDate: new Date("2026-01-01"),
            workMode: "remote",
            technologies: ["Laravel", "PHP", "Vue.js", "SQL"]
          }
        ]
      }
    ];

    for (const compData of companiesData) {
      // Create User
      const compUser = await User.create({
        email: compData.email,
        password: hashedCompanyPassword,
        role: "company",
        status: "approved",
        authProvider: "local",
        companyName: compData.name,
        description: compData.description,
        wilaya: compData.wilaya,
        industry: compData.industry,
        websiteUrl: compData.website
      });

      // Create Company Document
      const companyDoc = await Company.create({
        user: compUser._id,
        name: compData.name,
        description: compData.description,
        location: compData.wilaya,
        website: compData.website,
        industry: compData.industry
      });

      // Create Offers
      for (const offerData of compData.offers) {
        await Offer.create({
          title: offerData.title,
          description: offerData.description,
          location: compData.wilaya,
          duration: offerData.duration,
          type: offerData.type,
          startDate: offerData.startDate,
          endDate: offerData.endDate,
          workMode: offerData.workMode,
          technologies: offerData.technologies,
          company: companyDoc._id
        });
      }

      summaryTable.push({
        Type: "Company",
        Name: compData.name,
        Email: compData.email,
        Password: companyPasswordPlain,
        Role: "company"
      });
    }
    console.log("✅ 5 Companies and 15 Offers seeded successfully.");

    // 3️⃣ SEED STUDENTS
    console.log("🎓 Seeding 8 Algerian Students...");
    const studentsData = [
      { firstName: "Amira", lastName: "Khelifi", uni: "ESI Alger", wilaya: "Alger", field: "Software Engineering", year: "M1", skills: ["React", "Node.js", "TypeScript", "MongoDB", "Git", "Docker"], bio: "Étudiante passionnée par le développement full-stack et l'architecture logicielle. À la recherche d'un stage stimulant." },
      { firstName: "Youcef", lastName: "Bensalem", uni: "USTHB", wilaya: "Alger", field: "Informatique", year: "L3", skills: ["Python", "Java", "C++", "SQL", "Linux"], bio: "Développeur backend curieux, spécialisé en algorithmique et bases de données. Motivé pour apprendre de nouvelles technologies." },
      { firstName: "Lyna", lastName: "Hadjadj", uni: "Université Constantine 2", wilaya: "Constantine", field: "Génie Logiciel", year: "M2", skills: ["Java", "Spring Boot", "Angular", "SQL", "Docker", "Git"], bio: "Future ingénieure en génie logiciel avec une forte appétence pour l'écosystème Java Spring et le DevOps." },
      { firstName: "Rami", lastName: "Boudiaf", uni: "Université Oran 1", wilaya: "Oran", field: "Réseaux & Télécoms", year: "L3", skills: ["Python", "Linux", "Cisco", "Docker", "Bash"], bio: "Passionné par l'administration système, le cloud et la cybersécurité. Actif dans les clubs scientifiques universitaires." },
      { firstName: "Sonia", lastName: "Mebarki", uni: "ENP Alger", wilaya: "Alger", field: "Électronique", year: "M1", skills: ["C", "C++", "Python", "Matlab", "IoT"], bio: "Étudiante à l'École Nationale Polytechnique spécialisée dans les systèmes embarqués et l'Internet des Objets (IoT)." },
      { firstName: "Khalil", lastName: "Zerrouki", uni: "Université Tizi Ouzou", wilaya: "Tizi Ouzou", field: "Informatique", year: "M2", skills: ["React", "Node.js", "Express", "MongoDB", "TailwindCSS"], bio: "Développeur web moderne orienté écosystème MERN. J'aime créer des interfaces fluides et performantes." },
      { firstName: "Nassim", lastName: "Djabri", uni: "Université Annaba", wilaya: "Annaba", field: "Systèmes Informatiques", year: "L3", skills: ["PHP", "Laravel", "Vue.js", "SQL", "Git"], bio: "Développeur web full-stack Laravel/Vue.js. J'ai déjà réalisé plusieurs projets académiques et freelances." },
      { firstName: "Meriem", lastName: "Bouzid", uni: "Université Sétif 1", wilaya: "Sétif", field: "Génie Logiciel", year: "M1", skills: ["Python", "Django", "React", "SQL", "Git"], bio: "Fascinée par l'intelligence artificielle et le développement d'APIs robustes en Django. Toujours en quête de nouveaux challenges." }
    ];

    for (const studData of studentsData) {
      const email = `${studData.firstName.toLowerCase()}.${studData.lastName.toLowerCase()}@etud.dz`;
      const fullName = `${studData.firstName} ${studData.lastName}`;
      const githubUrl = `github.com/${studData.firstName.toLowerCase()}-${studData.lastName.toLowerCase()}`;
      const portfolioUrl = `https://${studData.firstName.toLowerCase()}${studData.lastName.toLowerCase()}.dev`;

      // Create User
      const studUser = await User.create({
        email: email,
        password: hashedStudentPassword,
        role: "student",
        status: "approved",
        authProvider: "local",
        name: fullName,
        university: studData.uni,
        wilaya: studData.wilaya,
        fieldOfStudy: studData.field,
        academicYear: studData.year,
        skills: studData.skills,
        githubUrl: githubUrl,
        portfolioUrl: portfolioUrl,
        bio: studData.bio
      });

      // Create Student Document
      await Student.create({
        user: studUser._id,
        firstName: studData.firstName,
        lastName: studData.lastName,
        skills: studData.skills,
        github: githubUrl,
        university: studData.uni,
        fieldOfStudy: studData.field,
        academicYear: studData.year,
        portfolio: portfolioUrl,
        bio: studData.bio
      });

      summaryTable.push({
        Type: "Student",
        Name: fullName,
        Email: email,
        Password: studentPasswordPlain,
        Role: "student"
      });
    }
    console.log("✅ 8 Students seeded successfully.");

    console.log("\n=========================================================================");
    console.log("🎉 SEEDING SUMMARY TABLE (CREDENTIALS)");
    console.log("=========================================================================");
    console.table(summaryTable);
    console.log("=========================================================================\n");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
