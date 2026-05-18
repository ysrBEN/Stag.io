// ============================================================
// offer_model.dart - Updated with PFE type and work mode
// ============================================================

class OfferModel {
  final String id;
  final String title;
  final String description;
  final String? domain;
  final String? type;
  final String? workMode;
  final String? duration;
  final String? location;
  final String? startDate;
  final String? endDate;
  final List<String> technologies;
  final dynamic company; // Can be populated object or ID

  OfferModel({
    required this.id,
    required this.title,
    required this.description,
    this.domain,
    this.type,
    this.workMode,
    this.duration,
    this.location,
    this.startDate,
    this.endDate,
    this.technologies = const [],
    this.company,
  });

  // Backward compatibility alias for 'skills'
  List<String> get skills => technologies;

  // Helper to extract company name
  String get companyName {
    if (company is Map) {
      return company['companyName'] ?? company['name'] ?? 'Unknown Company';
    }
    return 'Unknown Company';
  }

  factory OfferModel.fromJson(Map<String, dynamic> json) {
    var techList = json['technologies'] ?? json['skills'] ?? [];
    return OfferModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? 'Untitled',
      description: json['description'] ?? '',
      domain: json['domain'] ?? json['type'] ?? 'PFE',
      type: json['type'] ?? json['domain'] ?? 'PFE',
      workMode: json['workMode'] ?? 'on-site',
      duration: json['duration'],
      location: json['location'] ?? json['wilaya'],
      startDate: json['startDate'],
      endDate: json['endDate'],
      technologies: List<String>.from(techList),
      company: json['company'],
    );
  }
}
