// ============================================================
// application_model.dart
// ============================================================

class ApplicationModel {
  final String id;
  final String status;
  final dynamic offer;
  final dynamic student;
  final String? createdAt;
  final String? coverLetter;

  ApplicationModel({
    required this.id,
    required this.status,
    this.offer,
    this.student,
    this.createdAt,
    this.coverLetter,
  });

  String get offerTitle {
    if (offer is Map) return offer['title'] ?? 'Unknown Offer';
    return 'Unknown Offer';
  }

  String get companyName {
    if (offer is Map && offer['company'] is Map) {
      return offer['company']['companyName'] ?? 'Unknown Company';
    }
    return 'Unknown Company';
  }

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      id: json['_id'] ?? json['id'] ?? '',
      status: json['status'] ?? 'pending',
      offer: json['offer'],
      student: json['student'],
      createdAt: json['createdAt'],
      coverLetter: json['coverLetter'],
    );
  }
}
