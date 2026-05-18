// ============================================================
// constants.dart - App-wide constants for Stag.io mobile
// ============================================================

class AppConstants {
  // 🔌 API Base URL
  // Android emulator → use 10.0.2.2 to reach localhost on host machine
  // Real device on same WiFi → replace with your PC's local IP e.g. http://192.168.1.x:5000
  static const String baseUrl = 'http://192.168.1.7:5000/api';

  // JWT Token storage key
  static const String tokenKey = 'jwt_token';
  static const String userRoleKey = 'user_role';
  static const String userIdKey = 'user_id';
  static const String userNameKey = 'user_name';
  static const String userEmailKey = 'user_email';

  static const List<String> algerianWilayas = [
    "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Béjaïa", "Sétif",
    "Sidi Bel Abbès", "Biskra", "Béchar", "Tlemcen", "Tiaret", "Tizi Ouzou", "Djelfa",
    "Jijel", "Saïda", "Skikda", "Guelma", "Médéa", "Mostaganem", "M'Sila", "Mascara",
    "Ouargla", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf",
    "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila",
    "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Adrar", "Chlef",
    "Laghouat", "Oum El Bouaghi", "Tamanrasset", "Tébessa", "Timimoun", "Bordj Badji Mokhtar",
    "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet",
    "El M'Ghair", "El Meniaa"
  ];

  static const List<String> industries = [
    "Technology", "Oil & Gas", "Finance", "Healthcare", "Education",
    "Telecom", "Agriculture", "Construction", "Transport & Logistics",
    "Manufacturing", "Retail", "Media & Entertainment", "Other"
  ];
}
