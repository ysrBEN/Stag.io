// ============================================================
// google_helper.dart - Unsigned JWT helper for fallback Google Auth
// ============================================================
import 'dart:convert';

class GoogleHelper {
  static String generateMockGoogleIdToken({
    required String email,
    required String name,
    required String googleId,
  }) {
    final header = {
      'alg': 'none',
      'typ': 'JWT',
    };
    
    final payload = {
      'email': email,
      'name': name,
      'sub': googleId,
      'picture': 'https://lh3.googleusercontent.com/a/default-user',
      'email_verified': true,
    };

    final headerStr = base64Url.encode(utf8.encode(jsonEncode(header))).replaceAll('=', '');
    final payloadStr = base64Url.encode(utf8.encode(jsonEncode(payload))).replaceAll('=', '');
    
    return '$headerStr.$payloadStr.';
  }
}
