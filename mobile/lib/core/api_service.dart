// ============================================================
// api_service.dart - HTTP client wrapper using Dio
// ============================================================
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));

  // Add JWT token to every request
  Future<void> _addAuthHeader() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio.options.headers.remove('Authorization');
    }
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParams}) async {
    await _addAuthHeader();
    return await _dio.get(path, queryParameters: queryParams);
  }

  Future<Response> post(String path, {dynamic data}) async {
    await _addAuthHeader();
    return await _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) async {
    await _addAuthHeader();
    return await _dio.put(path, data: data);
  }

  Future<Response> delete(String path) async {
    await _addAuthHeader();
    return await _dio.delete(path);
  }
}
