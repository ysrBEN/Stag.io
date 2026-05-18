// ============================================================
// user_model.dart
// ============================================================

class UserModel {
  final String? id;
  final String? email;
  final String? role;
  final String? status;
  final String? name;
  final String? companyName;
  final String? university;
  final String? fieldOfStudy;
  final String? academicYear;
  final List<String> skills;
  final String? githubUrl;
  final String? portfolioUrl;
  final String? bio;
  final String? wilaya;
  final String? industry;
  final String? websiteUrl;
  final String? description;
  final String? profilePicture;

  UserModel({
    this.id,
    this.email,
    this.role,
    this.status,
    this.name,
    this.companyName,
    this.university,
    this.fieldOfStudy,
    this.academicYear,
    this.skills = const [],
    this.githubUrl,
    this.portfolioUrl,
    this.bio,
    this.wilaya,
    this.industry,
    this.websiteUrl,
    this.description,
    this.profilePicture,
  });

  String get displayName =>
      name ?? companyName ?? email ?? 'User';

  List<String> get techStacks => skills;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'],
      email: json['email'],
      role: json['role'],
      status: json['status'],
      name: json['name'],
      companyName: json['companyName'],
      university: json['university'],
      fieldOfStudy: json['fieldOfStudy'],
      academicYear: json['academicYear'],
      skills: List<String>.from(json['skills'] ?? []),
      githubUrl: json['githubUrl'],
      portfolioUrl: json['portfolioUrl'],
      bio: json['bio'],
      wilaya: json['wilaya'],
      industry: json['industry'],
      websiteUrl: json['websiteUrl'],
      description: json['description'],
      profilePicture: json['profilePicture'],
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'university': university,
    'fieldOfStudy': fieldOfStudy,
    'academicYear': academicYear,
    'skills': skills,
    'githubUrl': githubUrl,
    'portfolioUrl': portfolioUrl,
    'bio': bio,
    'wilaya': wilaya,
    'companyName': companyName,
    'industry': industry,
    'websiteUrl': websiteUrl,
    'description': description,
  };
}
