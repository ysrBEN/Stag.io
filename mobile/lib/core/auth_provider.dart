// ============================================================
// auth_provider.dart - Authentication state management
// ============================================================
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'constants.dart';
import 'api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  String? _token;
  String? _role;
  String? _userId;
  String? _name;
  String? _email;
  bool _isLoading = false;
  String? _error;

  String? get token => _token;
  String? get role => _role;
  String? get userId => _userId;
  String? get name => _name;
  String? get email => _email;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _token != null;

  // Load saved session on app start
  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConstants.tokenKey);
    _role = prefs.getString(AppConstants.userRoleKey);
    _userId = prefs.getString(AppConstants.userIdKey);
    _name = prefs.getString(AppConstants.userNameKey);
    _email = prefs.getString(AppConstants.userEmailKey);
    notifyListeners();
  }

  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await _api.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      await _saveSession(res.data);
      _isLoading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['message'] ?? 'Login failed. Check your connection.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Google Login
  Future<Map<String, dynamic>?> googleLogin(String credential) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await _api.post('/auth/google', data: {
        'credential': credential,
      });
      final data = res.data;
      if (data['isNewUser'] == true) {
        _isLoading = false;
        notifyListeners();
        return data; // { isNewUser: true, email, name, googleId }
      } else {
        await _saveSession(data);
        _isLoading = false;
        notifyListeners();
        return {'success': true};
      }
    } on DioException catch (e) {
      _error = e.response?.data?['message'] ?? 'Google auth failed.';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // Google Register
  Future<bool> googleRegister(Map<String, dynamic> payload) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await _api.post('/auth/google-register', data: payload);
      await _saveSession(res.data);
      _isLoading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['message'] ?? 'Google registration failed.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String role,
    String? name,
    String? companyName,
    String? wilaya,
    String? university,
    String? fieldOfStudy,
    String? academicYear,
    List<String>? skills,
    String? websiteUrl,
    String? industry,
    String? profilePicture,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final body = {
        'email': email,
        'password': password,
        'role': role,
        if (name != null) 'name': name,
        if (companyName != null) 'companyName': companyName,
        if (wilaya != null) 'wilaya': wilaya,
        if (university != null) 'university': university,
        if (fieldOfStudy != null) 'fieldOfStudy': fieldOfStudy,
        if (academicYear != null) 'academicYear': academicYear,
        if (skills != null) 'skills': skills,
        if (websiteUrl != null) 'websiteUrl': websiteUrl,
        if (industry != null) 'industry': industry,
        if (profilePicture != null) 'profilePicture': profilePicture,
      };
      await _api.post('/auth/register', data: body);
      _isLoading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      _error = e.response?.data?['message'] ?? 'Registration failed.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _token = null;
    _role = null;
    _userId = null;
    _name = null;
    _email = null;
    notifyListeners();
  }

  // Save session to SharedPreferences
  Future<void> _saveSession(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    _token = data['token'];
    
    final user = data['user'] ?? data;
    _role = user['role'];
    _userId = user['_id'] ?? user['id'];
    _name = user['name'] ?? user['companyName'] ?? user['email'];
    _email = user['email'];

    await prefs.setString(AppConstants.tokenKey, _token ?? '');
    await prefs.setString(AppConstants.userRoleKey, _role ?? '');
    await prefs.setString(AppConstants.userIdKey, _userId ?? '');
    await prefs.setString(AppConstants.userNameKey, _name ?? '');
    await prefs.setString(AppConstants.userEmailKey, _email ?? '');
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
